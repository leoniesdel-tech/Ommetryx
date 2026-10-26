// App Proxy: POST /apps/ommetryx/konto → Login per Code, Profil laden/speichern, abmelden.
// Signaturprüfung (HMAC) über authenticate.public.appProxy.

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { antwort } from "../widget/anfrage.server";
import { konto } from "../widget/konto.server";

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
  return konto(session.shop, inhalt);
};
