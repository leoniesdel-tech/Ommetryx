// App Proxy: POST /apps/ommetryx/empfehlung → empfohlene Größe.
// Shopify signiert jede Anfrage; authenticate.public.appProxy prüft die Signatur (HMAC).
// Körpermaße nur im JSON-Inhalt, werden nicht gespeichert und nicht geloggt.

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { shopAktiv } from "../widget/aktiv.server";
import { anfrageErlaubt } from "../widget/begrenzung.server";
import { antwort, empfehlung } from "../widget/anfrage.server";

export const loader = () => antwort({ fehler: "nur_post" }, 405);

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.public.appProxy(request);
  if (!session) return antwort({ fehler: "nicht_installiert" }, 404);
  if (!(await shopAktiv(session.shop))) return antwort({ fehler: "nicht_aktiv" }, 403);
  if (request.method !== "POST") return antwort({ fehler: "nur_post" }, 405);
  if (!anfrageErlaubt(session.shop, request.headers.get("X-Forwarded-For"))) return antwort({ fehler: "zu_viele_anfragen" }, 429);

  let inhalt: unknown;
  try {
    inhalt = await request.json();
  } catch {
    return antwort({ fehler: "ungueltige_eingabe" }, 400);
  }
  return empfehlung(session.shop, inhalt);
};
