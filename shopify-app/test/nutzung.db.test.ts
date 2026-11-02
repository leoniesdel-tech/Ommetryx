// Tageszähler und Mindestgruppe. Erfundener Test-Shop, wird danach aufgeräumt.

import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { MINDESTGRUPPE, fuerAnzeige } from "../app/haendler/nutzung";
import { ladeNutzung, zaehleNutzung } from "../app/haendler/nutzung.server";

const db = new PrismaClient();
const SHOP = "nutzung-test.myshopify.com";
const HEUTE = new Date("2026-11-20T12:00:00Z");
const vorTagen = (n: number) => new Date(HEUTE.getTime() - n * 24 * 3600 * 1000);

beforeAll(async () => {
  await db.shop.deleteMany({ where: { domain: SHOP } });
  await db.shop.create({ data: { domain: SHOP } });
});

afterAll(async () => {
  await db.shop.deleteMany({ where: { domain: SHOP } });
  await db.$disconnect();
});

describe("Tageszähler", () => {
  it("zählt je Tag in einer Zeile hoch und summiert über 30 Tage", async () => {
    await zaehleNutzung(SHOP, "widget_geoeffnet", HEUTE);
    await zaehleNutzung(SHOP, "widget_geoeffnet", HEUTE);
    await zaehleNutzung(SHOP, "widget_geoeffnet", vorTagen(29));
    await zaehleNutzung(SHOP, "widget_geoeffnet", vorTagen(30));
    expect(await db.nutzungTag.count({ where: { shop: { domain: SHOP } } })).toBe(3);
    expect(await ladeNutzung(SHOP, HEUTE)).toEqual({ widget_geoeffnet: 3 });
  });

  it("unbekannter Shop stört nicht", async () => {
    await expect(zaehleNutzung("gibt-es-nicht.myshopify.com", "widget_geoeffnet")).resolves.toBeUndefined();
  });
});

describe("Mindestgruppe", () => {
  it("zeigt nur Zahlen ab 20", () => {
    expect(MINDESTGRUPPE).toBe(20);
    expect(fuerAnzeige({ widget_geoeffnet: 20, empfehlung_berechnet: 19 })).toEqual({ widget_geoeffnet: 20, empfehlung_berechnet: null, groesse_uebernommen: null });
  });
});
