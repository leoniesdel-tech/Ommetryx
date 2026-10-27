// Einrichtung im Shopify-Admin (Figma H01, H09): AVV bestätigen, Position prüfen, Abdeckung.
//
// Freischaltung im Shop: Nach dem AVV setzt die App ein App-Metafeld (ommetryx.aktiv = true).
// Der App-Block liest es mit app.metafields und zeigt den Button erst dann. Der Server prüft
// den AVV zusätzlich bei jeder Widget-Anfrage (widget/aktiv.server.ts).

import db from "../db.server";
import { AVV } from "./texte";

interface AdminGraphql {
  graphql: (abfrage: string, optionen?: { variables?: Record<string, unknown> }) => Promise<Response>;
}

interface GraphqlAntwort<T> {
  data?: T;
  errors?: { message: string }[];
}

async function frage<T>(admin: AdminGraphql, abfrage: string, variables?: Record<string, unknown>): Promise<T> {
  const antwort = await admin.graphql(abfrage, variables ? { variables } : undefined);
  const json = (await antwort.json()) as GraphqlAntwort<T>;
  if (!json.data) throw new Error("Shopify-Abfrage fehlgeschlagen");
  return json.data;
}

export interface Einrichtung {
  avvBestaetigt: boolean;
  avvBestaetigtAm: string | null;
  avvVersion: string | null;
  positionGeprueft: boolean;
  ausgeblendet: boolean;
  produkteGesamt: number | null;
  produkteVermessen: number;
  produkteVorgemerkt: number;
}

export async function ladeEinrichtung(admin: AdminGraphql, shop: string): Promise<Einrichtung> {
  // Wer die App im Admin öffnet, hat sie installiert.
  const zeile = await db.shop.upsert({ where: { domain: shop }, create: { domain: shop }, update: { deinstalliertAm: null } });
  const vermessen = await db.artikel.count({ where: { shopId: zeile.id, status: "vermessen" } });
  let gesamt: number | null = null;
  try {
    const daten = await frage<{ productsCount: { count: number } }>(admin, `#graphql
      query Produktanzahl { productsCount { count } }`);
    gesamt = daten.productsCount.count;
  } catch {
    // Anzahl ist nur Zusatzinfo – Startseite funktioniert auch ohne.
  }
  const aktuell = zeile.avvVersion === AVV.version && zeile.avvBestaetigtAm !== null;
  return {
    avvBestaetigt: aktuell,
    avvBestaetigtAm: zeile.avvBestaetigtAm?.toISOString() ?? null,
    avvVersion: zeile.avvVersion,
    positionGeprueft: zeile.positionGeprueftAm !== null,
    ausgeblendet: zeile.einrichtungAusgeblendet,
    produkteGesamt: gesamt,
    produkteVermessen: vermessen,
    // Vormerken kommt in Etappe 9b (Produkte).
    produkteVorgemerkt: 0,
  };
}

/** Setzt das App-Metafeld, das den Button im Shop freischaltet (oder sperrt). */
export async function setzeFreischaltung(admin: AdminGraphql, aktiv: boolean) {
  const { currentAppInstallation } = await frage<{ currentAppInstallation: { id: string } }>(admin, `#graphql
    query AppInstallation { currentAppInstallation { id } }`);
  const daten = await frage<{ metafieldsSet: { userErrors: { message: string }[] } }>(
    admin,
    `#graphql
      mutation Freischaltung($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) { userErrors { message } }
      }`,
    {
      metafields: [{ ownerId: currentAppInstallation.id, namespace: "ommetryx", key: "aktiv", type: "boolean", value: aktiv ? "true" : "false" }],
    },
  );
  if (daten.metafieldsSet.userErrors.length > 0) throw new Error("Freischaltung fehlgeschlagen");
}

export async function bestaetigeAvv(admin: AdminGraphql, shop: string) {
  await db.shop.upsert({
    where: { domain: shop },
    create: { domain: shop, avvVersion: AVV.version, avvBestaetigtAm: new Date() },
    update: { avvVersion: AVV.version, avvBestaetigtAm: new Date() },
  });
  await setzeFreischaltung(admin, true);
}

export async function setzePositionGeprueft(shop: string, geprueft: boolean) {
  await db.shop.update({ where: { domain: shop }, data: { positionGeprueftAm: geprueft ? new Date() : null } });
}

export async function setzeAusgeblendet(shop: string, ausgeblendet: boolean) {
  await db.shop.update({ where: { domain: shop }, data: { einrichtungAusgeblendet: ausgeblendet } });
}

/** Schritte der Einrichtung, rein rechnend (für Fortschritt und Tests). */
export function einrichtungsSchritte(e: Einrichtung, widgetAktiv: boolean | null) {
  const schritte = [
    { id: "avv", erledigt: e.avvBestaetigt },
    { id: "widget", erledigt: widgetAktiv === true },
    { id: "position", erledigt: e.positionGeprueft },
    { id: "artikel", erledigt: e.produkteVorgemerkt + e.produkteVermessen > 0 },
    { id: "muster", erledigt: e.produkteVermessen > 0 },
  ] as const;
  return { schritte, erledigt: schritte.filter((s) => s.erledigt).length, gesamt: schritte.length };
}
