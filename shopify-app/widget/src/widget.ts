// Ommetryx-Widget: Fenster im Shadow DOM, wird vom Lader beim Klick geladen.
// Ablauf: Einwilligung (Entwurf) → Mess-Schritte (je ein Maß, Tipp, Plausibilität) → Passform
//         → Ladebildschirm → Ergebnis → optional „Maße speichern“ (E-Mail + Code).
// Angemeldet: „Willkommen zurück“ → Passform → kurzer Ladebildschirm → Ergebnis.
// Vorlagen: Figma „Design v1 · Endkunde“ E03–E06, E09/E09b/E10, E17, E34, E36/E36b, E37, E38
// und die Bewegungs-Spezifikation.
//
// Datenschutz: Maße bleiben im Arbeitsspeicher dieses Fensters und gehen per POST an den App Proxy.
// Im Browser wird nur nach aktiver Anmeldung der Login-Token gespeichert (localStorage dieses Shops),
// nie Maße oder E-Mail. Keine Konsolen-Ausgaben.

import { ALTERSGRUPPEN, EINWILLIGUNGEN } from "../../app/kundin/texte";
import { STIL } from "./stil";
import { FELDER, alsZahl, pruefeEingaben } from "./eingaben";
import {
  begrenztSatz,
  bewertungText,
  entscheidungshilfe,
  groessenKurz,
  kurzSatz,
  passformWort,
  sicherheitText,
  skalaProzent,
  spielraumText,
  vergleichSatz,
  warumSatz,
  zonenName,
} from "./ergebnis";
import type { GroessenAnsicht, WidgetErgebnis, Zone } from "./ergebnis";
import type { Feld, Koerper, Rohwerte } from "./eingaben";
import { logoHtml } from "./logo";
import { pruefePlausibel } from "./plausi";
import { silhouette } from "./silhouette";
import type { Hinweis, PlausiKonfig } from "./plausi";
import { MESS_HINWEIS, SCHRITTE } from "./texte";

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

type Ergebnis = WidgetErgebnis;

interface Profil extends Koerper {
  altersgruppe?: string;
}

type Schritt =
  | "laden"
  | "nicht_vermessen"
  | "einwilligung"
  | "willkommen"
  | "messen"
  | "passform"
  | "berechnung"
  | "ergebnis"
  | "speichern"
  | "code"
  | "fehler";

const SPEICHER_SCHLUESSEL = "ommetryx-sitzung";
const STANDARD_PLAUSI: PlausiKonfig = { abweichung_cm: 6, huefte_minus_brust_cm: 8, brust_minus_taille_cm: 16 };

// Ordner der Widget-Dateien (Schrift, Logo) – derselbe wie der dieses Skripts.
const BASIS = (() => {
  const skript = document.currentScript as HTMLScriptElement | null;
  return skript?.src ? skript.src.replace(/[?#].*$/, "").replace(/[^/]*$/, "") : "";
})();

/**
 * Die Schrift muss im Dokument angemeldet werden; @font-face im Shadow DOM greift in Chrome nicht.
 * Sora steckt eingebettet in ommetryx-schrift.css (Theme-Erweiterungen erlauben keine .woff2-Dateien)
 * und lädt erst beim Öffnen des Widgets.
 */
function ladeSchrift() {
  if (!BASIS || document.getElementById("ommetryx-schrift")) return;
  const link = document.createElement("link");
  link.id = "ommetryx-schrift";
  link.rel = "stylesheet";
  link.href = `${BASIS}ommetryx-schrift.css`;
  document.head.appendChild(link);
}

const escape = (text: string) =>
  text.replace(/[&<>"']/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[z]!);
const warte = (ms: number) => new Promise((fertig) => window.setTimeout(fertig, ms));
const ruhig = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  private plausi: PlausiKonfig = STANDARD_PLAUSI;
  private einwilligung = false;
  private alter16 = false;
  private roh: Rohwerte = {};
  private altersgruppe = "";
  private feldFehler: Partial<Record<Feld | "email" | "code" | "profil", string>> = {};
  private passform: Passform = "regulaer";
  private ergebnis?: Ergebnis;
  private vorherigerUeberlauf = "";
  private token: string | null = null;
  private profil?: Profil;
  private profilEinwilligung = false;
  private email = "";
  private meldung = "";
  private meinUrl: string | null = null;
  // Mess-Schritte
  private messIndex = 0;
  private hinweis: { feld: Feld; hinweis: NonNullable<Hinweis> } | null = null;
  /** „Stimmt so“ bestätigte Werte je Feld – bei gleichem Wert nicht noch einmal nachfragen. */
  private bestaetigt: Partial<Record<Feld, string>> = {};
  // Ladebildschirm
  private abbruch?: AbortController;
  private zurueckNachAbbruch: Schritt = "passform";
  private reveal = false;
  // Ergebnis: welche Größe die Ansicht zeigt, aufgeklappte Bereiche, Ändern eines einzelnen Maßes
  private ansicht: "haupt" | "vergleich" = "haupt";
  private detailsOffen = false;
  /** Neues Ergebnis gibt vor, ob die Zonen aufgeklappt sind (sonst bleibt der bisherige Zustand). */
  private detailsVorgabe: boolean | null = null;
  private angabenOffen = false;
  private einzelAenderung = false;
  /** Maße vor dem Ändern eines einzelnen Werts, für „Zurück“ ohne Änderung. */
  private sicherung?: Rohwerte;

  oeffnen(einstellungen: Einstellungen) {
    if (this.host) return;
    ladeSchrift();
    this.einstellungen = einstellungen;
    // Passform bei jedem Öffnen neu, vorbelegt „regulär“ (CLAUDE.md Abschnitt 6).
    this.passform = "regulaer";
    this.ergebnis = undefined;
    this.meldung = "";
    this.hinweis = null;
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
          <div data-kopf></div>
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
    this.abbruch?.abort();
    const ox = this.wurzel.querySelector(".ox");
    const entfernen = () => {
      host.remove();
      document.documentElement.style.overflow = this.vorherigerUeberlauf;
      this.einstellungen?.ausloeser?.focus();
    };
    this.host = undefined;
    this.wurzel = undefined;
    // Maße und Eingaben aus dem Speicher löschen.
    this.roh = {};
    this.sicherung = undefined;
    this.einzelAenderung = false;
    this.bestaetigt = {};
    this.profil = undefined;
    this.ergebnis = undefined;
    this.email = "";
    if (ruhig() || !ox) return entfernen();
    ox.classList.add("schliesst");
    window.setTimeout(entfernen, 220);
  }

  // -------------------------------------------------------------------------
  // Server
  // -------------------------------------------------------------------------

  private async post<T>(pfad: string, inhalt: unknown, signal?: AbortSignal): Promise<{ status: number; daten: T }> {
    const antwort = await fetch(`${this.einstellungen!.proxy}/${pfad}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(inhalt),
      signal,
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
      const daten = (await antwort.json()) as {
        vermessen?: boolean;
        taillePflicht?: boolean;
        tailleGewertet?: boolean;
        meinUrl?: string | null;
        plausibilitaet?: PlausiKonfig;
      };
      if (!antwort.ok) throw new Error("Antwort");
      if (!daten.vermessen) return this.wechsle("nicht_vermessen");
      this.taillePflicht = Boolean(daten.taillePflicht);
      this.tailleGewertet = Boolean(daten.tailleGewertet);
      this.meinUrl = daten.meinUrl && daten.meinUrl.startsWith("https://") ? daten.meinUrl : null;
      if (daten.plausibilitaet) this.plausi = daten.plausibilitaet;

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
      this.wechsle(this.einwilligung ? "messen" : "einwilligung");
    } catch {
      this.wechsle("fehler");
    }
  }

  private uebernimmProfil(p: Profil) {
    const komma = (n: number) => String(n).replace(".", ",");
    this.roh = {
      koerpergroesse: komma(p.koerpergroesse),
      brust: komma(p.brust),
      huefte: komma(p.huefte),
      ...(p.taille ? { taille: komma(p.taille) } : {}),
    };
    this.altersgruppe = p.altersgruppe ?? "";
  }

  private async bestaetigeEinwilligung() {
    try {
      const { status } = await this.post("einwilligung", { version: EINWILLIGUNGEN.verarbeitung.version, mindestens16: true });
      if (status !== 200) throw new Error("Antwort");
      this.messIndex = 0;
      this.wechsle("messen");
    } catch {
      this.wechsle("fehler");
    }
  }

  /**
   * Berechnung mit Ladebildschirm (Figma E36/E36b): drei Etappen, jede beginnt erst, wenn ihr Schritt fertig ist.
   * Erstes Mal je ca. 0,5 s (gesamt 1,2–2 s), wiederkehrend kurz (gesamt 0,6–0,8 s). Abbrechen ist möglich.
   */
  private async berechne(mitEingaben: boolean) {
    let koerper: Koerper | undefined;
    if (mitEingaben) {
      const pruefung = pruefeEingaben(this.roh, this.taillePflicht);
      if (!pruefung.ok) {
        // Sollte durch die Schritte nicht vorkommen – zur Sicherheit zum ersten fehlerhaften Schritt.
        this.feldFehler = pruefung.fehler;
        const index = this.messFelder().findIndex((f) => pruefung.fehler[f]);
        this.messIndex = Math.max(0, index);
        return this.wechsle("messen");
      }
      koerper = pruefung.koerper;
    }

    this.zurueckNachAbbruch = this.schritt === "willkommen" ? "willkommen" : "passform";
    const kurz = !mitEingaben;
    const etappe = ruhig() ? 150 : kurz ? 230 : 500;
    this.abbruch = new AbortController();
    const signal = this.abbruch.signal;
    this.wechsle("berechnung");
    this.setzeEtappe(0, etappe);

    try {
      const anfrage = (async () => {
        // Angemeldet und Maße geändert: Profil überschreiben (keine Historie).
        if (koerper && this.token && this.profil) {
          const profil = this.mitAltersgruppe(koerper);
          const { status } = await this.post("konto", { aktion: "profil_speichern", token: this.token, profil }, signal);
          if (status === 200) this.profil = profil;
        }
        const inhalt = koerper ? { koerper } : { token: this.token };
        return this.post<Ergebnis>("empfehlung", { produkt: this.einstellungen!.produkt, passform: this.passform, ...inhalt }, signal);
      })();

      await warte(etappe);
      if (signal.aborted) return;
      this.setzeEtappe(1, etappe);
      await warte(etappe);
      if (signal.aborted) return;
      this.setzeEtappe(2, etappe);
      const { status, daten } = await anfrage;
      if (signal.aborted) return;
      if (status === 401) {
        this.abgemeldet();
        return this.wechsle("einwilligung");
      }
      if (status !== 200) throw new Error("Antwort");
      await warte(etappe);
      if (signal.aborted) return;
      this.setzeEtappe(3, etappe);
      await warte(ruhig() ? 0 : 350);
      if (signal.aborted) return;

      this.setzeErgebnis(daten, true);
      this.reveal = !ruhig();
      this.wechsle("ergebnis");
      this.reveal = false;
      this.sage(this.ansageText());
    } catch {
      if (signal.aborted) return;
      this.wechsle("fehler");
    }
  }

  /** Passform-Umschalter im Ergebnis: direkt neu rechnen (angemeldet mit dem gespeicherten Profil). */
  private async rechneSofort() {
    const pruefung = pruefeEingaben(this.roh, this.taillePflicht);
    const inhalt = this.token && this.profil ? { token: this.token } : pruefung.ok ? { koerper: pruefung.koerper } : null;
    if (!inhalt) return;
    try {
      const { status, daten } = await this.post<Ergebnis>("empfehlung", { produkt: this.einstellungen!.produkt, passform: this.passform, ...inhalt });
      if (status !== 200) throw new Error("Antwort");
      this.setzeErgebnis(daten, false);
      this.zeichne();
      this.wurzel?.querySelector<HTMLInputElement>(`input[name=passform][value=${this.passform}]`)?.focus();
      this.sage(this.ansageText());
    } catch {
      this.wechsle("fehler");
    }
  }

  /** Neues Ergebnis: Ansicht zurück auf die Empfehlung; bei „unsicher“ die Zonen gleich aufklappen. */
  private setzeErgebnis(daten: Ergebnis, neu: boolean) {
    this.ergebnis = daten;
    this.ansicht = "haupt";
    this.angabenOffen = false;
    if (neu || daten.status === "unsicher") this.detailsVorgabe = daten.status === "unsicher";
  }

  /** Aktualisiert Logo-Stufen und Liste, ohne neu zu zeichnen (sonst würden Übergänge neu starten). */
  private setzeEtappe(etappe: number, dauer: number) {
    const w = this.wurzel;
    if (!w) return;
    w.querySelector<HTMLElement>(".logo-innen")?.style.setProperty("--etappe", `${dauer}ms`);
    w.querySelectorAll<HTMLElement>(".stufe").forEach((stufe, i) => stufe.classList.toggle("zeigen", i <= etappe));
    w.querySelectorAll<HTMLElement>(".schritte-liste li").forEach((li, i) => {
      li.classList.toggle("fertig", i < etappe);
      li.classList.toggle("aktiv", i === etappe);
    });
  }

  private brecheAb() {
    this.abbruch?.abort();
    this.wechsle(this.zurueckNachAbbruch);
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

  private async meldeAb() {
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
    this.bestaetigt = {};
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
  // Mess-Schritte
  // -------------------------------------------------------------------------

  private messFelder(): Feld[] {
    const felder: Feld[] = ["koerpergroesse", "brust", "huefte"];
    if (this.tailleGewertet || this.taillePflicht) felder.push("taille");
    return felder;
  }

  private aktuellesFeld(): Feld {
    return this.messFelder()[this.messIndex]!;
  }

  /** Weiter im Mess-Schritt: Pflicht und Bereich prüfen, dann Plausibilität (einmal je Wert nachfragen). */
  private weiter() {
    const feld = this.aktuellesFeld();
    const eingabe = this.wurzel?.getElementById(`ox-${feld}`) as HTMLInputElement | null;
    if (eingabe) this.roh[feld] = eingabe.value;
    const roh = (this.roh[feld] ?? "").trim();
    const wert = alsZahl(roh);
    const regel = FELDER.find((f) => f.feld === feld)!;
    const pflicht = feld !== "taille" || this.taillePflicht;
    this.feldFehler = {};

    if (wert === null) {
      if (pflicht) {
        this.feldFehler[feld] = `Bitte geben Sie Ihren ${regel.beschriftung} in cm ein.`;
        return this.zeichneUndFokus(`ox-${feld}`);
      }
      return this.naechsterSchritt();
    }
    if (Number.isNaN(wert)) {
      this.feldFehler[feld] = "Bitte nur eine Zahl eingeben, z. B. 92 oder 92,5.";
      return this.zeichneUndFokus(`ox-${feld}`);
    }

    if (this.bestaetigt[feld] !== roh) {
      const hinweis = pruefePlausibel(feld, wert, this.andereWerte(feld), this.plausi);
      if (hinweis) {
        this.hinweis = { feld, hinweis };
        this.zeichne();
        this.wurzel?.querySelector<HTMLElement>(".nachfrage")?.focus();
        return;
      }
    }

    if (wert < regel.min || wert > regel.max) {
      this.feldFehler[feld] = `Bitte prüfen Sie den Wert. Erwartet wird ein Wert zwischen ${regel.min} und ${regel.max} cm.`;
      return this.zeichneUndFokus(`ox-${feld}`);
    }
    this.naechsterSchritt();
  }

  private andereWerte(feld: Feld): Partial<Record<Feld, number>> {
    const werte: Partial<Record<Feld, number>> = {};
    for (const f of this.messFelder()) {
      if (f === feld) continue;
      // Mit „Stimmt so“ bestätigte Ausreißer nicht zum Maßstab machen, sonst folgt Nachfrage auf Nachfrage.
      if (this.bestaetigt[f] !== undefined && this.bestaetigt[f] === (this.roh[f] ?? "").trim()) continue;
      const w = alsZahl(this.roh[f]);
      if (w !== null && !Number.isNaN(w)) werte[f] = w;
    }
    return werte;
  }

  private naechsterSchritt() {
    this.hinweis = null;
    // Aus dem Ergebnis ein einzelnes Maß geändert (Figma E37): direkt neu rechnen und zurück.
    if (this.einzelAenderung) {
      this.einzelAenderung = false;
      this.sicherung = undefined;
      return void this.berechne(true);
    }
    if (this.messIndex < this.messFelder().length - 1) {
      this.messIndex += 1;
      return this.wechsle("messen");
    }
    this.wechsle("passform");
  }

  private zurueck() {
    this.hinweis = null;
    this.feldFehler = {};
    if (this.einzelAenderung && this.ergebnis) {
      this.einzelAenderung = false;
      if (this.sicherung) this.roh = this.sicherung;
      this.sicherung = undefined;
      return this.wechsle("ergebnis");
    }
    if (this.schritt === "passform") {
      this.messIndex = this.messFelder().length - 1;
      return this.wechsle("messen");
    }
    if (this.schritt === "messen" && this.messIndex > 0) {
      this.messIndex -= 1;
      return this.wechsle("messen");
    }
    this.wechsle(this.token && this.profil ? "willkommen" : "einwilligung");
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
      case "zurueck":
        return this.zurueck();
      case "vorschlag-uebernehmen": {
        if (this.hinweis?.hinweis.art !== "vorschlag") return;
        const feld = this.hinweis.feld;
        const wert = String(this.hinweis.hinweis.wert).replace(".", ",");
        this.roh[feld] = wert;
        // Auch im Feld setzen, denn weiter() liest den Wert aus dem Feld.
        const eingabe = this.wurzel?.getElementById(`ox-${feld}`) as HTMLInputElement | null;
        if (eingabe) eingabe.value = wert;
        this.hinweis = null;
        return this.weiter();
      }
      case "aendern": {
        const feld = this.hinweis?.feld;
        this.hinweis = null;
        return this.zeichneUndFokus(feld ? `ox-${feld}` : undefined);
      }
      case "stimmt-so": {
        if (!this.hinweis) return;
        const feld = this.hinweis.feld;
        this.bestaetigt[feld] = (this.roh[feld] ?? "").trim();
        this.hinweis = null;
        return this.weiter();
      }
      case "masse-aendern":
        this.messIndex = 0;
        this.einzelAenderung = false;
        return this.wechsle("messen");
      case "angaben":
        this.angabenOffen = !this.angabenOffen;
        this.zeichne();
        return this.wurzel?.querySelector<HTMLElement>(this.angabenOffen ? "#ox-angaben" : "[data-aktion='angaben']")?.focus();
      case "feld-aendern": {
        const index = this.messFelder().indexOf(ziel.dataset.feld as Feld);
        if (index < 0) return;
        this.sicherung = { ...this.roh };
        this.messIndex = index;
        this.einzelAenderung = true;
        this.angabenOffen = false;
        return this.wechsle("messen");
      }
      case "ansicht": {
        const wert = ziel.dataset.wert === "vergleich" ? "vergleich" : "haupt";
        if (wert === this.ansicht) return;
        this.ansicht = wert;
        this.zeichne();
        this.wurzel?.querySelector<HTMLElement>(`[data-aktion='ansicht'][data-wert='${wert}']`)?.focus();
        return this.sage(this.ansageText());
      }
      case "uebernehmen":
        return this.uebernehmen();
      case "erneut":
        this.wechsle("laden");
        return void this.starte();
      case "willkommen-rechnen":
        return void this.berechne(false);
      case "abbrechen":
        return this.brecheAb();
      case "speichern":
        this.feldFehler = {};
        return this.wechsle("speichern");
      case "code-erneut":
        this.meldung = "Wir haben Ihnen einen neuen Code geschickt.";
        return void this.fordereCodeAn();
      case "andere-email":
        this.meldung = "";
        return this.wechsle("speichern");
      case "abmelden":
        return void this.meldeAb();
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
      // Im Ergebnis rechnet der Umschalter sofort neu, ohne Ladebildschirm.
      if (this.schritt === "ergebnis") void this.rechneSofort();
    }
  }

  private beiAbsenden(e: Event) {
    e.preventDefault();
    const formular = e.target as HTMLFormElement;
    switch (formular.dataset.formular) {
      case "code":
        return void this.pruefeCode((formular.elements.namedItem("code") as HTMLInputElement).value);
      case "speichern":
        return void this.fordereCodeAn();
      case "messen":
        return this.weiter();
      case "passform":
        return void this.berechne(true);
    }
  }

  private beiTaste(e: KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      this.schliessen();
      return;
    }
    if (e.key !== "Tab" || !this.wurzel) return;
    // Fokus bleibt im Fenster.
    const fokussierbar = [
      ...this.wurzel.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled]), select, summary, a[href], [tabindex='-1']"),
    ].filter((el) => el.offsetParent !== null || el.tagName === "H2");
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

  private zeichneUndFokus(id?: string) {
    this.zeichne();
    if (id) this.wurzel?.getElementById(id)?.focus();
  }

  private sage(text: string) {
    const ansage = this.wurzel?.querySelector("[data-ansage]");
    if (ansage) ansage.textContent = text;
  }

  private ansageText() {
    const r = this.ergebnis;
    if (!r) return "";
    if (this.ansicht === "vergleich" && r.vergleich) return `Ansicht: So säße ${r.vergleich.groesse}.`;
    if (r.status === "empfohlen" && r.recommended_size) {
      if (r.alternative_size) return `Sie liegen zwischen ${r.recommended_size} und ${r.alternative_size}, Passform ${this.passformText()}.`;
      return `Empfohlene Größe ${r.recommended_size}, Passform ${this.passformText()}.`;
    }
    if (r.status === "unsicher") return "Keine sichere Größenempfehlung. Die Passform je Zone ist aufgeklappt.";
    return "Keine Größe passt gut genug.";
  }

  private passformText() {
    return PASSFORMEN.find(([p]) => p === this.passform)?.[1] ?? "";
  }

  private zeichne() {
    const w = this.wurzel;
    if (!w) return;
    const kopf = w.querySelector<HTMLElement>("[data-kopf]");
    const inhalt = w.querySelector<HTMLElement>("[data-inhalt]");
    // Aufgeklappte Zonen-Ansicht über das Neuzeichnen hinweg merken.
    const zonen = w.querySelector<HTMLDetailsElement>("details.zonen");
    if (this.detailsVorgabe !== null) this.detailsOffen = this.detailsVorgabe;
    else if (zonen) this.detailsOffen = zonen.open;
    this.detailsVorgabe = null;
    if (kopf) kopf.innerHTML = this.htmlKopf();
    if (inhalt) inhalt.innerHTML = this.html();
  }

  private htmlKopf() {
    const schliessen = `<button type="button" class="schliessen" data-aktion="schliessen" aria-label="Größenberatung schließen">×</button>`;
    if (this.schritt === "messen" || this.schritt === "passform") {
      const felder = this.messFelder();
      const gesamt = felder.length;
      const nummer = this.schritt === "passform" ? gesamt : this.messIndex + 1;
      const titel = this.schritt === "passform" ? "Passform" : `${SCHRITTE[this.aktuellesFeld()].kurz} · ${nummer} von ${gesamt}`;
      const anteil = this.schritt === "passform" ? 100 : Math.round((nummer / (gesamt + 1)) * 100);
      return `<div class="kopf-schritt">
          <button type="button" class="zurueck" data-aktion="zurueck" aria-label="Zurück">‹</button>
          <span class="titel">${escape(titel)}</span>
          ${schliessen}
        </div>
        <div class="fortschritt" role="progressbar" aria-label="Fortschritt" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${anteil}"><span style="width:${anteil}%"></span></div>`;
    }
    return `<div class="kopf"><span class="marke">Ommetryx · Größenberatung</span>${schliessen}</div>`;
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
      case "messen":
        return this.htmlMessen();
      case "passform":
        return this.htmlPassformSchritt();
      case "berechnung":
        return this.htmlBerechnung();
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
      <button type="button" class="primaer" data-aktion="willkommen-rechnen">Größe berechnen</button>
      <button type="button" class="sekundaer" data-aktion="masse-aendern">Maße ändern</button>
      ${this.meinLink()}
      <button type="button" class="link" data-aktion="abmelden">Abmelden</button>`;
  }

  /** Ein Mess-Schritt (Figma E03–E06): Video-Platzhalter, Frage, Warum, Zahlenfeld, Kurz-Tipp, Nachfrage. */
  private htmlMessen() {
    const feld = this.aktuellesFeld();
    const t = SCHRITTE[feld];
    const id = `ox-${feld}`;
    const fehler = this.feldFehler[feld];
    const optional = feld === "taille" && !this.taillePflicht;
    const beschreibung = [fehler ? `${id}-fehler` : "", this.hinweis?.feld === feld ? "ox-nachfrage" : ""].filter(Boolean).join(" ");
    const letzter = this.messIndex === this.messFelder().length - 1;

    return `<div class="video" role="img" aria-label="Platzhalter für ein Anleitungsvideo: ${escape(t.video)}">
        <span class="abspielen" aria-hidden="true"><svg width="20" height="22" viewBox="0 0 20 22"><path d="M2 1.5v19L19 11z" fill="#fff"/></svg></span>
        <span aria-hidden="true">[Video: ${escape(t.video)}]</span>
      </div>
      <form novalidate data-formular="messen">
        <h2 id="ox-titel" tabindex="-1">${escape(t.frage)}${optional ? ` <span class="leise">(empfohlen)</span>` : ""}</h2>
        <p class="warum">${escape(t.warum)}</p>
        <div class="feld">
          <label for="${id}" class="nur-vorleser">${escape(t.frage)} in Zentimetern</label>
          <div class="mit-einheit">
            <input id="${id}" name="${feld}" inputmode="decimal" autocomplete="off" placeholder="${feld === "koerpergroesse" ? "z. B. 168" : "z. B. 92"}"
              value="${escape(this.roh[feld] ?? "")}" ${fehler ? `aria-invalid="true"` : ""} ${beschreibung ? `aria-describedby="${beschreibung}"` : ""} />
            <span class="einheit" aria-hidden="true">cm</span>
          </div>
          ${fehler ? `<span class="fehler" id="${id}-fehler">${escape(fehler)}</span>` : ""}
        </div>
        ${this.hinweis?.feld === feld ? this.htmlNachfrage(this.hinweis.hinweis, t.frage) : ""}
        <details class="tipp">
          <summary>Kein Video möglich? Kurz-Tipp</summary>
          <p>${escape(t.tipp)}</p>
          <p class="leise">${escape(MESS_HINWEIS)}</p>
        </details>
        <button type="button" class="karte-knopf" data-aktion="schliessen">
          <span><strong>Kein Maßband zur Hand?</strong><span>Dann nutzen Sie bitte die Größentabelle des Shops.</span></span>
          <span aria-hidden="true">›</span>
        </button>
        <div class="fuss"><button type="submit" class="primaer">${this.einzelAenderung ? "Neu berechnen" : letzter ? "Weiter zur Passform" : "Weiter"}</button></div>
      </form>`;
  }

  /** Nachfrage zur Plausibilität (Figma E17). Die Kundin entscheidet immer selbst. */
  private htmlNachfrage(h: NonNullable<Hinweis>, frage: string) {
    if (h.art === "vorschlag") {
      return `<div class="nachfrage" id="ox-nachfrage" tabindex="-1" role="group" aria-label="Rückfrage zu ${escape(frage)}">
          <p><strong>${escape(h.frage)}</strong></p>
          <div class="knoepfe">
            <button type="button" class="primaer" data-aktion="vorschlag-uebernehmen">${escape(String(h.wert).replace(".", ","))} cm übernehmen</button>
            <button type="button" class="sekundaer" data-aktion="aendern">Ändern</button>
          </div>
        </div>`;
    }
    return `<div class="nachfrage" id="ox-nachfrage" tabindex="-1" role="group" aria-label="Rückfrage zu ${escape(frage)}">
        <p><strong>Bitte noch einmal messen?</strong> ${escape(h.text)}</p>
        <div class="knoepfe">
          <button type="button" class="sekundaer" data-aktion="stimmt-so">Stimmt so</button>
          <button type="button" class="sekundaer" data-aktion="aendern">Nochmal messen</button>
        </div>
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

  private htmlPassformSchritt() {
    return `<form novalidate data-formular="passform">
        <h2 id="ox-titel" tabindex="-1">Wie soll dieses Teil sitzen?</h2>
        <p class="warum">Jedes Teil darf anders sitzen. Wir fragen deshalb bei jedem Artikel neu.</p>
        ${this.htmlPassform().replace("<legend>Wie soll dieses Teil sitzen?</legend>", '<legend class="nur-vorleser">Passform</legend>')}
        <div class="feld">
          <label for="ox-altersgruppe">Altersgruppe (optional)</label>
          <select id="ox-altersgruppe" name="altersgruppe">
            <option value="">Keine Angabe</option>
            ${ALTERSGRUPPEN.map((g) => `<option value="${g}" ${this.altersgruppe === g ? "selected" : ""}>${g.replace("-", "–")} Jahre</option>`).join("")}
          </select>
        </div>
        <div class="fuss"><button type="submit" class="primaer">Größe berechnen</button></div>
      </form>`;
  }

  /** Ladebildschirm (Figma E36/E36b). Stufen und Häkchen setzt setzeEtappe, ohne neu zu zeichnen. */
  private htmlBerechnung() {
    const schritte = ["Ihre Maße", "Echte Maße dieses Artikels", `Passform „${this.passformText()}“`];
    return `<div class="berechnung">
        ${logoHtml(BASIS)}
        <h2 id="ox-titel" tabindex="-1">Wir vergleichen Ihre Maße mit den echten Maßen dieses Artikels</h2>
        <ol class="schritte-liste">
          ${schritte.map((s) => `<li><span class="marke-punkt" aria-hidden="true"></span>${escape(s)}</li>`).join("")}
        </ol>
        <button type="button" class="link" data-aktion="abbrechen">Abbrechen</button>
      </div>`;
  }

  /** Ergebnis (Figma E09, E09b, E10, E37, E38). Unten fest: „Größe … übernehmen“ und Links. */
  private htmlErgebnis() {
    const r = this.ergebnis!;
    const passform = `<form novalidate data-formular="ergebnis">${this.htmlPassform()}</form>`;

    if (r.status === "keine_passende_groesse" || !r.haupt) {
      return `<div class="${this.reveal ? "reveal" : ""}">
          ${passform}
          <div class="folge">
            <div class="karte-ergebnis">
              <h2 id="ox-titel" tabindex="-1">Keine Größe passt gut genug</h2>
              <p>Bei diesem Artikel passt Ihnen mit dieser Passform leider keine Größe gut genug. Vielleicht klappt es mit einer anderen Passform, sonst hilft die Größentabelle des Shops.</p>
            </div>
            ${this.htmlAngaben()}
            ${this.htmlKonto()}
          </div>
          <div class="fuss">
            <button type="button" class="primaer" data-aktion="schliessen">Zur Größentabelle des Shops</button>
            <div class="fuss-links"><button type="button" class="link" data-aktion="angaben" aria-expanded="${this.angabenOffen}">Angaben ändern</button></div>
          </div>
        </div>`;
    }

    const haupt = r.haupt;
    const vergleich = r.vergleich;
    const zeigt = this.ansicht === "vergleich" && vergleich ? vergleich : haupt;
    const zwischen = r.status === "empfohlen" && Boolean(r.alternative_size) && vergleich !== null;
    const unsicher = r.status === "unsicher";

    let karte: string;
    let warum = "";
    if (unsicher) {
      karte = `<div class="karte-ergebnis">
          <h2 id="ox-titel" tabindex="-1">Wir sind uns bei diesem Artikel nicht sicher</h2>
          <p class="leise">Ihre Maße passen nicht eindeutig zu einer Größe. Unten sehen Sie, wie ${escape(haupt.groesse)}${vergleich ? ` und ${escape(vergleich.groesse)}` : ""} sitzen würden.</p>
        </div>`;
    } else if (zwischen && vergleich) {
      karte = `<div class="karte-zwei">
          <div class="zwei-kopf">
            <h2 id="ox-titel" tabindex="-1">Sie liegen zwischen ${escape(haupt.groesse)} und ${escape(vergleich.groesse)}</h2>
            <span class="marke-klein">beide möglich</span>
          </div>
          <div class="zwei-raster">
            ${[haupt, vergleich].map((g) => `<div class="mini"><strong>${escape(g.groesse)}</strong><p>${escape(groessenKurz(g, r.primaer))}</p></div>`).join("")}
          </div>
          <p><strong>Entscheidungshilfe:</strong> ${escape(entscheidungshilfe(haupt, vergleich, r.primaer))}</p>
        </div>`;
      warum = `<p><strong>Warum zwei?</strong> ${escape(`Bei der Passform „${passformWort(this.passform)}“ liegt der gewünschte Spielraum genau zwischen zwei Größen.`)}</p>`;
    } else {
      const istVergleich = zeigt !== haupt;
      karte = `<div class="karte-ergebnis mit-kreis">
          <div class="kreis" aria-hidden="true"><span>${escape(zeigt.groesse)}</span></div>
          <div>
            <h2 id="ox-titel" tabindex="-1">${istVergleich ? `So säße ${escape(zeigt.groesse)}` : `Ihre Größe: ${escape(zeigt.groesse)}`}</h2>
            <p>${escape(istVergleich ? vergleichSatz(haupt, zeigt, r.primaer) : kurzSatz(zeigt, this.passform))}</p>
            <p class="leise">${istVergleich ? `Empfohlen bleibt ${escape(haupt.groesse)}` : `Empfehlung: ${sicherheitText(r.confidence)}`}</p>
          </div>
        </div>`;
      warum = `<p><strong>Warum ${escape(haupt.groesse)}?</strong> ${escape(warumSatz(haupt, r.primaer, this.passform))}</p>`;
    }

    const begrenzt = r.begrenzt_durch_schnitt ? `<p class="leise">${escape(begrenztSatz(r.schnitt, this.passform))}</p>` : "";

    return `<div class="${this.reveal ? "reveal" : ""}">
        ${passform}
        <div class="folge">
          ${karte}
          ${warum}${begrenzt}
          ${this.htmlAngaben()}
          ${this.htmlZonen(r.primaer, haupt, vergleich, zwischen || unsicher)}
          ${this.htmlKonto()}
        </div>
        <div class="fuss">
          <button type="button" class="primaer" data-aktion="uebernehmen">Größe ${escape(zeigt.groesse)} übernehmen</button>
          <div class="fuss-links">
            <button type="button" class="link" data-aktion="angaben" aria-expanded="${this.angabenOffen}">Angaben ändern</button>
            ${this.token ? "" : `<button type="button" class="link" data-aktion="speichern">Maße speichern</button>`}
            <button type="button" class="link" data-aktion="schliessen">Größentabelle</button>
          </div>
        </div>
      </div>`;
  }

  /** „Passform je Zone ansehen“ (Figma E09b/E10): Silhouette, Skalen, Umschalter zwischen zwei Größen. */
  private htmlZonen(primaer: Zone, haupt: GroessenAnsicht, vergleich: GroessenAnsicht | null, gleichrangig: boolean) {
    const zeigt = this.ansicht === "vergleich" && vergleich ? vergleich : haupt;
    if (zeigt.zonen.length === 0) return "";
    const knopf = (wert: "haupt" | "vergleich", text: string) =>
      `<button type="button" data-aktion="ansicht" data-wert="${wert}" aria-pressed="${this.ansicht === wert}">${escape(text)}</button>`;
    const umschalter = vergleich
      ? `<div class="umschalter" role="group" aria-label="Größe für die Ansicht">
          ${knopf("haupt", haupt.groesse)}${knopf("vergleich", gleichrangig ? vergleich.groesse : `So säße ${vergleich.groesse}`)}
        </div>`
      : "";
    const zeilen = zeigt.zonen
      .map(
        (z) => `<li>
          <div class="zone-text"><strong>${escape(zonenName(z.zone))}</strong><span>${escape(spielraumText(z))}<span class="nur-vorleser">, ${escape(bewertungText(z.bewertung))}</span></span></div>
          <div class="skala" aria-hidden="true"><span class="wunsch"></span><span class="punkt${z.bewertung === "zu_eng" ? " eng" : ""}" style="left:${skalaProzent(z.lage)}%"></span></div>
        </li>`,
      )
      .join("");
    return `<details class="zonen" ${this.detailsOffen ? "open" : ""}>
        <summary>Passform je Zone ansehen</summary>
        <div class="zonen-inhalt">
          <div class="zonen-kopf"><strong>Passform im Detail · ${escape(zeigt.groesse)}</strong>${umschalter}</div>
          <div class="zonen-raster">
            ${silhouette(zeigt, primaer)}
            <ul class="zonen-liste">${zeilen}</ul>
          </div>
          <div class="achse" aria-hidden="true"><span>eng</span><span>gewünschte Passform</span><span>weit</span></div>
          <ul class="legende" aria-hidden="true">
            <li><span class="farbe passt"></span>sitzt wie gewünscht</li><li><span class="farbe eng"></span>enger</li><li><span class="farbe weit"></span>weiter</li>
          </ul>
          <p class="leise">Gemessen, nicht geschätzt: abgeglichen mit den echten Maßen dieses Artikels.</p>
        </div>
      </details>`;
  }

  /** „Ihre Angaben“ mit Ändern je Maß (Figma E37). Nach dem Ändern geht es direkt hierher zurück. */
  private htmlAngaben() {
    if (!this.angabenOffen) return "";
    const zeilen = this.messFelder()
      .map((f) => {
        const regel = FELDER.find((x) => x.feld === f)!;
        const wert = (this.roh[f] ?? "").trim();
        return `<li><span>${escape(regel.beschriftung)} · ${wert ? `${escape(wert)} cm` : "nicht angegeben"}</span>
          <button type="button" class="link" data-aktion="feld-aendern" data-feld="${f}" aria-label="${escape(regel.beschriftung)} ändern">Ändern</button></li>`;
      })
      .join("");
    return `<section class="karte angaben" id="ox-angaben" tabindex="-1" aria-label="Ihre Angaben">
        <div class="angaben-kopf"><strong>Ihre Angaben</strong><button type="button" class="link" data-aktion="angaben">Schließen</button></div>
        <ul>${zeilen}</ul>
        <p class="leise">Nach dem Ändern kommen Sie direkt hierher zurück.</p>
      </section>`;
  }

  /** Angemeldet: Hinweis, Link zu „Mein Ommetryx“, Abmelden. */
  private htmlKonto() {
    if (!this.token) return "";
    return `<div>
        ${this.meldung ? `<p class="karte" role="status">${escape(this.meldung)}</p>` : `<p class="leise">Ihre Maße sind gespeichert.</p>`}
        ${this.meinLink()}
        <button type="button" class="link" data-aktion="abmelden">Abmelden</button>
      </div>`;
  }

  /** „Größe … übernehmen“: folgt im zweiten Teil von 8b (Größe im Shop auswählen). */
  private uebernehmen() {
    this.schliessen();
  }

  /** Link zu „Mein Ommetryx“ (Maße ändern, Einwilligungen widerrufen, Daten herunterladen, löschen). */
  private meinLink() {
    if (!this.meinUrl) return "";
    return `<a class="link" style="display:block" href="${escape(this.meinUrl)}" target="_blank" rel="noopener noreferrer">Mein Ommetryx: Daten ansehen, ändern oder löschen<span class="nur-vorleser"> (öffnet in neuem Tab)</span></a>`;
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
      <button type="button" class="sekundaer" data-aktion="schliessen">Nicht speichern</button>`;
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
