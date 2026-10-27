// Wünsche des Händlers je Produkt speichern. Erfundener Test-Shop, wird danach aufgeräumt.

import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { anzahlVorgemerkt, setzeWunsch } from "../app/haendler/produkte.server";

const db = new PrismaClient();
const SHOP = "produkte-test.myshopify.com";
const p = (n: number) => `gid://shopify/Product/${n}`;

beforeAll(async () => {
  await db.shop.deleteMany({ where: { domain: SHOP } });
  const shop = await db.shop.create({ data: { domain: SHOP } });
  // Produkt 3 ist vom Team schon erfasst (live).
  await db.artikel.create({
    data: {
      shopId: shop.id,
      shopifyProduktId: p(3),
      titel: "Erfundene Bluse",
      artikelart: "web_oberteil",
      schnitt: "regulaer",
      schnittQuelle: "manuell",
      materialDehnungProzent: 0,
      status: "vermessen",
    },
  });
});

afterAll(async () => {
  await db.shop.deleteMany({ where: { domain: SHOP } });
  await db.$disconnect();
});

describe("Wunsch des Händlers", () => {
  it("merkt vor, ändert aber keine Produkte, die das Team schon erfasst", async () => {
    expect(await setzeWunsch(SHOP, [p(1), p(2), p(3)], "vorgemerkt")).toBe(2);
    expect(await anzahlVorgemerkt(SHOP)).toBe(2);
    expect(await db.produktWunsch.count({ where: { shopifyProduktId: p(3) } })).toBe(0);
  });

  it("überschreibt den Wunsch und setzt ihn zurück", async () => {
    await setzeWunsch(SHOP, [p(2)], "keine_beratung");
    expect(await anzahlVorgemerkt(SHOP)).toBe(1);
    await setzeWunsch(SHOP, [p(1), p(2)], null);
    expect(await db.produktWunsch.count({ where: { shop: { domain: SHOP } } })).toBe(0);
  });

  it("ignoriert ungültige Produkt-IDs", async () => {
    expect(await setzeWunsch(SHOP, ["gid://shopify/Order/1", "kaputt", "' OR 1=1"], "vorgemerkt")).toBe(0);
  });
});
