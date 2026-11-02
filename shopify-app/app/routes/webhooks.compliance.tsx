// Shopify-Pflicht-Webhooks. authenticate.webhook prüft die Signatur (HMAC) und antwortet bei Fehlern mit 401.
//
// Nachrichten enthalten E-Mail-Adressen und Bestellnummern: Inhalt nie loggen.
// customers/data_request und customers/redact: Wir verknüpfen keine Shopify-Kundinnen und speichern
// keine Bestelldaten, daher gibt es dazu nichts herauszugeben oder zu löschen. Das Ommetryx-Profil gehört
// der Kundin und läuft über „Mein Ommetryx“. Sobald Bestell-Einträge dazukommen, hier ergänzen (Anwaltsfrage 8).

import type { ActionFunctionArgs } from "react-router";
import { loescheShopDaten } from "../haendler/shop-loeschung.server";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);

  switch (topic) {
    case "SHOP_REDACT":
      await loescheShopDaten(shop);
      break;
    case "CUSTOMERS_DATA_REQUEST":
    case "CUSTOMERS_REDACT":
      break;
    default:
      return new Response("Unbekanntes Thema", { status: 404 });
  }
  return new Response();
};
