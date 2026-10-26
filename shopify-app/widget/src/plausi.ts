// Plausibilitätsprüfung im Widget (CLAUDE.md Abschnitt 6): nachfragen, nie überstimmen.
// - Tippfehler (920 → 92), Meter statt cm (1,68 → 168), Zoll statt cm (38 → 97)
// - Abweichung vom erwarteten Wert > abweichung_cm (erwartete Abstände aus der Konfiguration)
// Rein rechnend, gut testbar. Texte enthalten nur die Werte der Kundin selbst.

import type { Feld } from "./eingaben";
import { FELDER } from "./eingaben";

export interface PlausiKonfig {
  abweichung_cm: number;
  huefte_minus_brust_cm: number;
  brust_minus_taille_cm: number;
}

export type Hinweis =
  | { art: "vorschlag"; wert: number; frage: string }
  | { art: "nachmessen"; text: string }
  | null;

const ZOLL_CM = 2.54;
/** Unterhalb dieser Umfänge ist bei Erwachsenen eine Eingabe in Zoll wahrscheinlicher als in cm. */
const ZOLL_VERDACHT_UNTER: Partial<Record<Feld, number>> = { brust: 60, huefte: 60, taille: 45 };

const zahl = (n: number) => n.toLocaleString("de-DE", { maximumFractionDigits: 1 });
const grenzen = (feld: Feld) => FELDER.find((f) => f.feld === feld)!;
const imBereich = (feld: Feld, wert: number) => wert >= grenzen(feld).min && wert <= grenzen(feld).max;

const NAMEN: Record<Exclude<Feld, "koerpergroesse">, string> = { brust: "Brust", huefte: "Hüfte", taille: "Taille" };

/** Erwarteter Wert eines Umfangs aus den bisher eingegebenen anderen Umfängen, oder null. */
export function erwarteterWert(feld: Feld, andere: Partial<Record<Feld, number>>, k: PlausiKonfig): number | null {
  const d1 = k.huefte_minus_brust_cm;
  const d2 = k.brust_minus_taille_cm;
  const schaetzungen: number[] = [];
  if (feld === "huefte") {
    if (andere.brust !== undefined) schaetzungen.push(andere.brust + d1);
    if (andere.taille !== undefined) schaetzungen.push(andere.taille + d2 + d1);
  }
  if (feld === "brust") {
    if (andere.huefte !== undefined) schaetzungen.push(andere.huefte - d1);
    if (andere.taille !== undefined) schaetzungen.push(andere.taille + d2);
  }
  if (feld === "taille") {
    if (andere.brust !== undefined) schaetzungen.push(andere.brust - d2);
    if (andere.huefte !== undefined) schaetzungen.push(andere.huefte - d1 - d2);
  }
  if (schaetzungen.length === 0) return null;
  return schaetzungen.reduce((a, b) => a + b, 0) / schaetzungen.length;
}

export function pruefePlausibel(feld: Feld, wert: number, andere: Partial<Record<Feld, number>>, k: PlausiKonfig): Hinweis {
  if (feld === "koerpergroesse") {
    if (wert >= 1 && wert <= 2.3) {
      const cm = Math.round(wert * 100);
      return { art: "vorschlag", wert: cm, frage: `${zahl(wert)} m? Meinten Sie ${cm} cm?` };
    }
    if (!imBereich(feld, wert) && imBereich(feld, wert / 10)) {
      return { art: "vorschlag", wert: wert / 10, frage: `${zahl(wert)} cm? Meinten Sie ${zahl(wert / 10)} cm?` };
    }
    return null;
  }

  if (!imBereich(feld, wert) && imBereich(feld, wert / 10)) {
    return { art: "vorschlag", wert: wert / 10, frage: `${zahl(wert)} cm? Meinten Sie ${zahl(wert / 10)} cm?` };
  }

  const zollGrenze = ZOLL_VERDACHT_UNTER[feld];
  if (zollGrenze !== undefined && wert < zollGrenze && imBereich(feld, Math.round(wert * ZOLL_CM))) {
    const cm = Math.round(wert * ZOLL_CM);
    return { art: "vorschlag", wert: cm, frage: `Haben Sie in Zoll gemessen? ${zahl(wert)} Zoll sind etwa ${cm} cm.` };
  }

  const erwartet = erwarteterWert(feld, andere, k);
  if (erwartet !== null && Math.abs(wert - erwartet) > k.abweichung_cm) {
    const name = NAMEN[feld];
    const klein = wert < erwartet;
    const zusatz = feld === "huefte" && klein ? " Sie wird oft zu klein gemessen." : "";
    return {
      art: "nachmessen",
      text: `Die ${name} wirkt im Vergleich zu Ihren anderen Maßen ${klein ? "klein" : "groß"}.${zusatz}`,
    };
  }
  return null;
}
