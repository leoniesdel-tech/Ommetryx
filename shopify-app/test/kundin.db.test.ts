// Kundinnen-Daten: Login per Code, Verschlüsselung, Rollentrennung, Einwilligungen, Profil.
// Nur erfundene Adressen mit Endung @test.invalid und ein erfundener Test-Shop.

import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { bodyDb, identityDb } from "../app/kundin/datenbanken.server";
import { hmac } from "../app/lib/krypto.server";
import { fordereCodeAn, kundinAusToken, MAX_ANFORDERUNGEN, MAX_FEHLVERSUCHE, pruefeCode } from "../app/kundin/login.server";
import { ladeProfil, speichereProfil } from "../app/kundin/profil.server";
import { EINWILLIGUNGEN } from "../app/kundin/texte";
import { einwilligungVerarbeitung, konto } from "../app/widget/konto.server";
import { empfehlung } from "../app/widget/anfrage.server";

const SHOP = "kundin-test.myshopify.com";
const ANDERER_SHOP = "anderer-test.myshopify.com";
const EMAIL = "Kundin.Test@Test.invalid";
const PRODUKT = "123456789";
const appDb = new PrismaClient();

async function aufraeumen() {
  const kundinnen = await identityDb.kundin.findMany({
    where: { emailHash: { in: [EMAIL, "andere@test.invalid", "unbekannt@test.invalid"].map((e) => hmac(`email:${e.toLowerCase()}`)) } },
    include: { zuordnung: true },
  });
  const pseudonyme = kundinnen.flatMap((k) => (k.zuordnung ? [k.zuordnung.pseudonymId] : []));
  await bodyDb.koerperprofil.deleteMany({ where: { pseudonymId: { in: pseudonyme } } });
  await identityDb.kundin.deleteMany({ where: { id: { in: kundinnen.map((k) => k.id) } } });
  await identityDb.loginSchutz.deleteMany({
    where: { emailHash: { in: [EMAIL, "andere@test.invalid", "unbekannt@test.invalid"].map((e) => hmac(`email:${e.toLowerCase()}`)) } },
  });
  await identityDb.loginCode.deleteMany({
    where: { emailHash: { in: [EMAIL, "andere@test.invalid", "unbekannt@test.invalid"].map((e) => hmac(`email:${e.toLowerCase()}`)) } },
  });
  await identityDb.entwicklungsMail.deleteMany({ where: { an: { endsWith: "@test.invalid" } } });
  await identityDb.einwilligung.deleteMany({ where: { shop: { in: [SHOP, ANDERER_SHOP] } } });
}

/** Letzter Code aus dem Entwicklungs-Postfach. */
async function letzterCode(email = EMAIL) {
  const mail = await identityDb.entwicklungsMail.findFirst({ where: { an: email.toLowerCase() }, orderBy: { id: "desc" } });
  return mail?.text.match(/\b(\d{6})\b/)?.[1] ?? null;
}

async function anmelden(email = EMAIL) {
  await fordereCodeAn(email);
  const ergebnis = await pruefeCode(email, (await letzterCode(email))!, SHOP);
  if (!ergebnis.ok) throw new Error("Anmeldung fehlgeschlagen");
  return ergebnis;
}

beforeAll(async () => {
  // Testartikel für die Empfehlung mit Token
  await appDb.shop.deleteMany({ where: { domain: SHOP } });
  const shop = await appDb.shop.create({ data: { domain: SHOP } });
  await appDb.artikel.create({
    data: {
      shopId: shop.id,
      shopifyProduktId: `gid://shopify/Product/${PRODUKT}`,
      titel: "Testbluse",
      artikelart: "web_oberteil",
      schnitt: "regulaer",
      schnittQuelle: "manuell",
      materialDehnungProzent: 15,
      aermelTyp: "eingesetzt",
      status: "vermessen",
      groessen: { create: [100, 104, 108, 112].map((brust, i) => ({ groesse: String(38 + 2 * i), reihenfolge: i, brust })) },
    },
  });
});
beforeEach(aufraeumen);
afterAll(async () => {
  await aufraeumen();
  await appDb.shop.deleteMany({ where: { domain: SHOP } });
  await appDb.$disconnect();
});

describe("Login per E-Mail-Code", () => {
  it("legt die Kundin an, E-Mail nur verschlüsselt und als Hash", async () => {
    const a = await anmelden();
    expect(a.neu).toBe(true);
    const zeile = await identityDb.kundin.findUniqueOrThrow({ where: { id: a.kundinId } });
    expect(zeile.emailVerschluesselt).not.toContain("test.invalid");
    expect(zeile.emailHash).not.toContain("test.invalid");
    // Code liegt nur als Hash vor
    const codes = await identityDb.loginCode.findMany({ where: { emailHash: zeile.emailHash } });
    expect(codes.every((c) => !/^\d{6}$/.test(c.codeHash))).toBe(true);
  });

  it("erkennt dieselbe Kundin wieder, Groß-/Kleinschreibung egal", async () => {
    const erste = await anmelden();
    const zweite = await anmelden(EMAIL.toLowerCase());
    expect(zweite.neu).toBe(false);
    expect(zweite.kundinId).toBe(erste.kundinId);
  });

  it("lässt einen Code nur einmal zu", async () => {
    await fordereCodeAn(EMAIL);
    const code = (await letzterCode())!;
    expect((await pruefeCode(EMAIL, code, SHOP)).ok).toBe(true);
    expect((await pruefeCode(EMAIL, code, SHOP)).ok).toBe(false);
  });

  it("sperrt nach zu vielen falschen Codes", async () => {
    await fordereCodeAn(EMAIL);
    const code = (await letzterCode())!;
    const falsch = code === "000000" ? "111111" : "000000";
    for (let i = 0; i < MAX_FEHLVERSUCHE; i++) expect((await pruefeCode(EMAIL, falsch, SHOP)).ok).toBe(false);
    expect((await pruefeCode(EMAIL, code, SHOP)).ok).toBe(false);
  });

  it("begrenzt, wie oft Codes angefordert werden können", async () => {
    for (let i = 0; i < MAX_ANFORDERUNGEN + 2; i++) await fordereCodeAn(EMAIL);
    expect(await identityDb.entwicklungsMail.count({ where: { an: EMAIL.toLowerCase() } })).toBe(MAX_ANFORDERUNGEN);
  });

  it("antwortet bei bekannter und unbekannter E-Mail gleich", async () => {
    await anmelden();
    const bekannt = await konto(SHOP, { aktion: "code_anfordern", email: EMAIL });
    const unbekannt = await konto(SHOP, { aktion: "code_anfordern", email: "unbekannt@test.invalid" });
    expect(bekannt.status).toBe(unbekannt.status);
    expect(await bekannt.json()).toEqual(await unbekannt.json());
  });

  it("die Sitzung gilt nur im Shop, in dem angemeldet wurde", async () => {
    const a = await anmelden();
    expect(await kundinAusToken(a.token, SHOP)).not.toBeNull();
    expect(await kundinAusToken(a.token, ANDERER_SHOP)).toBeNull();
    expect(await kundinAusToken("x".repeat(43), SHOP)).toBeNull();
  });
});

describe("Körperprofil", () => {
  it("speichert verschlüsselt, ohne Historie, und lädt wieder", async () => {
    const a = await anmelden();
    await speichereProfil(a.pseudonymId, { koerpergroesse: 168, brust: 96, huefte: 102 });
    await speichereProfil(a.pseudonymId, { koerpergroesse: 168, brust: 98, huefte: 102, altersgruppe: "30-44" });
    const zeilen = await bodyDb.koerperprofil.findMany({ where: { pseudonymId: a.pseudonymId } });
    expect(zeilen).toHaveLength(1);
    expect(zeilen[0]!.daten).not.toMatch(/98|168|brust/);
    expect(await ladeProfil(a.pseudonymId)).toEqual({ koerpergroesse: 168, brust: 98, huefte: 102, altersgruppe: "30-44" });
  });

  it("nimmt kein Gewicht an", async () => {
    const a = await anmelden();
    await expect(speichereProfil(a.pseudonymId, { koerpergroesse: 168, brust: 96, huefte: 102, gewicht: 60 } as never)).rejects.toThrow();
  });
});

describe("Rollentrennung in der Datenbank", () => {
  it("der Maße-Benutzer kommt nicht an E-Mails oder die Zuordnung", async () => {
    await expect(bodyDb.$queryRawUnsafe("select 1 from identity.kundin limit 1")).rejects.toThrow();
    await expect(bodyDb.$queryRawUnsafe("select 1 from identity.zuordnung limit 1")).rejects.toThrow();
  });

  it("der Login-Benutzer kommt nicht an Maße", async () => {
    await expect(identityDb.$queryRawUnsafe("select 1 from body.koerperprofil limit 1")).rejects.toThrow();
  });

  it("der App-Benutzer kommt an keins von beiden", async () => {
    await expect(appDb.$queryRawUnsafe("select 1 from identity.kundin limit 1")).rejects.toThrow();
    await expect(appDb.$queryRawUnsafe("select 1 from body.koerperprofil limit 1")).rejects.toThrow();
  });
});

describe("Widget-Ablauf über das Konto", () => {
  it("Einwilligung vor der Maßeingabe wird ohne Personenbezug nachgewiesen", async () => {
    const antwort = await einwilligungVerarbeitung(SHOP, { version: EINWILLIGUNGEN.verarbeitung.version, mindestens16: true });
    expect(antwort.status).toBe(200);
    const e = await identityDb.einwilligung.findFirstOrThrow({ where: { shop: SHOP, zweck: "verarbeitung" } });
    expect(e.kundinId).toBeNull();
    expect(e.textversion).toBe(EINWILLIGUNGEN.verarbeitung.version);
  });

  it("lehnt eine veraltete Textversion und fehlendes „mindestens 16“ ab", async () => {
    expect((await einwilligungVerarbeitung(SHOP, { version: "alt", mindestens16: true })).status).toBe(400);
    expect((await einwilligungVerarbeitung(SHOP, { version: EINWILLIGUNGEN.verarbeitung.version, mindestens16: false })).status).toBe(400);
  });

  it("Code prüfen speichert Einwilligung und Profil; danach Empfehlung nur mit Token → 40", async () => {
    await konto(SHOP, { aktion: "code_anfordern", email: EMAIL });
    const antwort = await konto(SHOP, {
      aktion: "code_pruefen",
      email: EMAIL,
      code: await letzterCode(),
      einwilligung: { version: EINWILLIGUNGEN.profil.version, mindestens16: true },
      profil: { koerpergroesse: 168, brust: 96, huefte: 102 },
    });
    expect(antwort.status).toBe(200);
    const { token, hatProfil } = (await antwort.json()) as { token: string; hatProfil: boolean };
    expect(hatProfil).toBe(true);

    const einwilligung = await identityDb.einwilligung.findFirstOrThrow({ where: { shop: SHOP, zweck: "profil" } });
    expect(einwilligung.kundinId).not.toBeNull();

    const laden = await konto(SHOP, { aktion: "profil_laden", token });
    expect(await laden.json()).toEqual({ angemeldet: true, profil: { koerpergroesse: 168, brust: 96, huefte: 102 } });

    const ergebnis = await empfehlung(SHOP, { produkt: PRODUKT, passform: "regulaer", token });
    expect(((await ergebnis.json()) as { recommended_size: string }).recommended_size).toBe("40");
  });

  it("nach dem Abmelden gilt der Token nicht mehr", async () => {
    const a = await anmelden();
    await konto(SHOP, { aktion: "abmelden", token: a.token });
    expect(await (await konto(SHOP, { aktion: "profil_laden", token: a.token })).json()).toEqual({ angemeldet: false });
    expect((await empfehlung(SHOP, { produkt: PRODUKT, passform: "regulaer", token: a.token })).status).toBe(401);
  });

  it("falscher Code: Antwort ohne Hinweis, ob die E-Mail existiert", async () => {
    await konto(SHOP, { aktion: "code_anfordern", email: EMAIL });
    const antwort = await konto(SHOP, {
      aktion: "code_pruefen",
      email: EMAIL,
      code: "000000",
      einwilligung: { version: EINWILLIGUNGEN.profil.version, mindestens16: true },
    });
    expect(antwort.status).toBe(401);
    expect(await antwort.json()).toEqual({ fehler: "code_ungueltig" });
  });
});
