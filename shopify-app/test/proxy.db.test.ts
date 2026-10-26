// App Proxy des Widgets: Signaturprüfung, Eingabeprüfung, Empfehlung.
// Eigener erfundener Test-Shop in der lokalen Datenbank, wird danach aufgeräumt.

import { createHmac } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { loader as artikelLoader } from "../app/routes/proxy.artikel";
import { action as empfehlungAction } from "../app/routes/proxy.empfehlung";

const db = new PrismaClient();
const SHOP = "proxy-test.myshopify.com";
const PRODUKT = "987654321";

/** Signatur wie Shopify sie beim App Proxy setzt (HMAC-SHA256 über die sortierten Parameter). */
function signierteUrl(pfad: string, extra: Record<string, string> = {}, geheimnis = "test-api-secret") {
  const parameter: Record<string, string> = {
    shop: SHOP,
    path_prefix: "/apps/ommetryx",
    timestamp: String(Math.floor(Date.now() / 1000)),
    logged_in_customer_id: "",
    ...extra,
  };
  const nachricht = Object.keys(parameter)
    .sort()
    .map((k) => `${k}=${parameter[k]}`)
    .join("");
  const signatur = createHmac("sha256", geheimnis).update(nachricht).digest("hex");
  const url = new URL(`https://ommetryx-test.example${pfad}`);
  for (const [k, v] of Object.entries(parameter)) url.searchParams.set(k, v);
  url.searchParams.set("signature", signatur);
  return url.toString();
}

const post = (url: string, inhalt: unknown) =>
  new Request(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(inhalt) });

async function status(versuch: () => Promise<Response>) {
  try {
    return (await versuch()).status;
  } catch (geworfen) {
    if (geworfen instanceof Response) return geworfen.status;
    throw geworfen;
  }
}

const aufrufArgs = (request: Request) => ({ request, params: {}, context: {} }) as never;

beforeAll(async () => {
  await aufraeumen();
  await db.session.create({
    data: { id: `offline_${SHOP}`, shop: SHOP, state: "", isOnline: false, accessToken: "erfunden", scope: "write_products" },
  });
  const shop = await db.shop.create({ data: { domain: SHOP } });
  await db.artikel.create({
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
      groessen: {
        create: [100, 104, 108, 112].map((brust, i) => ({ groesse: String(38 + 2 * i), reihenfolge: i, brust })),
      },
    },
  });
});

async function aufraeumen() {
  await db.shop.deleteMany({ where: { domain: SHOP } });
  await db.session.deleteMany({ where: { shop: SHOP } });
}

afterAll(async () => {
  await aufraeumen();
  await db.$disconnect();
});

describe("Signatur (HMAC)", () => {
  it("lehnt Anfragen ohne Signatur ab", async () => {
    const url = `https://ommetryx-test.example/proxy/artikel?shop=${SHOP}&produkt=${PRODUKT}`;
    expect(await status(() => artikelLoader(aufrufArgs(new Request(url))))).toBeGreaterThanOrEqual(400);
  });

  it("lehnt Anfragen mit falscher Signatur ab", async () => {
    const url = signierteUrl("/proxy/artikel", { produkt: PRODUKT }, "falsches-geheimnis");
    expect(await status(() => artikelLoader(aufrufArgs(new Request(url))))).toBeGreaterThanOrEqual(400);
  });

  it("lehnt eine Empfehlung mit falscher Signatur ab", async () => {
    const url = signierteUrl("/proxy/empfehlung", {}, "falsches-geheimnis");
    const anfrage = post(url, { produkt: PRODUKT, passform: "regulaer", koerper: { koerpergroesse: 168, brust: 96, huefte: 102 } });
    expect(await status(() => empfehlungAction(aufrufArgs(anfrage)))).toBeGreaterThanOrEqual(400);
  });
});

describe("Artikel-Abfrage", () => {
  it("meldet ein vermessenes Produkt", async () => {
    const antwort = await artikelLoader(aufrufArgs(new Request(signierteUrl("/proxy/artikel", { produkt: PRODUKT }))));
    expect(await antwort.json()).toEqual({
      vermessen: true,
      taillePflicht: false,
      tailleGewertet: true,
      meinUrl: "https://ommetryx-test.example/mein",
    });
    expect(antwort.headers.get("Cache-Control")).toBe("no-store");
  });

  it("meldet ein unbekanntes Produkt als nicht vermessen", async () => {
    const antwort = await artikelLoader(aufrufArgs(new Request(signierteUrl("/proxy/artikel", { produkt: "1" }))));
    expect(await antwort.json()).toEqual({ vermessen: false });
  });
});

describe("Empfehlung", () => {
  it("empfiehlt für Brust 96, regulär, Größe 40", async () => {
    const anfrage = post(signierteUrl("/proxy/empfehlung"), {
      produkt: PRODUKT,
      passform: "regulaer",
      koerper: { koerpergroesse: 168, brust: 96, huefte: 102 },
    });
    const antwort = await empfehlungAction(aufrufArgs(anfrage));
    expect(antwort.status).toBe(200);
    const ergebnis = await antwort.json();
    expect(ergebnis.recommended_size).toBe("40");
    expect(ergebnis.status).toBe("empfohlen");
  });

  it("lehnt unrealistische Werte ab und nennt sie in der Antwort nicht", async () => {
    const anfrage = post(signierteUrl("/proxy/empfehlung"), {
      produkt: PRODUKT,
      passform: "regulaer",
      koerper: { koerpergroesse: 168, brust: 999, huefte: 102 },
    });
    const antwort = await empfehlungAction(aufrufArgs(anfrage));
    expect(antwort.status).toBe(400);
    const text = await antwort.text();
    expect(text).not.toContain("999");
    expect(text).not.toContain("168");
  });

  it("lehnt fehlende Felder und kaputtes JSON ab", async () => {
    expect((await empfehlungAction(aufrufArgs(post(signierteUrl("/proxy/empfehlung"), { produkt: PRODUKT })))).status).toBe(400);
    const kaputt = new Request(signierteUrl("/proxy/empfehlung"), { method: "POST", body: "{kein json" });
    expect((await empfehlungAction(aufrufArgs(kaputt))).status).toBe(400);
  });

  it("meldet nicht vermessene Produkte", async () => {
    const anfrage = post(signierteUrl("/proxy/empfehlung"), {
      produkt: "1",
      passform: "regulaer",
      koerper: { koerpergroesse: 168, brust: 96, huefte: 102 },
    });
    expect((await empfehlungAction(aufrufArgs(anfrage))).status).toBe(404);
  });
});
