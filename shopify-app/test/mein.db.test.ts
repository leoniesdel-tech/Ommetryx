// „Mein Ommetryx“: Login nur für bestehende Profile, Löschen, Widerruf, Export, Shops trennen.
// Nur erfundene Adressen mit Endung @test.invalid.

import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { bodyDb, identityDb } from "../app/kundin/datenbanken.server";
import { speichereEinwilligung } from "../app/kundin/einwilligung.server";
import { fordereCodeAn, kundinAusToken, MEIN_BEREICH, pruefeCode } from "../app/kundin/login.server";
import { meinCookie } from "../app/kundin/mein-sitzung.server";
import { ladeProfil, speichereProfil } from "../app/kundin/profil.server";
import { datenExport, loescheKundin, restdaten, trenneShop, widerrufe } from "../app/kundin/verwaltung.server";
import { hmac } from "../app/lib/krypto.server";
import { loader as meinLoader } from "../app/routes/mein._index";
import { loader as datenLoader } from "../app/routes/mein.daten";

const SHOP = "mein-test.myshopify.com";
const EMAIL = "mein.test@test.invalid";
const ANDERE = "mein.andere@test.invalid";
const NEU = "mein.neu@test.invalid";

async function aufraeumen() {
  for (const email of [EMAIL, ANDERE, NEU]) {
    const hash = hmac(`email:${email}`);
    const k = await identityDb.kundin.findUnique({ where: { emailHash: hash }, include: { zuordnung: true } });
    if (k?.zuordnung) await bodyDb.koerperprofil.deleteMany({ where: { pseudonymId: k.zuordnung.pseudonymId } });
    await identityDb.kundin.deleteMany({ where: { emailHash: hash } });
    await identityDb.loginCode.deleteMany({ where: { emailHash: hash } });
    await identityDb.loginSchutz.deleteMany({ where: { emailHash: hash } });
  }
  await identityDb.entwicklungsMail.deleteMany({ where: { an: { endsWith: "@test.invalid" } } });
  await identityDb.einwilligung.deleteMany({ where: { shop: SHOP } });
}
beforeEach(aufraeumen);
afterAll(aufraeumen);

async function letzterCode(email: string) {
  const mail = await identityDb.entwicklungsMail.findFirst({ where: { an: email }, orderBy: { id: "desc" } });
  return mail?.text.match(/\b(\d{6})\b/)?.[1] ?? "";
}

/** Profil wie im Widget anlegen: Login im Shop, Einwilligung, Maße. */
async function profilImShop(email = EMAIL) {
  await fordereCodeAn(email);
  const a = await pruefeCode(email, await letzterCode(email), SHOP);
  if (!a.ok) throw new Error("Anmeldung im Shop fehlgeschlagen");
  await speichereEinwilligung({ kundinId: a.kundinId, zweck: "profil", shop: SHOP, mindestens16: true });
  await speichereProfil(a.pseudonymId, { koerpergroesse: 168, brust: 96, huefte: 102 });
  return a;
}

async function meinAnmelden(email = EMAIL) {
  await fordereCodeAn(email, { nurBestehende: true });
  const a = await pruefeCode(email, await letzterCode(email), MEIN_BEREICH, { nurBestehende: true });
  if (!a.ok) throw new Error("Anmeldung bei Mein Ommetryx fehlgeschlagen");
  return a;
}

const anfrage = (pfad: string, token?: string) =>
  new Request(`https://ommetryx-test.example${pfad}`, { headers: token ? { Cookie: meinCookie(token).split(";")[0]! } : {} });
const args = (request: Request) => ({ request, params: {}, context: {} }) as never;

describe("Anmeldung nur für bestehende Profile", () => {
  it("schickt ohne Profil keinen Code und legt kein Konto an", async () => {
    await fordereCodeAn(NEU, { nurBestehende: true });
    expect(await identityDb.entwicklungsMail.count({ where: { an: NEU } })).toBe(0);
    expect((await pruefeCode(NEU, "123456", MEIN_BEREICH, { nurBestehende: true })).ok).toBe(false);
    expect((await restdaten(NEU)).kundin).toBe(false);
  });

  it("meldet bestehende Profile an, ohne einen Shop „mein-ommetryx“ zu vermerken", async () => {
    await profilImShop();
    const a = await meinAnmelden();
    const shops = await identityDb.shopVerknuepfung.findMany({ where: { kundinId: a.kundinId } });
    expect(shops.map((s) => s.shop)).toEqual([SHOP]);
    expect(await kundinAusToken(a.token, MEIN_BEREICH)).not.toBeNull();
    // Die Sitzung gilt nicht im Shop und umgekehrt.
    expect(await kundinAusToken(a.token, SHOP)).toBeNull();
  });
});

describe("Seiten schützen", () => {
  it("leitet ohne Anmeldung zur Anmeldeseite", async () => {
    let antwort: unknown;
    try {
      await meinLoader(args(anfrage("/mein")));
    } catch (geworfen) {
      antwort = geworfen;
    }
    expect((antwort as Response).status).toBe(302);
    expect((antwort as Response).headers.get("Location")).toBe("/mein/anmelden");
  });

  it("findet die Sitzung auch, wenn der Browser zusätzlich ein altes Cookie schickt", async () => {
    await profilImShop();
    const a = await meinAnmelden();
    const request = new Request("https://ommetryx-test.example/mein", {
      headers: { Cookie: `ox_mein=veraltet-${"x".repeat(40)}; ${meinCookie(a.token).split(";")[0]}` },
    });
    expect((await meinLoader(args(request))).email).toBe(EMAIL);
  });

  it("liefert den Export als Datei, ohne Zwischenspeichern", async () => {
    await profilImShop();
    const a = await meinAnmelden();
    const antwort = await datenLoader(args(anfrage("/mein/daten", a.token)));
    expect(antwort.headers.get("Content-Disposition")).toMatch(/^attachment; filename="ommetryx-daten-/);
    expect(antwort.headers.get("Cache-Control")).toBe("no-store");
    const daten = await antwort.json();
    expect(daten.email).toBe(EMAIL);
    expect(daten.koerpermasse).toEqual({ koerpergroesse: 168, brust: 96, huefte: 102 });
  });
});

describe("Export", () => {
  it("enthält alles zur Kundin und nichts von anderen", async () => {
    const a = await profilImShop();
    await profilImShop(ANDERE);
    const daten = await datenExport(a.kundinId);
    expect(daten.email).toBe(EMAIL);
    expect(daten.shops.map((s) => s.shop)).toEqual([SHOP]);
    expect(daten.einwilligungen).toHaveLength(1);
    expect(JSON.stringify(daten)).not.toContain(ANDERE);
  });
});

describe("Löschen", () => {
  it("entfernt Maße, E-Mail, Sitzungen, Codes; Nachweise bleiben ohne Personenbezug", async () => {
    const a = await profilImShop();
    await loescheKundin(a.kundinId);

    expect(await restdaten(EMAIL)).toEqual({ kundin: false, codes: 0, schutz: 0, profil: 0 });
    expect(await ladeProfil(a.pseudonymId)).toBeNull();
    expect(await kundinAusToken(a.token, SHOP)).toBeNull();
    const nachweise = await identityDb.einwilligung.findMany({ where: { shop: SHOP } });
    expect(nachweise).toHaveLength(1);
    expect(nachweise[0]!.kundinId).toBeNull();
    expect(nachweise[0]!.widerrufenAm).not.toBeNull();
  });

  it("Widerruf der Profil-Einwilligung löscht das Profil", async () => {
    const a = await profilImShop();
    const e = await identityDb.einwilligung.findFirstOrThrow({ where: { kundinId: a.kundinId } });
    expect(await widerrufe(a.kundinId, e.id)).toBe("geloescht");
    expect((await restdaten(EMAIL)).kundin).toBe(false);
  });

  it("eine fremde Einwilligung kann nicht widerrufen werden", async () => {
    const a = await profilImShop();
    const b = await profilImShop(ANDERE);
    const fremd = await identityDb.einwilligung.findFirstOrThrow({ where: { kundinId: b.kundinId } });
    expect(await widerrufe(a.kundinId, fremd.id)).toBe("unbekannt");
    expect((await restdaten(ANDERE)).kundin).toBe(true);
  });
});

describe("Shops trennen", () => {
  it("meldet die Kundin im Shop ab und entfernt die Verbindung", async () => {
    const a = await profilImShop();
    await trenneShop(a.kundinId, SHOP);
    expect(await kundinAusToken(a.token, SHOP)).toBeNull();
    expect(await identityDb.shopVerknuepfung.count({ where: { kundinId: a.kundinId } })).toBe(0);
    // Das Profil selbst bleibt.
    expect(await ladeProfil(a.pseudonymId)).not.toBeNull();
  });
});
