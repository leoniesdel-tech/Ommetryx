// Muster-Versand: Anfrage, keine Doppelung, Status nur im eigenen Shop. Erfundene Test-Shops, werden aufgeräumt.

import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { anfrageSchema, musterSchritt, statusSchema } from "../app/haendler/muster";
import { frageMusterAn, ladeSendungen, setzeMusterStatus } from "../app/haendler/muster.server";
import { setzeWunsch } from "../app/haendler/produkte.server";

const db = new PrismaClient();
const SHOP = "muster-test.myshopify.com";
const ANDERER = "muster-anderer.myshopify.com";

const aufraeumen = () => db.shop.deleteMany({ where: { domain: { in: [SHOP, ANDERER] } } });

beforeAll(async () => {
  await aufraeumen();
  await db.shop.createMany({ data: [{ domain: SHOP }, { domain: ANDERER }] });
});

afterAll(async () => {
  await aufraeumen();
  await db.$disconnect();
});

describe("Muster-Anfrage", () => {
  it("braucht vorgemerkte Produkte", async () => {
    expect(await frageMusterAn(SHOP, { art: "paket", nachricht: null })).toHaveProperty("fehler");
  });

  it("merkt sich Anzahl und verdoppelt eine offene Anfrage nicht", async () => {
    await setzeWunsch(SHOP, ["gid://shopify/Product/1", "gid://shopify/Product/2"], "vorgemerkt");
    expect(await frageMusterAn(SHOP, { art: "paket", nachricht: "Bitte vormittags." })).toEqual({ ok: true });
    expect(await frageMusterAn(SHOP, { art: "termin", nachricht: null })).toHaveProperty("fehler");
    const [sendung] = await ladeSendungen(SHOP);
    expect(sendung).toMatchObject({ art: "paket", anzahlArtikel: 2, status: "angemeldet" });
  });

  it("Team ändert den Status nur im angegebenen Shop", async () => {
    const [sendung] = await ladeSendungen(SHOP);
    expect(await setzeMusterStatus(ANDERER, sendung!.id, "unterwegs", null)).toBe(false);
    expect(await setzeMusterStatus(SHOP, sendung!.id, "unterwegs", "ERFUNDEN-123")).toBe(true);
    expect((await ladeSendungen(SHOP))[0]).toMatchObject({ status: "unterwegs", sendungsnummer: "ERFUNDEN-123" });
  });

  it("nach dem Versand ist wieder eine neue Anfrage möglich", async () => {
    expect(await frageMusterAn(SHOP, { art: "termin", nachricht: null })).toEqual({ ok: true });
  });
});

describe("Eingaben", () => {
  it("prüft Art, Länge und Status", () => {
    expect(anfrageSchema.safeParse({ art: "fax", nachricht: "" }).success).toBe(false);
    expect(anfrageSchema.safeParse({ art: "paket", nachricht: "x".repeat(501) }).success).toBe(false);
    expect(anfrageSchema.parse({ art: "paket", nachricht: "  " }).nachricht).toBeNull();
    expect(statusSchema.safeParse({ id: "1", status: "verloren", sendungsnummer: "" }).success).toBe(false);
  });

  it("Fortschritt von 1 bis 5", () => {
    expect(musterSchritt("angemeldet")).toBe(1);
    expect(musterSchritt("zurueck")).toBe(5);
  });
});
