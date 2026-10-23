// Dehnung (v3 Abschnitt 4): Korrektur der Ziel-Mitte und Mindest-Mehrweite.

import type { Konfiguration, Zeilenwahl } from "./konfiguration.ts";
import type { Messpunkt, Passform } from "./typen.ts";

/**
 * Korrektur der Ziel-Mitte in cm. Es zählt nur der Unterschied zur Referenzklasse der Kategorie,
 * damit Dehnung nie doppelt abgezogen wird. Gilt nicht für die Taille (eigene Bund-Zeilen).
 */
export function dehnungskorrektur(
  k: Konfiguration,
  messpunkt: Messpunkt,
  klasse: number,
  referenzklasse: number,
  passform: Passform,
): number {
  if (messpunkt === "taille") return 0;
  const gemessen = k.dehnungskorrekturWert(klasse, passform);
  const referenz = k.dehnungskorrekturWert(referenzklasse, passform);
  if (gemessen === undefined || referenz === undefined) return 0;
  return gemessen - referenz;
}

/**
 * Mindest-Mehrweite in cm, oder null, wenn für diesen Messpunkt keine gilt.
 * Klasse 0: fester Wert aus dem Blatt Mindest. Klasse 1: Tabellenwerte. Klasse 2–4: −Anteil × Dehnung × Körpermaß.
 * Bund (mindest_aus_zeile): immer der Wert aus dem Blatt Mindest.
 */
export function mindestMehrweite(
  k: Konfiguration,
  wahl: Zeilenwahl,
  messpunkt: Messpunkt,
  klasse: number,
  dehnungProzent: number,
  koerpermass: number,
): number | null {
  if (wahl.mindest_aus_zeile || klasse === 0) {
    if (!wahl.mindest_zeile) return null;
    return k.mindestKlasse0(wahl.mindest_zeile, messpunkt) ?? null;
  }
  if (klasse === 1) return k.mindestKlasse1(messpunkt);
  return -k.parameter("nutzbarer_dehnungsanteil") * (dehnungProzent / 100) * koerpermass;
}
