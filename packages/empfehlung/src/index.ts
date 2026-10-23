// Öffentliche Schnittstelle des Empfehlungsmoduls.

import excel from "../konfiguration/konfiguration-v3.json" with { type: "json" };
import ergaenzungen from "../konfiguration/ergaenzungen-v3.json" with { type: "json" };
import { ladeKonfiguration } from "./konfiguration.ts";
import type { Konfiguration } from "./konfiguration.ts";

export { empfehle, bestimmeStatus } from "./empfehle.ts";
export { ladeKonfiguration } from "./konfiguration.ts";
export type { Konfiguration } from "./konfiguration.ts";
export * from "./typen.ts";

/**
 * Konfiguration aus den mitgelieferten Dateien (Startwerte v3).
 * Später kommt sie aus der Datenbank, dann wird ladeKonfiguration direkt mit den Tabellen aufgerufen.
 */
export function standardKonfiguration(): Konfiguration {
  return ladeKonfiguration(excel, ergaenzungen);
}
