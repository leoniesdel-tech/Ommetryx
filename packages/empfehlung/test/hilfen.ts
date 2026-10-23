// Erfundene Testdaten. Nie echte Kundinnen.

import type { Anfrage, Artikel, ArtikelGroesse, Ergebnis, Koerpermasse } from "../src/index.ts";

export const kundin = (masse: Partial<Koerpermasse> = {}): Koerpermasse => ({
  koerpergroesse: 168,
  brust: 92,
  huefte: 100,
  ...masse,
});

export const groessen = (liste: [string, ArtikelGroesse["masse"]][]): ArtikelGroesse[] =>
  liste.map(([groesse, masse]) => ({ groesse, masse }));

export const artikel = (felder: Partial<Artikel> & Pick<Artikel, "artikelart" | "groessen">): Artikel => ({
  schnitt: "regulaer",
  material_dehnung_prozent: 0,
  tailliert: false,
  aermel_typ: "eingesetzt",
  ...felder,
});

export const anfrage = (felder: Partial<Anfrage> & Pick<Anfrage, "artikel">): Anfrage => ({
  koerper: kundin(),
  passform: "regulaer",
  ...felder,
});

export function groesse(ergebnis: Ergebnis, name: string) {
  const g = ergebnis.groessen.find((x) => x.groesse === name);
  if (!g) throw new Error(`Größe ${name} fehlt im Ergebnis`);
  return g;
}

export function zone(ergebnis: Ergebnis, name: string, messpunkt: string) {
  const z = groesse(ergebnis, name).zonen.find((x) => x.messpunkt === messpunkt);
  if (!z) throw new Error(`Zone ${messpunkt} fehlt bei Größe ${name}`);
  return z;
}
