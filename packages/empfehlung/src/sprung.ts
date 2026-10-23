// Größensprung G (v3 Abschnitt 1), je Messpunkt aus den eigenen Messungen des Artikels.
// Entscheidung 23.10.: G je Messpunkt, nicht nur vom Primärmaß.

import type { ArtikelGroesse, Messpunkt } from "./typen.ts";

/**
 * Sprung zur nächsten Größe. Bei der größten Größe der Sprung von der vorigen.
 * Ohne Nachbarmaß der Standardwert aus der Konfiguration.
 */
export function groessensprung(
  groessen: ArtikelGroesse[],
  index: number,
  messpunkt: Messpunkt,
  standard: number,
): number {
  const eigen = groessen[index]?.masse[messpunkt];
  if (eigen === undefined) return standard;
  const naechste = groessen[index + 1]?.masse[messpunkt];
  if (naechste !== undefined) return Math.abs(naechste - eigen);
  const vorige = groessen[index - 1]?.masse[messpunkt];
  if (vorige !== undefined) return Math.abs(eigen - vorige);
  return standard;
}
