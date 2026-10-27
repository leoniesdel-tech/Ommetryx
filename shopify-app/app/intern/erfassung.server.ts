// Datenbank- und Shopify-Zugriffe für die interne Erfassung.

import type { Konfiguration } from "@ommetryx/empfehlung";
import db from "../db.server";
import { aktiveKonfiguration } from "../models/konfiguration.server";
import { ladeArtikel } from "../models/artikel.server";
import { unauthenticated } from "../shopify.server";
import type { GeprüfterArtikel } from "./erfassung";

// Antwortformen der Shopify-Abfragen (nur die abgefragten Felder).
interface ProduktKurz {
  id: string;
  title: string;
  status: string;
}
interface Variante {
  id: string;
  selectedOptions: { name: string; value: string }[];
}
export interface ProduktMitGroessen {
  id: string;
  title: string;
  options: { name: string; optionValues: { name: string }[] }[];
  variants: { nodes: Variante[] };
}
interface GraphqlAntwort<T> {
  data?: T;
}

/** Aktive Konfiguration (einmal je Serverstart geladen). */
export function konfiguration(): Promise<Konfiguration> {
  return aktiveKonfiguration();
}

export { ladeArtikel };

/** Shops mit App-Zugang (aus den Shopify-Sitzungen) und Zahl der vermessenen Artikel. */
export async function shopsMitArtikeln() {
  const domains = await db.session.findMany({ where: { isOnline: false }, select: { shop: true }, distinct: ["shop"] });
  for (const { shop } of domains) {
    await db.shop.upsert({ where: { domain: shop }, create: { domain: shop }, update: {} });
  }
  return db.shop.findMany({
    where: { deinstalliertAm: null },
    orderBy: { domain: "asc" },
    select: {
      domain: true,
      _count: {
        select: {
          artikel: { where: { status: "vermessen" } },
          produktWuensche: { where: { wunsch: "vorgemerkt" } },
        },
      },
    },
  });
}

async function adminFuer(shop: string) {
  const vorhanden = await db.shop.findUnique({ where: { domain: shop } });
  if (!vorhanden || vorhanden.deinstalliertAm) throw new Response("Shop nicht gefunden", { status: 404 });
  const { admin } = await unauthenticated.admin(shop);
  return admin;
}

export async function produkteDesShops(shop: string, suche: string | null) {
  const admin = await adminFuer(shop);
  const antwort = await admin.graphql(
    `#graphql
    query produkteDesShops($suche: String) {
      products(first: 50, query: $suche, sortKey: TITLE) {
        nodes {
          id
          title
          status
        }
      }
    }`,
    { variables: { suche: suche ? `title:*${suche.replace(/[^\p{L}\p{N} -]/gu, "")}*` : null } },
  );
  const json = (await antwort.json()) as GraphqlAntwort<{ products: { nodes: ProduktKurz[] } }>;
  const produkte = json.data?.products.nodes ?? [];
  const erfasst = await db.artikel.findMany({
    where: { shop: { domain: shop }, shopifyProduktId: { in: produkte.map((p) => p.id) } },
    select: { shopifyProduktId: true, status: true },
  });
  const wuensche = await db.produktWunsch.findMany({
    where: { shop: { domain: shop }, shopifyProduktId: { in: produkte.map((p) => p.id) } },
    select: { shopifyProduktId: true, wunsch: true },
  });
  const status = new Map(erfasst.map((a) => [a.shopifyProduktId, a.status]));
  const wunsch = new Map(wuensche.map((w) => [w.shopifyProduktId, w.wunsch]));
  return produkte.map((p) => ({ ...p, erfassung: status.get(p.id) ?? null, wunsch: wunsch.get(p.id) ?? null }));
}

export async function produktMitGroessen(shop: string, produktGid: string) {
  const admin = await adminFuer(shop);
  const antwort = await admin.graphql(
    `#graphql
    query produktMitGroessen($id: ID!) {
      product(id: $id) {
        id
        title
        options {
          name
          optionValues {
            name
          }
        }
        variants(first: 100) {
          nodes {
            id
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }`,
    { variables: { id: produktGid } },
  );
  const json = (await antwort.json()) as GraphqlAntwort<{ product: ProduktMitGroessen | null }>;
  return json.data?.product ?? null;
}

/**
 * Speichert Artikel und Größen (ersetzt alle Größen), vermerkt die Vermessung
 * und markiert das Produkt in Shopify als vermessen (damit der Button im Shop erscheint).
 */
export async function speichereArtikel(shop: string, produktGid: string, titel: string, artikel: GeprüfterArtikel, teamMitgliedId: number) {
  const gespeichert = await speichereInDatenbank(shop, produktGid, titel, artikel, teamMitgliedId);
  await markiereVermessen(shop, produktGid);
  return gespeichert;
}

async function markiereVermessen(shop: string, produktGid: string) {
  const admin = await adminFuer(shop);
  const antwort = await admin.graphql(
    `#graphql
    mutation vermessenMarkieren($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          key
          namespace
          value
        }
        userErrors {
          field
          message
        }
      }
    }`,
    { variables: { metafields: [{ ownerId: produktGid, namespace: "$app", key: "vermessen", type: "boolean", value: "true" }] } },
  );
  const json = (await antwort.json()) as GraphqlAntwort<{ metafieldsSet: { userErrors: { message: string }[] } }>;
  const fehler = json.data?.metafieldsSet.userErrors ?? [];
  if (fehler.length > 0) throw new Error(`Metafeld „vermessen“ nicht gesetzt: ${fehler.map((f) => f.message).join(", ")}`);
}

function speichereInDatenbank(shop: string, produktGid: string, titel: string, artikel: GeprüfterArtikel, teamMitgliedId: number) {
  const { groessen, ...felder } = artikel;
  return db.$transaction(async (tx) => {
    const shopZeile = await tx.shop.upsert({ where: { domain: shop }, create: { domain: shop }, update: {} });
    const gespeichert = await tx.artikel.upsert({
      where: { shopId_shopifyProduktId: { shopId: shopZeile.id, shopifyProduktId: produktGid } },
      create: { shopId: shopZeile.id, shopifyProduktId: produktGid, titel, ...felder, status: "vermessen" },
      update: { titel, ...felder, status: "vermessen" },
    });
    await tx.artikelGroesse.deleteMany({ where: { artikelId: gespeichert.id } });
    await tx.artikelGroesse.createMany({
      data: groessen.map((g) => ({
        artikelId: gespeichert.id,
        groesse: g.groesse,
        shopifyVarianteId: g.shopifyVarianteId,
        reihenfolge: g.reihenfolge,
        ...g.masse,
      })),
    });
    await tx.vermessung.create({ data: { artikelId: gespeichert.id, teamMitgliedId, quelle: "hand" } });
    return gespeichert;
  });
}

/**
 * Nur für Entwicklungs-Shops: legt die „Testbluse Leinen“ (Größen 38–44) in Shopify an
 * und erfasst sie mit erfundenen Beispielmaßen (Rechenbeispiel aus der Excel-Datei).
 */
export async function legeTestbluseAn(shop: string, teamMitgliedId: number) {
  const admin = await adminFuer(shop);
  const groessen = ["38", "40", "42", "44"];
  const antwort = await admin.graphql(
    `#graphql
    mutation testbluseAnlegen($input: ProductSetInput!) {
      productSet(synchronous: true, input: $input) {
        product {
          id
          title
          variants(first: 20) {
            nodes {
              id
              selectedOptions {
                name
                value
              }
            }
          }
        }
        userErrors {
          field
          message
        }
      }
    }`,
    {
      variables: {
        input: {
          title: "Testbluse Leinen",
          status: "ACTIVE",
          productOptions: [{ name: "Größe", values: groessen.map((name) => ({ name })) }],
          variants: groessen.map((name) => ({ optionValues: [{ optionName: "Größe", name }], price: "59.90" })),
        },
      },
    },
  );
  const json = (await antwort.json()) as GraphqlAntwort<{
    productSet: {
      product: { id: string; title: string; variants: { nodes: Variante[] } } | null;
      userErrors: { field: string[] | null; message: string }[];
    };
  }>;
  const ergebnis = json.data?.productSet;
  if (!ergebnis?.product || (ergebnis.userErrors?.length ?? 0) > 0) {
    throw new Error(`Testbluse konnte nicht angelegt werden: ${ergebnis?.userErrors?.map((e) => e.message).join(", ") ?? "keine Antwort"}`);
  }
  const produkt = ergebnis.product;
  // Erfundene Beispielmaße: Brust-Umfang 100 / 104 / 108 / 112 cm, Dehnung 15 % (Klasse 1).
  await speichereArtikel(
    shop,
    produkt.id,
    produkt.title,
    {
      artikelart: "web_oberteil",
      schnitt: "regulaer",
      schnittQuelle: "manuell",
      materialDehnungProzent: 15,
      materialZusammensetzung: "97 % Leinen, 3 % Elastan",
      tailliert: false,
      bundTyp: null,
      aermelTyp: "eingesetzt",
      messhoeheBrustCm: 2.5,
      groessen: groessen.map((groesse, reihenfolge) => ({
        groesse,
        reihenfolge,
        shopifyVarianteId: produkt.variants.nodes.find((v) => v.selectedOptions.some((s) => s.value === groesse))?.id ?? null,
        masse: { brust: 100 + reihenfolge * 4, schulter: 38 + reihenfolge, gesamtlaenge: 68 + reihenfolge },
      })),
    },
    teamMitgliedId,
  );
  return produkt.id;
}
