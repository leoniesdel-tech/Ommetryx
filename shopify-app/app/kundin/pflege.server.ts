// Täglicher Pflege-Lauf (CLAUDE.md Abschnitt 9): inaktive Profile nach 24 Monaten löschen, 30 Tage vorher erinnern,
// abgelaufene Codes und Sitzungen entfernen. Aufruf: npm run pflege (auf dem Server später als täglicher Cron-Job).
// Gelöscht wird nie ohne Erinnerung: Fällt der Lauf oder der Mail-Versand aus, verschiebt sich die Löschung.
// Ausgabe nur als Anzahl, nie mit Adressen.

import db from "../db.server";
import { entschluessele } from "../lib/krypto.server";
import { identityDb } from "./datenbanken.server";
import { sendeLoeschErinnerung } from "./mail.server";
import { loescheKundin } from "./verwaltung.server";

const MONATE_BIS_LOESCHUNG = 24;
const TAGE_VORLAUF = 30;
const TAG_MS = 24 * 3600 * 1000;
const JE_LAUF = 500;

const monateZurueck = (datum: Date, monate: number) => {
  const ergebnis = new Date(datum);
  ergebnis.setUTCMonth(ergebnis.getUTCMonth() - monate);
  return ergebnis;
};

export async function erinnereUndLoesche(jetzt = new Date()) {
  const loeschGrenze = monateZurueck(jetzt, MONATE_BIS_LOESCHUNG);
  const erinnerGrenze = new Date(loeschGrenze.getTime() + TAGE_VORLAUF * TAG_MS);
  const ergebnis = { erinnert: 0, geloescht: 0, fehlgeschlagen: 0 };

  const zuLoeschen = await identityDb.kundin.findMany({
    where: { letzteAktivitaet: { lt: loeschGrenze }, erinnertAm: { lte: new Date(jetzt.getTime() - TAGE_VORLAUF * TAG_MS) } },
    select: { id: true },
    take: JE_LAUF,
  });
  for (const { id } of zuLoeschen) {
    await loescheKundin(id);
    ergebnis.geloescht += 1;
  }

  const zuErinnern = await identityDb.kundin.findMany({
    where: { letzteAktivitaet: { lt: erinnerGrenze }, erinnertAm: null },
    select: { id: true, emailVerschluesselt: true },
    take: JE_LAUF,
  });
  for (const k of zuErinnern) {
    try {
      const termin = new Date(jetzt.getTime() + TAGE_VORLAUF * TAG_MS);
      await sendeLoeschErinnerung(entschluessele(k.emailVerschluesselt, "OX_SCHLUESSEL_IDENTITY"), termin);
      await identityDb.kundin.update({ where: { id: k.id }, data: { erinnertAm: jetzt } });
      ergebnis.erinnert += 1;
    } catch {
      ergebnis.fehlgeschlagen += 1;
    }
  }
  return ergebnis;
}

/** Abgelaufene Einträge ohne Nutzen entfernen. */
export async function raeumeAuf(jetzt = new Date()) {
  const gestern = new Date(jetzt.getTime() - TAG_MS);
  const [codes, sitzungen, schutz, team] = await Promise.all([
    identityDb.loginCode.deleteMany({ where: { gueltigBis: { lt: gestern } } }),
    identityDb.kundinSitzung.deleteMany({ where: { gueltigBis: { lt: jetzt } } }),
    identityDb.loginSchutz.deleteMany({
      where: { anforderungenSeit: { lt: gestern }, OR: [{ gesperrtBis: null }, { gesperrtBis: { lt: jetzt } }] },
    }),
    db.teamSitzung.deleteMany({ where: { gueltigBis: { lt: jetzt } } }),
  ]);
  return { codes: codes.count, sitzungen: sitzungen.count, schutz: schutz.count, teamSitzungen: team.count };
}
