// Austausch mit dem Vermessungsprogramm: Ergebnis-Datei prüfen, Programm- und Handmaße vergleichen.
// Maße in cm, Umfänge bereits × 2, wie überall in den gespeicherten Daten.

import { z } from "zod";
import { MASSFELDER, PLAUSIBEL } from "./erfassung";
import type { Massfeld, Masse } from "./erfassung";

export const MAX_IMPORT_MB = 10;
/** Ziel des Programms: höchstens ±1 cm Umfang gegenüber der Handmessung (v3, Abschnitt 8). */
export const TOLERANZ_UMFANG_CM = 1;

export interface ProgrammZeile {
  groesseId: number;
  masse: Masse;
}

export type ProgrammPruefung = { ok: true; version: string | null; zeilen: ProgrammZeile[]; fehler: string[] } | { ok: false; meldung: string };

const DATEI = z.object({
  programm_version: z.string().trim().min(1).max(100).optional(),
  ergebnisse: z
    .array(z.object({ groesse_id: z.number().int().positive(), garment_measurements: z.record(z.string(), z.unknown()) }))
    .min(1)
    .max(50000),
});

const FELDER = new Set<string>(MASSFELDER.map(({ feld }) => feld));

/** Prüft die Ergebnis-Datei. Gültige Zeilen werden übernommen, die anderen als Fehler gemeldet. */
export function pruefeProgrammDatei(text: string): ProgrammPruefung {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, meldung: "Die Datei ist kein gültiges JSON." };
  }
  const datei = DATEI.safeParse(json);
  if (!datei.success) return { ok: false, meldung: "Die Datei passt nicht zum Format: Es fehlt „ergebnisse“ oder eine Zeile ist unvollständig." };

  const zeilen: ProgrammZeile[] = [];
  const fehler: string[] = [];
  const gesehen = new Set<number>();
  for (const { groesse_id: groesseId, garment_measurements: werte } of datei.data.ergebnisse) {
    const probleme: string[] = [];
    if (gesehen.has(groesseId)) probleme.push("kommt doppelt vor");
    gesehen.add(groesseId);
    const masse: Masse = {};
    for (const [feld, wert] of Object.entries(werte)) {
      if (!FELDER.has(feld)) probleme.push(`unbekanntes Maß „${feld.slice(0, 40)}“`);
      else if (typeof wert !== "number" || !Number.isFinite(wert)) probleme.push(`${feld} ist keine Zahl`);
      else if (wert < PLAUSIBEL[feld as Massfeld][0] || wert > PLAUSIBEL[feld as Massfeld][1]) probleme.push(`${feld} ${wert} cm ist unrealistisch`);
      else masse[feld as Massfeld] = wert;
    }
    if (probleme.length === 0 && Object.keys(masse).length === 0) probleme.push("enthält keine Maße");
    if (probleme.length > 0) fehler.push(`Größen-Nummer ${groesseId}: ${probleme.join(", ")}.`);
    else zeilen.push({ groesseId, masse });
  }
  return { ok: true, version: datei.data.programm_version ?? null, zeilen, fehler };
}

export interface Vergleich {
  feld: Massfeld;
  beschriftung: string;
  umfang: boolean;
  programm: number;
  hand: number | null;
  differenz: number | null;
  auffaellig: boolean;
}

export function vergleiche(programm: Masse, hand: Masse): Vergleich[] {
  return MASSFELDER.flatMap(({ feld, beschriftung, umfang }) => {
    const p = programm[feld];
    if (p === undefined) return [];
    const h = hand[feld] ?? null;
    const differenz = h === null ? null : Math.round((p - h) * 10) / 10;
    return [{ feld, beschriftung, umfang, programm: p, hand: h, differenz, auffaellig: umfang && differenz !== null && Math.abs(differenz) > TOLERANZ_UMFANG_CM }];
  });
}
