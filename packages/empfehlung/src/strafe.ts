// Strafe je Messpunkt (v3 Abschnitt 6).

import type { Konfiguration } from "./konfiguration.ts";
import type { Bewertung } from "./typen.ts";

export interface StrafEingabe {
  mehrweite: number;
  /** null: keine Ziel-Mitte, nur Mindest und Obergrenze werden geprüft. */
  zielMitte: number | null;
  zoneHalbbreite: number;
  mindest: number | null;
  obergrenze: number | null;
}

export interface StrafErgebnis {
  strafe: number;
  bewertung: Bewertung;
  unterMindest: boolean;
}

/**
 * Abstand d = |Mehrweite − Mitte| − Zone. Innerhalb der Zone straffrei.
 * Zu eng × faktor_zu_eng, zu weit × faktor_zu_weit.
 * Zusätzlich: unter Mindest × faktor_unter_mindest, über der Oversized-Obergrenze × faktor_ueber_obergrenze.
 */
export function strafe(k: Konfiguration, e: StrafEingabe): StrafErgebnis {
  let wert = 0;
  let bewertung: Bewertung = "passt";

  if (e.zielMitte !== null) {
    const d = Math.abs(e.mehrweite - e.zielMitte) - e.zoneHalbbreite;
    if (d > 0) {
      const zuEng = e.mehrweite < e.zielMitte;
      wert += (zuEng ? k.parameter("faktor_zu_eng") : k.parameter("faktor_zu_weit")) * d;
      bewertung = zuEng ? "zu_eng" : "zu_weit";
    }
  }

  const unterMindest = e.mindest !== null && e.mehrweite < e.mindest;
  if (unterMindest) {
    wert += k.parameter("faktor_unter_mindest") * (e.mindest! - e.mehrweite);
    bewertung = "zu_eng";
  }

  if (e.obergrenze !== null && e.mehrweite > e.obergrenze) {
    wert += k.parameter("faktor_ueber_obergrenze") * (e.mehrweite - e.obergrenze);
    bewertung = "zu_weit";
  }

  return { strafe: wert, bewertung, unterMindest };
}

/**
 * Längen- und Breitenvergleich (Schulter, Ärmellänge): ±Toleranz straffrei,
 * zu schmal bzw. zu kurz zählt mit faktor_zu_eng, zu breit bzw. zu lang mit faktor_zu_weit.
 */
export function strafeVergleich(k: Konfiguration, differenz: number, toleranz: number): StrafErgebnis {
  const d = Math.abs(differenz) - toleranz;
  if (d <= 0) return { strafe: 0, bewertung: "passt", unterMindest: false };
  const zuKlein = differenz < 0;
  return {
    strafe: (zuKlein ? k.parameter("faktor_zu_eng") : k.parameter("faktor_zu_weit")) * d,
    bewertung: zuKlein ? "zu_eng" : "zu_weit",
    unterMindest: false,
  };
}
