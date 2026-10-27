// App Proxy: POST /apps/ommetryx/einwilligung → Nachweis der Einwilligung vor der Maßeingabe (ohne Personenbezug).

import type { ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import { shopAktiv } from "../widget/aktiv.server";
import { antwort } from "../widget/anfrage.server";
import { einwilligungVerarbeitung } from "../widget/konto.server";

export const loader = () => antwort({ fehler: "nur_post" }, 405);

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.public.appProxy(request);
  if (!session) return antwort({ fehler: "nicht_installiert" }, 404);
  if (!(await shopAktiv(session.shop))) return antwort({ fehler: "nicht_aktiv" }, 403);
  if (request.method !== "POST") return antwort({ fehler: "nur_post" }, 405);
  let inhalt: unknown;
  try {
    inhalt = await request.json();
  } catch {
    return antwort({ fehler: "ungueltige_eingabe" }, 400);
  }
  return einwilligungVerarbeitung(session.shop, inhalt);
};
