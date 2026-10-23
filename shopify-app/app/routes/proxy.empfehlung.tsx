// App Proxy: POST /apps/ommetryx/empfehlung → empfohlene Größe.
// Shopify signiert jede Anfrage; authenticate.public.appProxy prüft die Signatur (HMAC).
// Körpermaße nur im JSON-Inhalt, werden nicht gespeichert und nicht geloggt.

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { antwort, empfehlung } from "../widget/anfrage.server";

export const loader = () => antwort({ fehler: "nur_post" }, 405);

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.public.appProxy(request);
  if (!session) return antwort({ fehler: "nicht_installiert" }, 404);
  if (request.method !== "POST") return antwort({ fehler: "nur_post" }, 405);

  let inhalt: unknown;
  try {
    inhalt = await request.json();
  } catch {
    return antwort({ fehler: "ungueltige_eingabe" }, 400);
  }
  return empfehlung(session.shop, inhalt);
};
