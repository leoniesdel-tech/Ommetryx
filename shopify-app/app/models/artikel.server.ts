// Vermessene Artikel aus der Datenbank laden (für Widget und internen Bereich).

import db from "../db.server";

export function ladeArtikel(shop: string, produktGid: string) {
  return db.artikel.findFirst({
    where: { shop: { domain: shop, deinstalliertAm: null }, shopifyProduktId: produktGid },
    include: {
      groessen: { orderBy: { reihenfolge: "asc" } },
      vermessungen: { orderBy: { erfasstAm: "desc" }, take: 1, include: { teamMitglied: { select: { name: true } } } },
    },
  });
}

export type GeladenerArtikel = NonNullable<Awaited<ReturnType<typeof ladeArtikel>>>;
