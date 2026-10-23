// Team-Login gegen die lokale Datenbank. Nur Test-Konten mit Endung @test.invalid.

import { PrismaClient } from "@prisma/client";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { entschluessele } from "../app/intern/krypto.server";
import {
  ladeEin,
  ladeEinrichtung,
  MAX_FEHLVERSUCHE,
  meldeAn,
  pruefeHerkunft,
  schliesseEinrichtungAb,
  sitzungsCookie,
  teamAusAnfrage,
} from "../app/intern/team.server";
import { totpCodeFuer } from "../app/intern/totp.server";

const db = new PrismaClient();
const EMAIL = "login-test@test.invalid";
const PASSWORT = "ein-langes-testpasswort";

async function aufraeumen() {
  await db.teamMitglied.deleteMany({ where: { email: { endsWith: "@test.invalid" } } });
}
beforeEach(aufraeumen);
afterAll(async () => {
  await aufraeumen();
  await db.$disconnect();
});

async function geheimnis() {
  const m = await db.teamMitglied.findUniqueOrThrow({ where: { email: EMAIL } });
  return entschluessele(m.totpGeheimnis!);
}

/**
 * Einladen und einrichten; gibt das TOTP-Geheimnis zurück.
 * Standard: Code des vorigen Zeitschritts (noch gültig), damit die Anmeldung danach mit dem aktuellen Code klappt.
 */
async function eingerichtet(zeit = Date.now() - 30_000) {
  const token = await ladeEin(db, EMAIL, "Test");
  await ladeEinrichtung(db, token);
  const g = await geheimnis();
  const ergebnis = await schliesseEinrichtungAb(db, token, { passwort: PASSWORT, wiederholung: PASSWORT, code: totpCodeFuer(g, EMAIL, zeit) });
  if (!ergebnis.ok) throw new Error(`Einrichtung fehlgeschlagen: ${ergebnis.fehler}`);
  return g;
}

describe("Einladung und Einrichtung", () => {
  it("speichert Passwort nur als Hash und das TOTP-Geheimnis verschlüsselt", async () => {
    await eingerichtet(Date.now());
    const m = await db.teamMitglied.findUniqueOrThrow({ where: { email: EMAIL } });
    expect(m.passwortHash).toMatch(/^scrypt\$/);
    expect(m.passwortHash).not.toContain(PASSWORT);
    expect(m.totpGeheimnis).not.toBe(await geheimnis());
    expect(m.totpAktiv).toBe(true);
    expect(m.einrichtungTokenHash).toBeNull();
  });

  it("lässt eine Einladung nur einmal zu", async () => {
    const token = await ladeEin(db, EMAIL, "Test");
    await ladeEinrichtung(db, token);
    const g = await geheimnis();
    await schliesseEinrichtungAb(db, token, { passwort: PASSWORT, wiederholung: PASSWORT, code: totpCodeFuer(g, EMAIL) });
    expect(await ladeEinrichtung(db, token)).toBeNull();
  });

  it("lehnt zu kurze Passwörter und falsche Codes ab", async () => {
    const token = await ladeEin(db, EMAIL, "Test");
    await ladeEinrichtung(db, token);
    expect(await schliesseEinrichtungAb(db, token, { passwort: "kurz", wiederholung: "kurz", code: "000000" })).toEqual({
      ok: false,
      fehler: "passwort_zu_kurz",
    });
    expect(await schliesseEinrichtungAb(db, token, { passwort: PASSWORT, wiederholung: PASSWORT, code: "000000" })).toEqual({
      ok: false,
      fehler: "code_falsch",
    });
  });
});

describe("Anmeldung", () => {
  it("klappt mit E-Mail, Passwort und aktuellem Code und erzeugt eine Sitzung", async () => {
    const g = await eingerichtet();
    const ergebnis = await meldeAn(db, { email: EMAIL.toUpperCase(), passwort: PASSWORT, code: totpCodeFuer(g, EMAIL) });
    expect(ergebnis.ok).toBe(true);
    if (!ergebnis.ok) return;
    const anfrage = new Request("http://localhost/intern", { headers: { Cookie: sitzungsCookie(ergebnis.sitzungToken).split(";")[0]! } });
    expect((await teamAusAnfrage(db, anfrage))?.email).toBe(EMAIL);
  });

  it("lässt denselben Code nicht zweimal zu", async () => {
    const g = await eingerichtet();
    const code = totpCodeFuer(g, EMAIL);
    expect((await meldeAn(db, { email: EMAIL, passwort: PASSWORT, code })).ok).toBe(true);
    expect((await meldeAn(db, { email: EMAIL, passwort: PASSWORT, code })).ok).toBe(false);
  });

  it("sperrt das Konto nach zu vielen Fehlversuchen", async () => {
    const g = await eingerichtet();
    for (let i = 0; i < MAX_FEHLVERSUCHE; i++) {
      expect((await meldeAn(db, { email: EMAIL, passwort: "falsch-falsch-falsch", code: "000000" })).ok).toBe(false);
    }
    expect((await meldeAn(db, { email: EMAIL, passwort: PASSWORT, code: totpCodeFuer(g, EMAIL) })).ok).toBe(false);
  });

  it("antwortet bei unbekannter E-Mail genauso wie bei falschem Passwort", async () => {
    expect(await meldeAn(db, { email: "niemand@test.invalid", passwort: PASSWORT, code: "123456" })).toEqual({ ok: false });
  });

  it("erkennt ohne Cookie niemanden", async () => {
    expect(await teamAusAnfrage(db, new Request("http://localhost/intern"))).toBeNull();
  });
});

describe("Schutz gegen fremde Formulare", () => {
  it("lehnt einen fremden Origin ab und erlaubt den eigenen", () => {
    const anfrage = (origin: string) => new Request("http://localhost:3000/intern/anmelden", { method: "POST", headers: { Origin: origin, Host: "localhost:3000" } });
    expect(() => pruefeHerkunft(anfrage("https://boese.example"))).toThrow();
    expect(() => pruefeHerkunft(anfrage("http://localhost:3000"))).not.toThrow();
  });
});
