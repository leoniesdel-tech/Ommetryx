// shop/redact: Shop-Daten weg, Kleidungsmaße ohne Shop-Bezug im Archiv, Kundinnen-Profil bleibt.
// Erfundene Testdaten in der lokalen Datenbank, werden danach aufgeräumt.

import { createHmac } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { SHOP_GELOESCHT, loescheShopDaten } from "../app/haendler/shop-loeschung.server";
import { identityDb } from "../app/kundin/datenbanken.server";
import { action as complianceAction } from "../app/routes/webhooks.compliance";

const db = new PrismaClient();
const SHOP = "redact-test.myshopify.com";
const WEBHOOK_SHOP = "redact-webhook-test.myshopify.com";
const MARKE = "Redact-Testhose-Erfunden";
const KUNDIN = "redact-kundin-erfunden";
let archivVorher = 0;
let archivIds: number[] = [];

beforeAll(async () => {
  await db.shop.deleteMany({ where: { domain: { in: [SHOP, WEBHOOK_SHOP] } } });
  await identityDb.kundin.deleteMany({ where: { id: KUNDIN } });
  archivIds = (await db.kleidungsArchiv.findMany({ select: { id: true } })).map((a) => a.id);
  archivVorher = archivIds.length;

  await db.session.create({ data: { id: `offline_${SHOP}`, shop: SHOP, state: "", isOnline: false, accessToken: "erfunden", scope: "write_products" } });
  const shop = await db.shop.create({ data: { domain: SHOP, einstellungen: { buttonText: "Test" } } });
  await db.artikel.create({
    data: {
      shopId: shop.id,
      shopifyProduktId: "gid://shopify/Product/777",
      titel: MARKE,
      artikelart: "web_oberteil",
      schnitt: "regulaer",
      schnittQuelle: "manuell",
      materialDehnungProzent: 15,
      status: "vermessen",
      groessen: {
        create: [
          { groesse: "38", reihenfolge: 0, brust: 100, shopifyVarianteId: "gid://shopify/ProductVariant/1" },
          { groesse: "40", reihenfolge: 1, brust: 104, taille: 90 },
        ],
      },
    },
  });
  await db.artikel.create({
    data: { shopId: shop.id, shopifyProduktId: "gid://shopify/Product/778", titel: "Entwurf", artikelart: "web_oberteil", schnitt: "regulaer", schnittQuelle: "manuell", materialDehnungProzent: 0 },
  });
  await db.produktWunsch.create({ data: { shopId: shop.id, shopifyProduktId: "gid://shopify/Product/779", wunsch: "vorgemerkt" } });
  await db.musterSendung.create({ data: { shopId: shop.id, art: "paket", anzahlArtikel: 1 } });

  await identityDb.kundin.create({ data: { id: KUNDIN, emailVerschluesselt: "erfunden", emailHash: "redact-hash-erfunden" } });
  await identityDb.shopVerknuepfung.create({ data: { kundinId: KUNDIN, shop: SHOP } });
  await identityDb.kundinSitzung.create({ data: { tokenHash: "redact-token-erfunden", kundinId: KUNDIN, shop: SHOP, gueltigBis: new Date(Date.now() + 3600000) } });
  await identityDb.einwilligung.create({ data: { kundinId: KUNDIN, zweck: "verarbeitung", textversion: "test", shop: SHOP, mindestens16: true } });
});

afterAll(async () => {
  await db.kleidungsArchiv.deleteMany({ where: { id: { notIn: archivIds } } });
  await db.shop.deleteMany({ where: { domain: { in: [SHOP, WEBHOOK_SHOP] } } });
  await identityDb.kundin.deleteMany({ where: { id: KUNDIN } });
  await db.$disconnect();
});

function webhook(topic: string, inhalt: unknown, geheimnis = "test-api-secret") {
  const text = JSON.stringify(inhalt);
  return new Request("https://ommetryx-test.example/webhooks/compliance", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Hmac-Sha256": createHmac("sha256", geheimnis).update(text, "utf8").digest("base64"),
      "X-Shopify-Topic": topic,
      "X-Shopify-Shop-Domain": WEBHOOK_SHOP,
      "X-Shopify-API-Version": "2026-07",
      "X-Shopify-Webhook-Id": "erfundene-webhook-id",
      "X-Shopify-Event-Id": "erfundene-event-id",
      "X-Shopify-Triggered-At": new Date().toISOString(),
    },
    body: text,
  });
}

async function status(anfrage: Request) {
  try {
    return (await complianceAction({ request: anfrage, params: {}, context: {} } as never)).status;
  } catch (geworfen) {
    if (geworfen instanceof Response) return geworfen.status;
    throw geworfen;
  }
}

describe("Pflicht-Webhooks", () => {
  it("lehnt eine falsche Signatur mit 401 ab und löscht nichts", async () => {
    await db.shop.create({ data: { domain: WEBHOOK_SHOP } });
    expect(await status(webhook("shop/redact", { shop_domain: WEBHOOK_SHOP }, "falsches-geheimnis"))).toBe(401);
    expect(await db.shop.count({ where: { domain: WEBHOOK_SHOP } })).toBe(1);
  });

  it("bestätigt Kunden-Anfragen, ohne etwas zu löschen", async () => {
    const inhalt = { shop_domain: WEBHOOK_SHOP, customer: { id: 1, email: "erfunden@test.invalid" } };
    expect(await status(webhook("customers/data_request", inhalt))).toBe(200);
    expect(await status(webhook("customers/redact", inhalt))).toBe(200);
    expect(await db.shop.count({ where: { domain: WEBHOOK_SHOP } })).toBe(1);
  });

  it("shop/redact löscht den Shop", async () => {
    expect(await status(webhook("shop/redact", { shop_domain: WEBHOOK_SHOP }))).toBe(200);
    expect(await db.shop.count({ where: { domain: WEBHOOK_SHOP } })).toBe(0);
  });
});

describe("shop/redact", () => {
  it("löscht den Shop und archiviert nur vermessene Artikel", async () => {
    expect(await loescheShopDaten(SHOP, new Date("2026-11-17T10:30:00Z"))).toEqual({ archiviert: 1 });
    expect(await db.shop.count({ where: { domain: SHOP } })).toBe(0);
    expect(await db.artikel.count({ where: { titel: MARKE } })).toBe(0);
    expect(await db.session.count({ where: { shop: SHOP } })).toBe(0);
    expect(await db.kleidungsArchiv.count()).toBe(archivVorher + 1);
  });

  it("das Archiv enthält keinen Bezug zum Shop", async () => {
    const eintrag = await db.kleidungsArchiv.findFirstOrThrow({ where: { id: { notIn: archivIds } } });
    const text = JSON.stringify(eintrag);
    for (const wort of [SHOP, MARKE, "gid://", "ProductVariant", "777"]) expect(text).not.toContain(wort);
    expect(eintrag.groessen).toEqual([
      { groesse: "38", brust: 100 },
      { groesse: "40", brust: 104, taille: 90 },
    ]);
    expect(eintrag.archiviertImMonat.toISOString()).toBe("2026-11-01T00:00:00.000Z");
  });

  it("Kundin bleibt, nur die Verbindung zum Shop ist weg", async () => {
    expect(await identityDb.kundin.count({ where: { id: KUNDIN } })).toBe(1);
    expect(await identityDb.shopVerknuepfung.count({ where: { kundinId: KUNDIN } })).toBe(0);
    expect(await identityDb.kundinSitzung.count({ where: { kundinId: KUNDIN } })).toBe(0);
    expect((await identityDb.einwilligung.findFirstOrThrow({ where: { kundinId: KUNDIN } })).shop).toBe(SHOP_GELOESCHT);
  });

  it("darf mehrfach laufen, ohne etwas doppelt zu archivieren", async () => {
    expect(await loescheShopDaten(SHOP)).toEqual({ archiviert: 0 });
    expect(await db.kleidungsArchiv.count()).toBe(archivVorher + 1);
  });
});
