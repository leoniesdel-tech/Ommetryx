// Produkte im Admin (Figma H03): Produkte aus Shopify laden, Wünsche des Händlers speichern.

import db from "../db.server";
import { haendlerDarfAendern, groessenSpanne, produktStatus } from "./produkte";
import type { ProduktStatus, Wunsch } from "./produkte";

interface AdminGraphql {
  graphql: (abfrage: string, optionen?: { variables?: Record<string, unknown> }) => Promise<Response>;
}

interface ShopifyProdukt {
  id: string;
  title: string;
  productType: string;
  category: { name: string } | null;
  featuredMedia: { preview: { image: { url: string } | null } | null } | null;
  options: { name: string; optionValues: { name: string }[] }[];
}

export interface ProduktZeile {
  id: string;
  titel: string;
  bild: string | null;
  groessen: string;
  kategorie: string;
  status: ProduktStatus;
}

export interface ProduktSeite {
  produkte: ProduktZeile[];
  weiter: string | null;
  zurueck: string | null;
}

const SEITE = 50;

/** Suchbegriff für die Shopify-Suche, nur Buchstaben, Ziffern, Leer- und Bindestriche. */
function suchAbfrage(suche: string | null) {
  const sauber = (suche ?? "").replace(/[^\p{L}\p{N} -]/gu, "").trim();
  return sauber ? `title:*${sauber}*` : null;
}

export async function ladeProdukte(
  admin: AdminGraphql,
  shop: string,
  { suche, nach, vor }: { suche: string | null; nach: string | null; vor: string | null },
): Promise<ProduktSeite> {
  const antwort = await admin.graphql(
    `#graphql
    query HaendlerProdukte($first: Int, $last: Int, $after: String, $before: String, $suche: String) {
      products(first: $first, last: $last, after: $after, before: $before, query: $suche, sortKey: TITLE) {
        nodes {
          id
          title
          productType
          category { name }
          featuredMedia { preview { image { url(transform: { maxWidth: 80, maxHeight: 80 }) } } }
          options { name optionValues { name } }
        }
        pageInfo { hasNextPage hasPreviousPage startCursor endCursor }
      }
    }`,
    {
      variables: {
        ...(vor ? { last: SEITE, before: vor } : { first: SEITE, after: nach }),
        suche: suchAbfrage(suche),
      },
    },
  );
  const json = (await antwort.json()) as {
    data?: {
      products: {
        nodes: ShopifyProdukt[];
        pageInfo: { hasNextPage: boolean; hasPreviousPage: boolean; startCursor: string | null; endCursor: string | null };
      };
    };
  };
  if (!json.data) throw new Error("Produkte konnten nicht geladen werden");
  const { nodes, pageInfo } = json.data.products;
  const ids = nodes.map((p) => p.id);

  const zeile = await db.shop.upsert({ where: { domain: shop }, create: { domain: shop }, update: {} });
  const [artikel, wuensche] = await Promise.all([
    db.artikel.findMany({ where: { shopId: zeile.id, shopifyProduktId: { in: ids } }, select: { shopifyProduktId: true, status: true } }),
    db.produktWunsch.findMany({ where: { shopId: zeile.id, shopifyProduktId: { in: ids } }, select: { shopifyProduktId: true, wunsch: true } }),
  ]);
  const artikelStatus = new Map(artikel.map((a) => [a.shopifyProduktId, a.status]));
  const wunsch = new Map(wuensche.map((w) => [w.shopifyProduktId, w.wunsch]));

  return {
    produkte: nodes.map((p) => ({
      id: p.id,
      titel: p.title,
      bild: p.featuredMedia?.preview?.image?.url ?? null,
      groessen: groessenSpanne(p.options.map((o) => ({ name: o.name, werte: o.optionValues.map((v) => v.name) }))),
      kategorie: p.category?.name || p.productType || "–",
      status: produktStatus(artikelStatus.get(p.id) ?? null, wunsch.get(p.id) ?? null),
    })),
    weiter: pageInfo.hasNextPage ? pageInfo.endCursor : null,
    zurueck: pageInfo.hasPreviousPage ? pageInfo.startCursor : null,
  };
}

const istProduktId = (id: string) => /^gid:\/\/shopify\/Product\/\d{1,20}$/.test(id);

/**
 * Setzt den Wunsch des Händlers (null = zurücksetzen) für mehrere Produkte.
 * Produkte, die das Team schon erfasst, bleiben unverändert. Gibt die Anzahl geänderter Produkte zurück.
 */
export async function setzeWunsch(shop: string, produktIds: string[], wunsch: Wunsch | null): Promise<number> {
  const ids = [...new Set(produktIds)].filter(istProduktId).slice(0, 250);
  if (ids.length === 0) return 0;
  const zeile = await db.shop.upsert({ where: { domain: shop }, create: { domain: shop }, update: {} });
  const erfasst = await db.artikel.findMany({ where: { shopId: zeile.id, shopifyProduktId: { in: ids } }, select: { shopifyProduktId: true, status: true } });
  const gesperrt = new Set(erfasst.filter((a) => !haendlerDarfAendern(produktStatus(a.status, null))).map((a) => a.shopifyProduktId));
  const frei = ids.filter((id) => !gesperrt.has(id));

  await db.$transaction(
    frei.map((shopifyProduktId) =>
      wunsch
        ? db.produktWunsch.upsert({
            where: { shopId_shopifyProduktId: { shopId: zeile.id, shopifyProduktId } },
            create: { shopId: zeile.id, shopifyProduktId, wunsch },
            update: { wunsch },
          })
        : db.produktWunsch.deleteMany({ where: { shopId: zeile.id, shopifyProduktId } }),
    ),
  );
  return frei.length;
}

export async function anzahlVorgemerkt(shop: string): Promise<number> {
  return db.produktWunsch.count({ where: { shop: { domain: shop }, wunsch: "vorgemerkt" } });
}
