// Rechte der Kundin (DSGVO Art. 15–17, 20, 7 Abs. 3): Auskunft/Export, Berichtigung, Löschung, Widerruf.
//
// loescheKundin ist die EINZIGE Löschfunktion – auch für Widerruf, die 24-Monats-Löschung
// und Shopifys Pflicht-Webhook. Einwilligungsnachweise bleiben ohne Personenbezug erhalten.

import { entschluessele, hmac } from "../lib/krypto.server";
import { bodyDb, identityDb } from "./datenbanken.server";
import { MEIN_BEREICH } from "./login.server";
import { ladeProfil, loescheProfil } from "./profil.server";

export async function uebersicht(kundinId: string) {
  const kundin = await identityDb.kundin.findUniqueOrThrow({
    where: { id: kundinId },
    include: {
      zuordnung: true,
      einwilligungen: { orderBy: { erteiltAm: "desc" } },
      shops: { orderBy: { letzteNutzung: "desc" } },
    },
  });
  return {
    email: entschluessele(kundin.emailVerschluesselt, "OX_SCHLUESSEL_IDENTITY"),
    erstelltAm: kundin.erstelltAm,
    letzteAktivitaet: kundin.letzteAktivitaet,
    profil: kundin.zuordnung ? await ladeProfil(kundin.zuordnung.pseudonymId) : null,
    einwilligungen: kundin.einwilligungen.map((e) => ({
      id: e.id,
      zweck: e.zweck,
      textversion: e.textversion,
      shop: e.shop,
      erteiltAm: e.erteiltAm,
      widerrufenAm: e.widerrufenAm,
    })),
    shops: kundin.shops.map((s) => ({ shop: s.shop, ersteNutzung: s.ersteNutzung, letzteNutzung: s.letzteNutzung })),
  };
}

/** Alle Daten zur Kundin als Datei (Auskunft und Datenübertragbarkeit). */
export async function datenExport(kundinId: string) {
  const u = await uebersicht(kundinId);
  return {
    hinweis: "Ihre bei Ommetryx gespeicherten Daten. Körpermaße in cm.",
    erstellt: new Date().toISOString(),
    email: u.email,
    konto_erstellt: u.erstelltAm.toISOString(),
    letzte_aktivitaet: u.letzteAktivitaet.toISOString(),
    koerpermasse: u.profil,
    einwilligungen: u.einwilligungen.map((e) => ({
      zweck: e.zweck,
      textversion: e.textversion,
      shop: e.shop,
      erteilt: e.erteiltAm.toISOString(),
      widerrufen: e.widerrufenAm?.toISOString() ?? null,
    })),
    shops: u.shops.map((s) => ({ shop: s.shop, erste_nutzung: s.ersteNutzung.toISOString(), letzte_nutzung: s.letzteNutzung.toISOString() })),
  };
}

/**
 * Löscht alles zur Kundin: Maße (body), E-Mail, Zuordnung, Sitzungen, Shop-Verknüpfungen,
 * offene Codes und Sperren (identity). Einwilligungen bleiben als Nachweis, aber ohne Personenbezug.
 */
export async function loescheKundin(kundinId: string) {
  const kundin = await identityDb.kundin.findUnique({ where: { id: kundinId }, include: { zuordnung: true } });
  if (!kundin) return;

  if (kundin.zuordnung) await loescheProfil(kundin.zuordnung.pseudonymId);

  const jetzt = new Date();
  await identityDb.$transaction([
    identityDb.einwilligung.updateMany({ where: { kundinId, widerrufenAm: null }, data: { widerrufenAm: jetzt } }),
    identityDb.einwilligung.updateMany({ where: { kundinId }, data: { kundinId: null } }),
    identityDb.loginCode.deleteMany({ where: { emailHash: kundin.emailHash } }),
    identityDb.loginSchutz.deleteMany({ where: { emailHash: kundin.emailHash } }),
    // Zuordnung, Sitzungen und Shop-Verknüpfungen hängen per Cascade an der Kundin.
    identityDb.kundin.delete({ where: { id: kundinId } }),
  ]);
}

/** Widerruf mit einem Klick. Profil-Einwilligung → alles löschen (ohne Einwilligung keine Speicherung). */
export async function widerrufe(kundinId: string, einwilligungId: number): Promise<"geloescht" | "widerrufen" | "unbekannt"> {
  const e = await identityDb.einwilligung.findFirst({ where: { id: einwilligungId, kundinId } });
  if (!e) return "unbekannt";
  if (e.zweck === "profil" || e.zweck === "verarbeitung") {
    await loescheKundin(kundinId);
    return "geloescht";
  }
  await identityDb.einwilligung.update({ where: { id: e.id }, data: { widerrufenAm: new Date() } });
  return "widerrufen";
}

/** Verbindung zu einem Shop lösen: dort abmelden und nicht mehr als genutzt führen. */
export async function trenneShop(kundinId: string, shop: string) {
  if (shop === MEIN_BEREICH) return;
  await identityDb.kundinSitzung.deleteMany({ where: { kundinId, shop } });
  await identityDb.shopVerknuepfung.deleteMany({ where: { kundinId, shop } });
}

/** Für Tests und Prüfungen: Gibt es zu dieser E-Mail noch irgendetwas Personenbezogenes? */
export async function restdaten(email: string) {
  const hash = hmac(`email:${email.trim().toLowerCase()}`);
  const kundin = await identityDb.kundin.findUnique({ where: { emailHash: hash }, include: { zuordnung: true } });
  return {
    kundin: Boolean(kundin),
    codes: await identityDb.loginCode.count({ where: { emailHash: hash } }),
    schutz: await identityDb.loginSchutz.count({ where: { emailHash: hash } }),
    profil: kundin?.zuordnung ? await bodyDb.koerperprofil.count({ where: { pseudonymId: kundin.zuordnung.pseudonymId } }) : 0,
  };
}
