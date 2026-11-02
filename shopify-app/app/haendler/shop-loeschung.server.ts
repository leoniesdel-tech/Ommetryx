// Shopify-Pflicht shop/redact: 48 Stunden nach der Deinstallation alle Daten des Shops löschen.
//
// Entscheidung Leonie (2.11.2026): Vermessene Kleidungsmaße bleiben ohne Bezug zum Shop im Archiv, damit
// sich das System weiterentwickeln lässt. Körpermaße und Kundinnen-Profile sind davon getrennt: Sie gehören
// der Kundin und werden hier nicht angefasst, nur die Verbindung zum gelöschten Shop verschwindet.
// Darf mehrfach laufen (Shopify wiederholt Webhooks). Noch anwaltlich zu prüfen.

import db from "../db.server";
import { MASSFELDER } from "../intern/erfassung";
import { identityDb } from "../kundin/datenbanken.server";

export const SHOP_GELOESCHT = "geloescht";

function ersterDesMonats(datum: Date) {
  return new Date(Date.UTC(datum.getUTCFullYear(), datum.getUTCMonth(), 1));
}

export async function loescheShopDaten(shop: string, jetzt = new Date()) {
  // Zuerst die Kundinnen-Seite: eigener Datenbank-Benutzer, nur die Verbindung zum Shop.
  await identityDb.$transaction([
    identityDb.kundinSitzung.deleteMany({ where: { shop } }),
    identityDb.shopVerknuepfung.deleteMany({ where: { shop } }),
    identityDb.einwilligung.updateMany({ where: { shop }, data: { shop: SHOP_GELOESCHT } }),
  ]);

  const artikel = await db.artikel.findMany({
    where: { shop: { domain: shop }, status: "vermessen" },
    include: { groessen: { orderBy: { reihenfolge: "asc" } } },
  });
  const archiviertImMonat = ersterDesMonats(jetzt);

  await db.$transaction([
    db.kleidungsArchiv.createMany({
      data: artikel.map((a) => ({
        artikelart: a.artikelart,
        schnitt: a.schnitt,
        materialDehnungProzent: a.materialDehnungProzent,
        materialZusammensetzung: a.materialZusammensetzung,
        tailliert: a.tailliert,
        bundTyp: a.bundTyp,
        aermelTyp: a.aermelTyp,
        messhoeheBrustCm: a.messhoeheBrustCm,
        groessen: a.groessen.map((g) => ({
          groesse: g.groesse,
          ...Object.fromEntries(MASSFELDER.flatMap(({ feld }) => (g[feld] === null ? [] : [[feld, g[feld]]]))),
        })),
        archiviertImMonat,
      })),
    }),
    // Artikel, Größen, Vermessungen, Wünsche und Sendungen hängen per Cascade am Shop.
    db.shop.deleteMany({ where: { domain: shop } }),
    db.session.deleteMany({ where: { shop } }),
  ]);
  return { archiviert: artikel.length };
}
