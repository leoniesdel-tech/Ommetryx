// Antwort an das Widget: nur, was das Ergebnis-Fenster anzeigt.
//
// Warum gekürzt: Aus Spielräumen aller Größen und den eigenen Körpermaßen ließen sich unsere gemessenen
// Kleidungsmaße des ganzen Artikels zurückrechnen. Deshalb gehen höchstens zwei Größen raus
// (Empfehlung und Vergleichsgröße), die Spielräume auf halbe Zentimeter gerundet, ohne Strafen,
// Gewichte und Ziel-Werte. Zonen ohne echte Rechnung (Gewicht 0, Schulter, Ärmel) bleiben weg.

import type { Bewertung, Ergebnis, GroessenErgebnis, Passform, Status } from "@ommetryx/empfehlung";

export const ANSICHT_ZONEN = ["brust", "taille", "huefte", "oberschenkel", "oberarm"] as const;
export type AnsichtZone = (typeof ANSICHT_ZONEN)[number];

export interface ZonenAnsicht {
  zone: AnsichtZone;
  /** Kleidungsumfang − Körperumfang, auf 0,5 cm gerundet. */
  spielraum: number;
  /** Lage auf der Skala „eng“ (−1) bis „weit“ (+1); der gewünschte Bereich liegt bei −1/3 bis +1/3. */
  lage: number;
  bewertung: Bewertung;
}

export interface GroessenAnsicht {
  groesse: string;
  /** Shopify-Varianten-Nummer zum Auswählen auf der Produktseite, wenn bekannt. */
  variante: string | null;
  zonen: ZonenAnsicht[];
}

export interface WidgetErgebnis {
  status: Status;
  recommended_size: string | null;
  alternative_size: string | null;
  confidence: number;
  begrenzt_durch_schnitt: boolean;
  passform: Passform;
  schnitt: Passform;
  /** Wichtigste Zone des Artikels (für „Warum 40?“). */
  primaer: AnsichtZone;
  /** Empfohlene Größe, bei „unsicher“ die rechnerisch beste. */
  haupt: GroessenAnsicht | null;
  /** Nachbargröße zum Vergleich („So säße 42“), bei „zwischen zwei Größen“ die zweite Größe. */
  vergleich: GroessenAnsicht | null;
}

export interface AnsichtKontext {
  passform: Passform;
  schnitt: Passform;
  primaer: string;
  /** Größen in ihrer Reihenfolge (klein → groß) mit Shopify-Variante. */
  groessen: { groesse: string; variante: string | null }[];
}

const halbeCm = (wert: number) => Math.round(wert * 2) / 2;
const istZone = (z: string): z is AnsichtZone => (ANSICHT_ZONEN as readonly string[]).includes(z);

/** Varianten-Nummer aus der Shopify-ID („gid://shopify/ProductVariant/123“ → „123“). */
export function variantenNummer(gid: string | null | undefined): string | null {
  const nummer = gid?.match(/\/(\d{1,20})$/)?.[1];
  return nummer ?? null;
}

function lage(mehrweite: number, mitte: number, halbbreite: number): number {
  // Skala: drei gewünschte Bereiche breit, der gewünschte Bereich in der Mitte.
  const roh = halbbreite > 0 ? (mehrweite - mitte) / (3 * halbbreite) : Math.sign(mehrweite - mitte);
  return Math.round(Math.max(-1, Math.min(1, roh)) * 100) / 100;
}

function alsAnsicht(g: GroessenErgebnis, kontext: AnsichtKontext): GroessenAnsicht {
  const zonen: ZonenAnsicht[] = [];
  for (const z of g.zonen) {
    if (!istZone(z.messpunkt) || z.ziel_mitte === null || z.gewicht <= 0) continue;
    zonen.push({
      zone: z.messpunkt,
      spielraum: halbeCm(z.mehrweite),
      lage: lage(z.mehrweite, z.ziel_mitte, z.zone_halbbreite),
      bewertung: z.bewertung,
    });
  }
  // Wichtigste Zone zuerst, danach in fester Reihenfolge von oben nach unten.
  zonen.sort((a, b) => Number(b.zone === kontext.primaer) - Number(a.zone === kontext.primaer) || ANSICHT_ZONEN.indexOf(a.zone) - ANSICHT_ZONEN.indexOf(b.zone));
  return { groesse: g.groesse, variante: kontext.groessen.find((x) => x.groesse === g.groesse)?.variante ?? null, zonen };
}

/** Nächstgrößere Größe, sonst nächstkleinere (für „So säße …“). */
function nachbar(groesse: string, kontext: AnsichtKontext): string | null {
  const reihe = kontext.groessen.map((g) => g.groesse);
  const i = reihe.indexOf(groesse);
  if (i < 0) return null;
  return reihe[i + 1] ?? reihe[i - 1] ?? null;
}

export function widgetErgebnis(e: Ergebnis, kontext: AnsichtKontext): WidgetErgebnis {
  const finde = (groesse: string | null) => (groesse ? (e.groessen.find((g) => g.groesse === groesse) ?? null) : null);
  const kandidaten = e.groessen.filter((g) => !g.ausgeschlossen).sort((a, b) => a.score - b.score);

  let haupt: GroessenErgebnis | null = null;
  let vergleich: GroessenErgebnis | null = null;
  if (e.status === "empfohlen") {
    haupt = finde(e.recommended_size);
    vergleich = finde(e.alternative_size) ?? (haupt ? finde(nachbar(haupt.groesse, kontext)) : null);
  } else if (e.status === "unsicher") {
    haupt = kandidaten[0] ?? null;
    vergleich = kandidaten[1] ?? (haupt ? finde(nachbar(haupt.groesse, kontext)) : null);
  }

  return {
    status: e.status,
    recommended_size: e.recommended_size,
    alternative_size: e.alternative_size,
    confidence: Math.round(e.confidence),
    begrenzt_durch_schnitt: e.begrenzt_durch_schnitt,
    passform: kontext.passform,
    schnitt: kontext.schnitt,
    primaer: istZone(kontext.primaer) ? kontext.primaer : "brust",
    haupt: haupt ? alsAnsicht(haupt, kontext) : null,
    vergleich: vergleich ? alsAnsicht(vergleich, kontext) : null,
  };
}
