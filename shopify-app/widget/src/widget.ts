// Ommetryx-Widget: Fenster im Shadow DOM, wird vom Lader beim Klick geladen.
// Ablauf: Einwilligung (Entwurf) → Maße → Passform → Ergebnis → optional „Maße speichern“ (E-Mail + Code).
// Angemeldet: „Willkommen zurück“ → nur noch die Passform.
//
// Datenschutz: Maße bleiben im Arbeitsspeicher dieses Fensters und gehen per POST an den App Proxy.
// Im Browser wird nur nach aktiver Anmeldung der Login-Token gespeichert (localStorage dieses Shops),
// nie Maße oder E-Mail. Keine Konsolen-Ausgaben.

import { ALTERSGRUPPEN, EINWILLIGUNGEN } from "../../app/kundin/texte";
import { STIL } from "./stil";
import { FELDER, pruefeEingaben, sicherheitInWorten } from "./eingaben";
import type { Feld, Koerper, Rohwerte } from "./eingaben";

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

interface Profil extends Koerper {
  altersgruppe?: string;
}

type Schritt = "laden" | "nicht_vermessen" | "einwilligung" | "willkommen" | "masse" | "ergebnis" | "speichern" | "code" | "fehler";

const SPEICHER_SCHLUESSEL = "ommetryx-sitzung";

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[z]!);

// localStorage kann gesperrt sein (privates Fenster, Einstellungen) – dann einfach ohne Anmeldung weiter.
const tokenSpeicher = {
  lesen(): string | null {
    try {
      return window.localStorage.getItem(SPEICHER_SCHLUESSEL);
    } catch {
      return null;
    }
  },
  schreiben(token: string) {
    try {
      window.localStorage.setItem(SPEICHER_SCHLUESSEL, token);
    } catch {
      // ohne Speicher: Anmeldung gilt nur bis zum Schließen
    }
  },
  loeschen() {
    try {
      window.localStorage.removeItem(SPEICHER_SCHLUESSEL);
    } catch {
      // nichts zu tun
    }
  },
};

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
  private altersgruppe = "";
  private feldFehler: Partial<Record<Feld | "email" | "code" | "profil", string>> = {};
  private passform: Passform = "regulaer";
  private ergebnis?: Ergebnis;
  private rechnet = false;
  private vorherigerUeberlauf = "";
  /** Angemeldet: Token im Speicher und gültiges Profil auf dem Server. */
  private token: string | null = null;
  private profil?: Profil;
  private profilEinwilligung = false;
  private email = "";
  private meldung = "";
  private meinUrl: string | null = null;

  oeffnen(einstellungen: Einstellungen) {
    if (this.host) return;
    this.einstellungen = einstellungen;
    // Passform bei jedem Öffnen neu, vorbelegt „regulär“ (CLAUDE.md Abschnitt 6).
    this.passform = "regulaer";
    this.ergebnis = undefined;
    this.meldung = "";
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
    void this.starte();
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
    // Maße und Eingaben aus dem Speicher löschen.
    this.roh = {};
    this.profil = undefined;
    this.ergebnis = undefined;
    this.email = "";
    if (ruhig || !ox) return entfernen();
    ox.classList.add("schliesst");
    window.setTimeout(entfernen, 220);
  }

  // -------------------------------------------------------------------------
  // Server
  // -------------------------------------------------------------------------

  private async post<T>(pfad: string, inhalt: unknown): Promise<{ status: number; daten: T }> {
    const antwort = await fetch(`${this.einstellungen!.proxy}/${pfad}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(inhalt),
    });
    return { status: antwort.status, daten: (await antwort.json()) as T };
  }

  private async starte() {
    const e = this.einstellungen!;
    try {
      const antwort = await fetch(`${e.proxy}/artikel?produkt=${encodeURIComponent(e.produkt)}`, {
        headers: { Accept: "application/json" },
        credentials: "same-origin",
      });
      const daten = (await antwort.json()) as { vermessen?: boolean; taillePflicht?: boolean; tailleGewertet?: boolean; meinUrl?: string | null };
      if (!antwort.ok) throw new Error("Antwort");
      if (!daten.vermessen) return this.wechsle("nicht_vermessen");
      this.taillePflicht = Boolean(daten.taillePflicht);
      this.tailleGewertet = Boolean(daten.tailleGewertet);
      this.meinUrl = daten.meinUrl && daten.meinUrl.startsWith("https://") ? daten.meinUrl : null;

      this.token = tokenSpeicher.lesen();
      if (this.token) {
        const { daten: konto } = await this.post<{ angemeldet: boolean; profil?: Profil | null }>("konto", {
          aktion: "profil_laden",
          token: this.token,
        });
        if (konto.angemeldet && konto.profil) {
          this.profil = konto.profil;
          this.uebernimmProfil(konto.profil);
          return this.wechsle("willkommen");
        }
        this.token = null;
        tokenSpeicher.loeschen();
      }
      this.wechsle(this.einwilligung ? "masse" : "einwilligung");
    } catch {
      this.wechsle("fehler");
    }
  }

  private uebernimmProfil(p: Profil) {
    this.roh = {
      koerpergroesse: String(p.koerpergroesse).replace(".", ","),
      brust: String(p.brust).replace(".", ","),
      huefte: String(p.huefte).replace(".", ","),
      ...(p.taille ? { taille: String(p.taille).replace(".", ",") } : {}),
    };
    this.altersgruppe = p.altersgruppe ?? "";
  }

  private async bestaetigeEinwilligung() {
    try {
      const { status } = await this.post("einwilligung", { version: EINWILLIGUNGEN.verarbeitung.version, mindestens16: true });
      if (status !== 200) throw new Error("Antwort");
      this.wechsle("masse");
    } catch {
      this.wechsle("fehler");
    }
  }

  /** Rechnet die Empfehlung. Angemeldet ohne neue Eingabe: mit dem gespeicherten Profil (nur Token). */
  private async rechne(mitEingaben: boolean) {
    let koerper: Koerper | undefined;
    if (mitEingaben) {
      const pruefung = pruefeEingaben(this.roh, this.taillePflicht);
      if (!pruefung.ok) {
        this.feldFehler = pruefung.fehler;
        this.zeichne();
        const erstes = FELDER.find((f) => pruefung.fehler[f.feld]);
        if (erstes) this.wurzel?.getElementById(`ox-${erstes.feld}`)?.focus();
        return;
      }
      koerper = pruefung.koerper;
    }
    this.feldFehler = {};
    this.rechnet = true;
    this.zeichne();
    try {
      // Angemeldet und Maße geändert: Profil überschreiben (keine Historie).
      if (koerper && this.token && this.profil) {
        const profil = this.mitAltersgruppe(koerper);
        const { status } = await this.post("konto", { aktion: "profil_speichern", token: this.token, profil });
        if (status === 200) this.profil = profil;
      }
      const inhalt = koerper ? { koerper } : { token: this.token };
      const { status, daten } = await this.post<Ergebnis>("empfehlung", { produkt: this.einstellungen!.produkt, passform: this.passform, ...inhalt });
      if (status === 401) {
        this.abgemeldet();
        return this.wechsle("einwilligung");
      }
      if (status !== 200) throw new Error("Antwort");
      this.ergebnis = daten;
      this.rechnet = false;
      this.wechsle("ergebnis");
      this.sage(this.ansageText());
    } catch {
      this.rechnet = false;
      this.wechsle("fehler");
    }
  }

  private mitAltersgruppe(k: Koerper): Profil {
    return { ...k, ...(this.altersgruppe ? { altersgruppe: this.altersgruppe } : {}) };
  }

  private async fordereCodeAn() {
    const feld = this.wurzel?.getElementById("ox-email") as HTMLInputElement | null;
    this.email = (feld?.value ?? this.email).trim();
    this.feldFehler = {};
    if (!this.profilEinwilligung) this.feldFehler.profil = "Bitte bestätigen Sie die Einwilligung, damit wir Ihre Maße speichern dürfen.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) this.feldFehler.email = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    if (Object.keys(this.feldFehler).length > 0) return this.zeichne();
    try {
      const { status } = await this.post("konto", { aktion: "code_anfordern", email: this.email });
      if (status !== 200) throw new Error("Antwort");
      this.meldung = "";
      this.wechsle("code");
    } catch {
      this.wechsle("fehler");
    }
  }

  private async pruefeCode(code: string) {
    const pruefung = pruefeEingaben(this.roh, this.taillePflicht);
    try {
      const { status, daten } = await this.post<{ ok?: boolean; token?: string }>("konto", {
        aktion: "code_pruefen",
        email: this.email,
        code,
        einwilligung: { version: EINWILLIGUNGEN.profil.version, mindestens16: true },
        ...(pruefung.ok ? { profil: this.mitAltersgruppe(pruefung.koerper) } : {}),
      });
      if (status === 401) {
        this.feldFehler = { code: "Der Code stimmt nicht oder ist abgelaufen. Bitte prüfen Sie ihn oder fordern Sie einen neuen an." };
        return this.zeichne();
      }
      if (status !== 200 || !daten.token) throw new Error("Antwort");
      this.token = daten.token;
      tokenSpeicher.schreiben(daten.token);
      if (pruefung.ok) this.profil = this.mitAltersgruppe(pruefung.koerper);
      this.email = "";
      this.meldung = "Ihre Maße sind gespeichert. Beim nächsten Mal wählen Sie nur noch die Passform.";
      this.wechsle("ergebnis");
      this.sage(this.meldung);
    } catch {
      this.wechsle("fehler");
    }
  }

  private async melddeAb() {
    const token = this.token;
    this.abgemeldet();
    if (token) {
      try {
        await this.post("konto", { aktion: "abmelden", token });
      } catch {
        // lokal ist schon abgemeldet
      }
    }
    this.roh = {};
    this.einwilligung = false;
    this.alter16 = false;
    this.wechsle("einwilligung");
  }

  private abgemeldet() {
    this.token = null;
    this.profil = undefined;
    tokenSpeicher.loeschen();
  }

  // -------------------------------------------------------------------------
  // Ereignisse
  // -------------------------------------------------------------------------

  private beiKlick(e: Event) {
    const ziel = (e.target as HTMLElement).closest<HTMLElement>("[data-aktion]");
    if (!ziel) return;
    switch (ziel.dataset.aktion) {
      case "schliessen":
        return this.schliessen();
      case "zur-einwilligung-weiter":
        if (this.einwilligung && this.alter16) void this.bestaetigeEinwilligung();
        return;
      case "masse-aendern":
        return this.wechsle("masse");
      case "erneut":
        this.wechsle("laden");
        return void this.starte();
      case "willkommen-rechnen":
        return void this.rechne(false);
      case "speichern":
        this.feldFehler = {};
        return this.wechsle("speichern");
      case "code-senden":
        return void this.fordereCodeAn();
      case "code-erneut":
        this.meldung = "Wir haben Ihnen einen neuen Code geschickt.";
        return void this.fordereCodeAn();
      case "andere-email":
        return this.wechsle("speichern");
      case "abmelden":
        return void this.melddeAb();
    }
  }

  private beiAenderung(e: Event) {
    const feld = e.target as HTMLInputElement | HTMLSelectElement;
    if (feld instanceof HTMLInputElement && feld.name === "einwilligung") this.einwilligung = feld.checked;
    if (feld instanceof HTMLInputElement && feld.name === "alter16") this.alter16 = feld.checked;
    if (feld instanceof HTMLInputElement && feld.name === "profil-einwilligung") this.profilEinwilligung = feld.checked;
    if (feld.name === "einwilligung" || feld.name === "alter16") {
      const weiter = this.wurzel?.querySelector<HTMLButtonElement>("[data-aktion='zur-einwilligung-weiter']");
      if (weiter) weiter.disabled = !(this.einwilligung && this.alter16);
    }
    if (feld.name === "altersgruppe") this.altersgruppe = feld.value;
    if (feld.name === "passform") {
      this.passform = feld.value as Passform;
      // Im Ergebnis rechnet der Umschalter sofort neu (angemeldet mit dem Profil).
      if (this.schritt === "ergebnis") void this.rechne(!this.token);
    }
  }

  private beiAbsenden(e: Event) {
    e.preventDefault();
    const formular = e.target as HTMLFormElement;
    if (formular.dataset.formular === "code") {
      const code = (formular.elements.namedItem("code") as HTMLInputElement).value;
      return void this.pruefeCode(code);
    }
    if (formular.dataset.formular === "speichern") return void this.fordereCodeAn();
    for (const { feld } of FELDER) {
      const eingabe = formular.elements.namedItem(feld) as HTMLInputElement | null;
      if (eingabe) this.roh[feld] = eingabe.value;
    }
    void this.rechne(true);
  }

  private beiTaste(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      this.schliessen();
      return;
    }
    if (e.key !== "Tab" || !this.wurzel) return;
    // Fokus bleibt im Fenster.
    const fokussierbar = [...this.wurzel.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), select, [tabindex='-1']")].filter(
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
      case "willkommen":
        return this.htmlWillkommen();
      case "masse":
        return this.htmlMasse();
      case "ergebnis":
        return this.htmlErgebnis();
      case "speichern":
        return this.htmlSpeichern();
      case "code":
        return this.htmlCode();
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
          <span>${escape(EINWILLIGUNGEN.verarbeitung.text)}</span>
        </label>
        <label class="wahl">
          <input type="checkbox" name="alter16" ${this.alter16 ? "checked" : ""} />
          <span>${escape(EINWILLIGUNGEN.alter16.text)}</span>
        </label>
      </div>
      <button type="button" class="primaer" data-aktion="zur-einwilligung-weiter" ${bereit ? "" : "disabled"}>Weiter</button>
      <button type="button" class="link" data-aktion="schliessen">Ohne Einwilligung: Größentabelle des Shops nutzen</button>`;
  }

  private htmlWillkommen() {
    return `<h2 id="ox-titel" tabindex="-1">Willkommen zurück</h2>
      <p>Ihre Maße sind gespeichert. Wählen Sie nur noch, wie dieses Teil sitzen soll.</p>
      <form novalidate data-formular="willkommen">${this.htmlPassform()}</form>
      <button type="button" class="primaer" data-aktion="willkommen-rechnen" ${this.rechnet ? "disabled" : ""}>${this.rechnet ? "Wird berechnet …" : "Größe berechnen"}</button>
      <button type="button" class="sekundaer" data-aktion="masse-aendern">Maße ändern</button>
      ${this.meinLink()}
      <button type="button" class="link" data-aktion="abmelden">Abmelden</button>`;
  }

  /** Link zu „Mein Ommetryx“ (Maße ändern, Einwilligungen widerrufen, Daten herunterladen, löschen). */
  private meinLink() {
    if (!this.meinUrl) return "";
    return `<a class="link" style="display:block" href="${escape(this.meinUrl)}" target="_blank" rel="noopener noreferrer">Mein Ommetryx: Daten ansehen, ändern oder löschen<span class="nur-vorleser"> (öffnet in neuem Tab)</span></a>`;
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
      <form novalidate data-formular="masse">
        ${this.htmlFeld("koerpergroesse", "Körpergröße", "")}
        ${this.htmlFeld("brust", "Brustumfang", "")}
        ${this.htmlFeld("huefte", "Hüftumfang", "")}
        ${this.tailleGewertet || this.taillePflicht ? this.htmlFeld("taille", "Taillenumfang", taille) : ""}
        <div class="feld">
          <label for="ox-altersgruppe">Altersgruppe (optional)</label>
          <select id="ox-altersgruppe" name="altersgruppe">
            <option value="">Keine Angabe</option>
            ${ALTERSGRUPPEN.map((g) => `<option value="${g}" ${this.altersgruppe === g ? "selected" : ""}>${g} Jahre</option>`).join("")}
          </select>
        </div>
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

    const konto = this.token
      ? `${this.meldung ? `<p class="karte" role="status">${escape(this.meldung)}</p>` : `<p class="leise">Ihre Maße sind gespeichert.</p>`}
         ${this.meinLink()}
         <button type="button" class="link" data-aktion="abmelden">Abmelden</button>`
      : `<button type="button" class="sekundaer" data-aktion="speichern">Maße für den nächsten Einkauf speichern</button>`;

    return `<h2 id="ox-titel" tabindex="-1">Ihre Empfehlung</h2>
      ${kopf}
      <form novalidate data-formular="ergebnis">${this.htmlPassform()}</form>
      ${this.rechnet ? `<p class="leise">Wird neu berechnet …</p>` : ""}
      <button type="button" class="primaer" data-aktion="schliessen">Fertig</button>
      <button type="button" class="sekundaer" data-aktion="masse-aendern">Maße ändern</button>
      ${konto}`;
  }

  private htmlSpeichern() {
    const f = this.feldFehler;
    return `<h2 id="ox-titel" tabindex="-1">Maße speichern</h2>
      <span class="entwurf">Entwurf · Text wird noch rechtlich geprüft</span>
      <p>Mit einem Profil müssen Sie beim nächsten Einkauf nicht neu messen – auch in anderen Shops mit Ommetryx. Sie melden sich ohne Passwort an: Wir schicken Ihnen einen Code per E-Mail.</p>
      <form novalidate data-formular="speichern">
        <div class="karte">
          <label class="wahl">
            <input type="checkbox" name="profil-einwilligung" ${this.profilEinwilligung ? "checked" : ""} ${f.profil ? `aria-invalid="true" aria-describedby="ox-profil-fehler"` : ""} />
            <span>${escape(EINWILLIGUNGEN.profil.text)}</span>
          </label>
          ${f.profil ? `<span class="fehler" id="ox-profil-fehler">${escape(f.profil)}</span>` : ""}
        </div>
        <div class="feld">
          <label for="ox-email">E-Mail-Adresse</label>
          <input id="ox-email" name="email" type="email" inputmode="email" autocomplete="email" value="${escape(this.email)}"
            ${f.email ? `aria-invalid="true" aria-describedby="ox-email-fehler"` : ""} />
          ${f.email ? `<span class="fehler" id="ox-email-fehler">${escape(f.email)}</span>` : ""}
        </div>
        <button type="submit" class="primaer">Code senden</button>
      </form>
      <button type="button" class="sekundaer" data-aktion="masse-aendern">Zurück</button>`;
  }

  private htmlCode() {
    const f = this.feldFehler;
    return `<h2 id="ox-titel" tabindex="-1">Code eingeben</h2>
      <p>Wir haben einen 6-stelligen Code an <strong>${escape(this.email)}</strong> geschickt. Er ist 10 Minuten gültig.</p>
      ${this.meldung ? `<p class="leise" role="status">${escape(this.meldung)}</p>` : ""}
      <form novalidate data-formular="code">
        <div class="feld">
          <label for="ox-code">Code aus der E-Mail</label>
          <input id="ox-code" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="7"
            ${f.code ? `aria-invalid="true" aria-describedby="ox-code-fehler"` : ""} />
          ${f.code ? `<span class="fehler" id="ox-code-fehler">${escape(f.code)}</span>` : ""}
        </div>
        <button type="submit" class="primaer">Bestätigen</button>
      </form>
      <button type="button" class="link" data-aktion="code-erneut">Code erneut senden</button>
      <button type="button" class="link" data-aktion="andere-email">Andere E-Mail-Adresse verwenden</button>`;
  }
}

const widget = new Widget();
(window as unknown as { OmmetryxWidget: { oeffnen: (e: Einstellungen) => void } }).OmmetryxWidget = {
  oeffnen: (e) => widget.oeffnen(e),
};
