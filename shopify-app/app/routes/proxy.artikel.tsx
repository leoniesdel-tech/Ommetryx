// App Proxy: GET /apps/ommetryx/artikel?produkt=123 → Ist das Produkt vermessen?
// Shopify signiert jede Anfrage; authenticate.public.appProxy prüft die Signatur (HMAC).

import type { LoaderFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { shopAktiv } from "../widget/aktiv.server";
import { antwort, artikelInfo } from "../widget/anfrage.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.public.appProxy(request);
  if (!session) return antwort({ fehler: "nicht_installiert" }, 404);
  // Ohne bestätigten AVV gibt es keine Größenberatung (das Widget zeigt dann „nicht verfügbar“).
  if (!(await shopAktiv(session.shop))) return antwort({ vermessen: false });
  return artikelInfo(session.shop, new URL(request.url).searchParams.get("produkt"));
};
