// App Proxy: POST /apps/ommetryx/ereignis → zählt „Größe übernommen“. Enthält nur die Art, keine Maße, keine Kennung.
// Signaturprüfung (HMAC) über authenticate.public.appProxy.

import type { ActionFunctionArgs } from "react-router";
import { zaehleNutzung } from "../haendler/nutzung.server";
import { authenticate } from "../shopify.server";
import { shopAktiv } from "../widget/aktiv.server";
import { antwort } from "../widget/anfrage.server";
import { anfrageErlaubt } from "../widget/begrenzung.server";

export const loader = () => antwort({ fehler: "nur_post" }, 405);

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.public.appProxy(request);
  if (!session) return antwort({ fehler: "nicht_installiert" }, 404);
  if (!(await shopAktiv(session.shop))) return antwort({ fehler: "nicht_aktiv" }, 403);
  if (request.method !== "POST") return antwort({ fehler: "nur_post" }, 405);
  if (!anfrageErlaubt(session.shop, request.headers.get("X-Forwarded-For"))) return antwort({ fehler: "zu_viele_anfragen" }, 429);
  await zaehleNutzung(session.shop, "groesse_uebernommen");
  return antwort({ ok: true });
};
