// Login der Kundin per E-Mail-Code (CLAUDE.md Abschnitt 6).
// - Code nur als HMAC gespeichert, 10 Minuten gültig, einmalig
// - 3 Fehlversuche → 10 Minuten Sperre; höchstens 5 Codes je 15 Minuten und E-Mail
// - Antworten verraten nie, ob es zu einer E-Mail ein Profil gibt
// - Sitzung 30 Tage, verlängert sich bei jeder Nutzung, gilt nur im Shop, in dem angemeldet wurde
// Nichts davon wird geloggt.

import { timingSafeEqual } from "node:crypto";
import { hmac, sechsstelligerCode, sha256, verschluessele, zufallsToken } from "../lib/krypto.server";
import { identityDb } from "./datenbanken.server";
import { sendeLoginCode } from "./mail.server";

export const CODE_MINUTEN = 10;
export const MAX_FEHLVERSUCHE = 3;
export const SPERRE_MINUTEN = 10;
export const MAX_ANFORDERUNGEN = 5;
export const ANFORDERUNGS_FENSTER_MINUTEN = 15;
export const SITZUNG_TAGE = 30;
/** „Mein Ommetryx“: eigener Bereich statt Shop, kürzere Sitzung, nur bestehende Profile. */
export const MEIN_BEREICH = "mein-ommetryx";
export const MEIN_SITZUNG_MINUTEN = 60;

export interface LoginOptionen {
  /** Kein neues Konto anlegen (Mein Ommetryx: ohne Einwilligung kein Profil). */
  nurBestehende?: boolean;
}

const sitzungsDauer = (shop: string) => (shop === MEIN_BEREICH ? minuten(MEIN_SITZUNG_MINUTEN) : SITZUNG_TAGE * 24 * 3600 * 1000);

const minuten = (n: number) => n * 60 * 1000;

export function normalisiereEmail(email: string) {
  return email.trim().toLowerCase();
}

const emailHash = (email: string) => hmac(`email:${normalisiereEmail(email)}`);
const codeHash = (hash: string, code: string) => hmac(`code:${hash}:${code}`);

function gleich(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Fordert einen Code an. Gibt nichts zurück, damit niemand erfährt, ob die E-Mail bekannt ist. */
export async function fordereCodeAn(email: string, optionen: LoginOptionen = {}): Promise<void> {
  const hash = emailHash(email);
  const jetzt = new Date();
  const schutz = await identityDb.loginSchutz.upsert({ where: { emailHash: hash }, create: { emailHash: hash }, update: {} });
  if (schutz.gesperrtBis && schutz.gesperrtBis > jetzt) return;

  const fensterAbgelaufen = schutz.anforderungenSeit.getTime() < jetzt.getTime() - minuten(ANFORDERUNGS_FENSTER_MINUTEN);
  const anforderungen = fensterAbgelaufen ? 0 : schutz.anforderungen;
  if (anforderungen >= MAX_ANFORDERUNGEN) return;

  await identityDb.loginSchutz.update({
    where: { emailHash: hash },
    data: { anforderungen: anforderungen + 1, anforderungenSeit: fensterAbgelaufen ? jetzt : schutz.anforderungenSeit },
  });
  // Ohne Profil keinen Code schicken – die Antwort nach außen bleibt dieselbe.
  if (optionen.nurBestehende && !(await identityDb.kundin.findUnique({ where: { emailHash: hash }, select: { id: true } }))) return;

  // Ältere Codes werden ungültig, es gilt immer nur der neueste.
  await identityDb.loginCode.updateMany({ where: { emailHash: hash, verbraucht: false }, data: { verbraucht: true } });

  const code = sechsstelligerCode();
  await identityDb.loginCode.create({
    data: { emailHash: hash, codeHash: codeHash(hash, code), gueltigBis: new Date(jetzt.getTime() + minuten(CODE_MINUTEN)) },
  });
  await sendeLoginCode(normalisiereEmail(email), code);
}

export type Anmeldung = { ok: true; token: string; kundinId: string; pseudonymId: string; neu: boolean } | { ok: false };

/** Prüft den Code. Bei Erfolg: Kundin anlegen oder finden, Sitzung im Shop erzeugen. */
export async function pruefeCode(email: string, code: string, shop: string, optionen: LoginOptionen = {}): Promise<Anmeldung> {
  const hash = emailHash(email);
  const jetzt = new Date();
  const schutz = await identityDb.loginSchutz.findUnique({ where: { emailHash: hash } });
  if (schutz?.gesperrtBis && schutz.gesperrtBis > jetzt) return { ok: false };

  const eintrag = await identityDb.loginCode.findFirst({
    where: { emailHash: hash, verbraucht: false, gueltigBis: { gt: jetzt } },
    orderBy: { erstelltAm: "desc" },
  });
  const bereinigt = code.replace(/\s/g, "");
  const richtig = Boolean(eintrag) && /^\d{6}$/.test(bereinigt) && gleich(eintrag!.codeHash, codeHash(hash, bereinigt));

  if (!richtig) {
    const fehlversuche = (schutz?.fehlversuche ?? 0) + 1;
    const sperren = fehlversuche >= MAX_FEHLVERSUCHE;
    await identityDb.loginSchutz.upsert({
      where: { emailHash: hash },
      create: { emailHash: hash, fehlversuche },
      update: {
        fehlversuche: sperren ? 0 : fehlversuche,
        gesperrtBis: sperren ? new Date(jetzt.getTime() + minuten(SPERRE_MINUTEN)) : undefined,
      },
    });
    if (sperren) await identityDb.loginCode.updateMany({ where: { emailHash: hash, verbraucht: false }, data: { verbraucht: true } });
    return { ok: false };
  }

  await identityDb.loginCode.update({ where: { id: eintrag!.id }, data: { verbraucht: true } });
  await identityDb.loginSchutz.update({ where: { emailHash: hash }, data: { fehlversuche: 0, gesperrtBis: null } });

  let kundin = await identityDb.kundin.findUnique({ where: { emailHash: hash }, include: { zuordnung: true } });
  const neu = !kundin;
  if (!kundin && optionen.nurBestehende) return { ok: false };
  if (!kundin) {
    kundin = await identityDb.kundin.create({
      data: {
        emailHash: hash,
        emailVerschluesselt: verschluessele(normalisiereEmail(email), "OX_SCHLUESSEL_IDENTITY"),
        zuordnung: { create: {} },
      },
      include: { zuordnung: true },
    });
  }
  const zuordnung = kundin.zuordnung ?? (await identityDb.zuordnung.create({ data: { kundinId: kundin.id } }));

  const token = zufallsToken();
  await identityDb.kundinSitzung.create({
    data: { tokenHash: sha256(token), kundinId: kundin.id, shop, gueltigBis: new Date(jetzt.getTime() + sitzungsDauer(shop)) },
  });
  await merkeNutzung(kundin.id, shop);
  return { ok: true, token, kundinId: kundin.id, pseudonymId: zuordnung.pseudonymId, neu };
}

async function merkeNutzung(kundinId: string, shop: string) {
  const jetzt = new Date();
  await identityDb.kundin.update({ where: { id: kundinId }, data: { letzteAktivitaet: jetzt, erinnertAm: null } });
  if (shop === MEIN_BEREICH) return;
  await identityDb.shopVerknuepfung.upsert({
    where: { kundinId_shop: { kundinId, shop } },
    create: { kundinId, shop },
    update: { letzteNutzung: jetzt },
  });
}

/** Angemeldete Kundin zum Token – nur im Shop, in dem angemeldet wurde. Verlängert die Sitzung. */
export async function kundinAusToken(token: unknown, shop: string): Promise<{ kundinId: string; pseudonymId: string } | null> {
  if (typeof token !== "string" || token.length < 20 || token.length > 100) return null;
  const sitzung = await identityDb.kundinSitzung.findUnique({
    where: { tokenHash: sha256(token) },
    include: { kundin: { include: { zuordnung: true } } },
  });
  if (!sitzung || sitzung.shop !== shop || sitzung.gueltigBis < new Date() || !sitzung.kundin.zuordnung) return null;
  await identityDb.kundinSitzung.update({
    where: { id: sitzung.id },
    data: { gueltigBis: new Date(Date.now() + sitzungsDauer(shop)) },
  });
  await merkeNutzung(sitzung.kundinId, shop);
  return { kundinId: sitzung.kundinId, pseudonymId: sitzung.kundin.zuordnung.pseudonymId };
}

export async function meldeAb(token: unknown) {
  if (typeof token !== "string") return;
  await identityDb.kundinSitzung.deleteMany({ where: { tokenHash: sha256(token) } });
}
