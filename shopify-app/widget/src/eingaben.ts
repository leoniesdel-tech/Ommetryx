// Prüfung der Maßeingaben im Widget (gleiche Grenzen wie der Server). Rein rechnend, gut testbar.

export type Feld = "koerpergroesse" | "brust" | "huefte" | "taille";

export const FELDER: { feld: Feld; beschriftung: string; min: number; max: number }[] = [
  { feld: "koerpergroesse", beschriftung: "Körpergröße", min: 100, max: 230 },
  { feld: "brust", beschriftung: "Brustumfang", min: 30, max: 250 },
  { feld: "huefte", beschriftung: "Hüftumfang", min: 30, max: 250 },
  { feld: "taille", beschriftung: "Taillenumfang", min: 30, max: 250 },
];

export type Rohwerte = Partial<Record<Feld, string>>;

export interface Koerper {
  koerpergroesse: number;
  brust: number;
  huefte: number;
  taille?: number;
}

export function alsZahl(text: string | undefined): number | null {
  const sauber = (text ?? "").trim().replace(",", ".");
  if (sauber === "") return null;
  return /^\d+(\.\d+)?$/.test(sauber) ? Number(sauber) : Number.NaN;
}

/** „Bitte geben Sie Ihre Körpergröße …“ / „Bitte gib deinen Brustumfang …“ – mit passendem Artikel je Feld. */
export function fehltText(feld: Feld, du = false): string {
  const beschriftung = FELDER.find((f) => f.feld === feld)!.beschriftung;
  const weiblich = feld === "koerpergroesse";
  const dein = du ? (weiblich ? "deine" : "deinen") : weiblich ? "Ihre" : "Ihren";
  return du ? `Bitte gib ${dein} ${beschriftung} in cm ein.` : `Bitte geben Sie ${dein} ${beschriftung} in cm ein.`;
}

export function bereichText(min: number, max: number, du = false): string {
  return `${du ? "Bitte prüf den Wert." : "Bitte prüfen Sie den Wert."} Erwartet wird ein Wert zwischen ${min} und ${max} cm.`;
}

/** Prüft die Eingaben. Fehlertexte enthalten keine eingegebenen Werte. */
export function pruefeEingaben(
  roh: Rohwerte,
  taillePflicht: boolean,
  du = false,
): { ok: true; koerper: Koerper } | { ok: false; fehler: Partial<Record<Feld, string>> } {
  const fehler: Partial<Record<Feld, string>> = {};
  const werte: Partial<Record<Feld, number>> = {};

  for (const { feld, min, max } of FELDER) {
    const zahl = alsZahl(roh[feld]);
    const pflicht = feld !== "taille" || taillePflicht;
    if (zahl === null) {
      if (pflicht) fehler[feld] = fehltText(feld, du);
      continue;
    }
    if (Number.isNaN(zahl)) {
      fehler[feld] = "Bitte nur eine Zahl eingeben, z. B. 92 oder 92,5.";
      continue;
    }
    if (zahl < min || zahl > max) {
      fehler[feld] = bereichText(min, max, du);
      continue;
    }
    werte[feld] = zahl;
  }

  if (Object.keys(fehler).length > 0) return { ok: false, fehler };
  return {
    ok: true,
    koerper: {
      koerpergroesse: werte.koerpergroesse!,
      brust: werte.brust!,
      huefte: werte.huefte!,
      ...(werte.taille !== undefined ? { taille: werte.taille } : {}),
    },
  };
}

/** Sicherheit in Worten für die Kundin. */
export function sicherheitInWorten(konfidenz: number): string {
  if (konfidenz >= 80) return "hoch";
  if (konfidenz >= 60) return "mittel";
  return "niedrig";
}
