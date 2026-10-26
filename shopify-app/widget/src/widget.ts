// Ommetryx-Widget: Fenster im Shadow DOM, wird vom Lader beim Klick geladen.
// Ablauf (Etappe 6): Einwilligung (Entwurf) → Maße → Passform → Ergebnis.
//
// Datenschutz: Maße bleiben nur im Arbeitsspeicher dieses Fensters, werden per POST an den
// App Proxy geschickt und nirgends im Browser gespeichert. Keine Konsolen-Ausgaben.

import { STIL } from "./stil";
import { FELDER, pruefeEingaben, sicherheitInWorten } from "./eingaben";
import type { Feld, Rohwerte } from "./eingaben";

type Passform = "koerpernah" | "regulaer" | "locker" | "oversized";
const PASSFORMEN: [Passform, string][] = [
  ["koerpernah", "körpernah"],
  ["regulaer", "regulär"],
  ["locker", "locker"],
  ["oversized", "oversized"],
];

interface Einstellungen {
  produkt: string;
  proxy: string;
  ausloeser?: HTMLElement;
}

interface Ergebnis {
  recommended_size: string | null;
  confidence: number;
  alternative_size: string | null;
  status: "empfohlen" | "unsicher" | "keine_passende_groesse";
  begrenzt_durch_schnitt: boolean;
}

type Schritt = "laden" | "nicht_vermessen" | "einwilligung" | "masse" | "ergebnis" | "fehler";

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[z]!);

class Widget {
  private host?: HTMLElement;
  private wurzel?: ShadowRoot;
  private einstellungen?: Einstellungen;
  private schritt: Schritt = "laden";
  private taillePflicht = false;
  private tailleGewertet = false;
  private einwilligung = false;
  private alter16 = false;
  private roh: Rohwerte = {};
  private feldFehler: Partial<Record<Feld, string>> = {};
  private passform: Passform = "regulaer";
  private ergebnis?: Ergebnis;
  private rechnet = false;
  private vorherigerUeberlauf = "";

  oeffnen(einstellungen: Einstellungen) {
    if (this.host) return;
    this.einstellungen = einstellungen;
    // Passform bei jedem Öffnen neu, vorbelegt „regulär“ (CLAUDE.md Abschnitt 6).
    this.passform = "regulaer";
    this.ergebnis = undefined;
    this.schritt = "laden";

    // Eigenes Element statt <div>: Viele Themes (z. B. Dawn) haben „div:empty { display: none }“,
    // und ein Shadow-Host gilt für das Theme als leer. Die Inline-Regel schützt vor weiteren Theme-Stilen.
    this.host = document.createElement("ommetryx-widget");
    this.host.id = "ommetryx-widget";
    this.host.setAttribute("style", "display:block !important; position:static !important;");
    this.wurzel = this.host.attachShadow({ mode: "open" });
    this.wurzel.innerHTML = `<style>${STIL}</style>
      <div class="ox" lang="de">
        <div class="abdunklung" data-aktion="schliessen"></div>
        <div class="fenster" role="dialog" aria-modal="true" aria-labelledby="ox-titel">
          <div class="kopf">
            <span class="marke">Ommetryx · Größenberatung</span>
            <button type="button" class="schliessen" data-aktion="schliessen" aria-label="Größenberatung schließen">×</button>
          </div>
          <div class="inhalt" data-inhalt></div>
          <div class="nur-vorleser" aria-live="polite" data-ansage></div>
        </div>
      </div>`;
    document.body.appendChild(this.host);
    this.vorherigerUeberlauf = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    this.wurzel.addEventListener("click", (e) => this.beiKlick(e));
    this.wurzel.addEventListener("change", (e) => this.beiAenderung(e));
    this.wurzel.addEventListener("submit", (e) => this.beiAbsenden(e));
    this.wurzel.addEventListener("keydown", (e) => this.beiTaste(e as KeyboardEvent));

    this.zeichne();
    void this.ladeArtikel();
  }

  private schliessen() {
    const host = this.host;
    if (!host || !this.wurzel) return;
    const ox = this.wurzel.querySelector(".ox");
    const ruhig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const entfernen = () => {
      host.remove();
      document.documentElement.style.overflow = this.vorherigerUeberlauf;
      this.einstellungen?.ausloeser?.focus();
    };
    this.host = undefined;
    this.wurzel = undefined;
    // Maße aus dem Speicher löschen.
    this.roh = {};
    this.ergebnis = undefined;
    if (ruhig || !ox) return entfernen();
    ox.classList.add("schliesst");
    window.setTimeout(entfernen, 220);
  }

  // -------------------------------------------------------------------------
  // Server
  // -------------------------------------------------------------------------

  private async ladeArtikel() {
    const e = this.einstellungen!;
    try {
      const antwort = await fetch(`${e.proxy}/artikel?produkt=${encodeURIComponent(e.produkt)}`, {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      });
      const daten = (await antwort.json()) as { vermessen?: boolean; taillePflicht?: boolean; tailleGewertet?: boolean };
      if (!antwort.ok) throw new Error("Antwort");
      if (!daten.vermessen) return this.wechsle("nicht_vermessen");
      this.taillePflicht = Boolean(daten.taillePflicht);
      this.tailleGewertet = Boolean(daten.tailleGewertet);
      this.wechsle(this.einwilligung ? "masse" : "einwilligung");
    } catch {
      this.wechsle("fehler");
    }
  }

  private async rechne() {
    const pruefung = pruefeEingaben(this.roh, this.taillePflicht);
    if (!pruefung.ok) {
      this.feldFehler = pruefung.fehler;
      this.zeichne();
      const erstes = FELDER.find((f) => pruefung.fehler[f.feld]);
      if (erstes) this.wurzel?.getElementById(`ox-${erstes.feld}`)?.focus();
      return;
    }
    this.feldFehler = {};
    this.rechnet = true;
    this.zeichne();
    const e = this.einstellungen!;
    try {
      const antwort = await fetch(`${e.proxy}/empfehlung`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ produkt: e.produkt, passform: this.passform, koerper: pruefung.koerper }),
      });
      if (!antwort.ok) throw new Error("Antwort");
      this.ergebnis = (await antwort.json()) as Ergebnis;
      this.rechnet = false;
      this.wechsle("ergebnis");
      this.sage(this.ansageText());
    } catch {
      this.rechnet = false;
      this.wechsle("fehler");
    }
  }

  // -------------------------------------------------------------------------
  // Ereignisse
  // -------------------------------------------------------------------------

  private beiKlick(e: Event) {
    const ziel = (e.target as HTMLElement).closest<HTMLElement>("[data-aktion]");
    if (!ziel) return;
    const aktion = ziel.dataset.aktion;
    if (aktion === "schliessen") this.schliessen();
    if (aktion === "zur-einwilligung-weiter" && this.einwilligung && this.alter16) this.wechsle("masse");
    if (aktion === "masse-aendern") this.wechsle("masse");
    if (aktion === "erneut") {
      this.wechsle("laden");
      void this.ladeArtikel();
    }
  }

  private beiAenderung(e: Event) {
    const feld = e.target as HTMLInputElement;
    if (feld.name === "einwilligung") this.einwilligung = feld.checked;
    if (feld.name === "alter16") this.alter16 = feld.checked;
    if (feld.name === "einwilligung" || feld.name === "alter16") {
      const weiter = this.wurzel?.querySelector<HTMLButtonElement>("[data-aktion='zur-einwilligung-weiter']");
      if (weiter) weiter.disabled = !(this.einwilligung && this.alter16);
    }
    if (feld.name === "passform") {
      this.passform = feld.value as Passform;
      // Im Ergebnis rechnet der Umschalter sofort neu.
      if (this.schritt === "ergebnis") void this.rechne();
    }
  }

  private beiAbsenden(e: Event) {
    e.preventDefault();
    const formular = e.target as HTMLFormElement;
    for (const { feld } of FELDER) {
      const eingabe = formular.elements.namedItem(feld) as HTMLInputElement | null;
      if (eingabe) this.roh[feld] = eingabe.value;
    }
    void this.rechne();
  }

  private beiTaste(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      this.schliessen();
      return;
    }
    if (e.key !== "Tab" || !this.wurzel) return;
    // Fokus bleibt im Fenster.
    const fokussierbar = [...this.wurzel.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), [tabindex='-1']")].filter(
      (el) => el.offsetParent !== null || el.tagName === "H2",
    );
    const erstes = fokussierbar[0];
    const letztes = fokussierbar[fokussierbar.length - 1];
    const aktiv = this.wurzel.activeElement;
    if (e.shiftKey && (aktiv === erstes || aktiv?.tagName === "H2")) {
      e.preventDefault();
      letztes?.focus();
    } else if (!e.shiftKey && aktiv === letztes) {
      e.preventDefault();
      erstes?.focus();
    }
  }

  // -------------------------------------------------------------------------
  // Darstellung
  // -------------------------------------------------------------------------

  private wechsle(schritt: Schritt) {
    this.schritt = schritt;
    this.zeichne();
    this.wurzel?.querySelector<HTMLElement>("h2")?.focus();
  }

  private sage(text: string) {
    const ansage = this.wurzel?.querySelector("[data-ansage]");
    if (ansage) ansage.textContent = text;
  }

  private ansageText() {
    const r = this.ergebnis;
    if (!r) return "";
    if (r.status === "empfohlen" && r.recommended_size) {
      return `Empfohlene Größe ${r.recommended_size}, Passform ${PASSFORMEN.find(([p]) => p === this.passform)?.[1]}.`;
    }
    return "Keine sichere Größenempfehlung möglich.";
  }

  private zeichne() {
    const inhalt = this.wurzel?.querySelector<HTMLElement>("[data-inhalt]");
    if (!inhalt) return;
    inhalt.innerHTML = this.html();
  }

  private html(): string {
    switch (this.schritt) {
      case "laden":
        return `<h2 id="ox-titel" tabindex="-1">Einen Moment …</h2><p class="leise">Die Größenberatung wird geladen.</p>`;
      case "nicht_vermessen":
        return `<h2 id="ox-titel" tabindex="-1">Für diesen Artikel gibt es noch keine Größenberatung</h2>
          <p>Bitte nutzen Sie die Größentabelle des Shops.</p>
          <button type="button" class="primaer" data-aktion="schliessen">Schließen</button>`;
      case "fehler":
        return `<h2 id="ox-titel" tabindex="-1">Die Größenberatung ist gerade nicht erreichbar</h2>
          <p>Bitte versuchen Sie es gleich noch einmal oder nutzen Sie die Größentabelle des Shops.</p>
          <button type="button" class="primaer" data-aktion="erneut">Noch einmal versuchen</button>
          <button type="button" class="sekundaer" data-aktion="schliessen">Schließen</button>`;
      case "einwilligung":
        return this.htmlEinwilligung();
      case "masse":
        return this.htmlMasse();
      case "ergebnis":
        return this.htmlErgebnis();
    }
  }

  private htmlEinwilligung() {
    const bereit = this.einwilligung && this.alter16;
    return `<h2 id="ox-titel" tabindex="-1">Ihre Größe in wenigen Schritten</h2>
      <span class="entwurf">Entwurf · Text wird noch rechtlich geprüft</span>
      <p>Ommetryx vergleicht Ihre Körpermaße mit den gemessenen Maßen dieses Kleidungsstücks und empfiehlt Ihnen eine Größe.</p>
      <div class="karte">
        <label class="wahl">
          <input type="checkbox" name="einwilligung" ${this.einwilligung ? "checked" : ""} />
          <span>Ich willige ein, dass Ommetryx meine Körpermaße verarbeitet, um mir eine Größe zu empfehlen. Körpermaße können Rückschlüsse auf meine Gesundheit zulassen. Die Maße werden nicht gespeichert. Ich kann die Einwilligung jederzeit widerrufen.</span>
        </label>
        <label class="wahl">
          <input type="checkbox" name="alter16" ${this.alter16 ? "checked" : ""} />
          <span>Ich bin mindestens 16 Jahre alt.</span>
        </label>
      </div>
      <button type="button" class="primaer" data-aktion="zur-einwilligung-weiter" ${bereit ? "" : "disabled"}>Weiter</button>
      <button type="button" class="link" data-aktion="schliessen">Ohne Einwilligung: Größentabelle des Shops nutzen</button>`;
  }

  private htmlFeld(feld: Feld, beschriftung: string, zusatz: string) {
    const fehler = this.feldFehler[feld];
    const id = `ox-${feld}`;
    return `<div class="feld">
        <label for="${id}">${beschriftung} in cm${zusatz}</label>
        <input id="${id}" name="${feld}" inputmode="decimal" autocomplete="off" value="${escape(this.roh[feld] ?? "")}"
          ${fehler ? `aria-invalid="true" aria-describedby="${id}-fehler"` : ""} />
        ${fehler ? `<span class="fehler" id="${id}-fehler">${escape(fehler)}</span>` : ""}
      </div>`;
  }

  private htmlPassform() {
    return `<fieldset>
        <legend>Wie soll dieses Teil sitzen?</legend>
        <div class="chips" role="radiogroup">
          ${PASSFORMEN.map(
            ([wert, text]) => `<label class="chip"><input type="radio" name="passform" value="${wert}" ${this.passform === wert ? "checked" : ""} /><span>${text}</span></label>`,
          ).join("")}
        </div>
      </fieldset>`;
  }

  private htmlMasse() {
    const taille = this.taillePflicht ? "" : " (empfohlen)";
    return `<h2 id="ox-titel" tabindex="-1">Ihre Maße</h2>
      <p class="leise">Messen Sie mit einem Maßband, am besten zu zweit. Normal ausatmen, Band nicht straff ziehen.</p>
      <form novalidate>
        ${this.htmlFeld("koerpergroesse", "Körpergröße", "")}
        ${this.htmlFeld("brust", "Brustumfang", "")}
        ${this.htmlFeld("huefte", "Hüftumfang", "")}
        ${this.tailleGewertet || this.taillePflicht ? this.htmlFeld("taille", "Taillenumfang", taille) : ""}
        ${this.htmlPassform()}
        <button type="submit" class="primaer" ${this.rechnet ? "disabled" : ""}>${this.rechnet ? "Wird berechnet …" : "Größe berechnen"}</button>
      </form>`;
  }

  private htmlErgebnis() {
    const r = this.ergebnis!;
    const kopf =
      r.status === "empfohlen" && r.recommended_size
        ? `<div class="ergebnis">
            <div class="kreis" aria-hidden="true">${escape(r.recommended_size)}</div>
            <div><strong>Größe ${escape(r.recommended_size)}</strong><span class="leise">Sicherheit: ${sicherheitInWorten(r.confidence)}</span></div>
          </div>
          ${r.alternative_size ? `<p>Sie liegen zwischen zwei Größen. ${escape(r.alternative_size)} passt fast genauso gut.</p>` : ""}
          ${r.begrenzt_durch_schnitt ? `<p class="leise">Dieser Artikel ist anders geschnitten als Ihre Wahl. Wir haben die Empfehlung daran angepasst.</p>` : ""}`
        : r.status === "keine_passende_groesse"
          ? `<p>Leider passt Ihnen keine der verfügbaren Größen gut genug. Bitte nutzen Sie die Größentabelle des Shops.</p>`
          : `<p>Für Ihre Maße können wir bei diesem Artikel keine sichere Größe empfehlen. Bitte nutzen Sie die Größentabelle des Shops.</p>`;

    return `<h2 id="ox-titel" tabindex="-1">Ihre Empfehlung</h2>
      ${kopf}
      <form novalidate>${this.htmlPassform()}</form>
      ${this.rechnet ? `<p class="leise">Wird neu berechnet …</p>` : ""}
      <button type="button" class="primaer" data-aktion="schliessen">Fertig</button>
      <button type="button" class="sekundaer" data-aktion="masse-aendern">Maße ändern</button>`;
  }
}

const widget = new Widget();
(window as unknown as { OmmetryxWidget: { oeffnen: (e: Einstellungen) => void } }).OmmetryxWidget = {
  oeffnen: (e) => widget.oeffnen(e),
};
