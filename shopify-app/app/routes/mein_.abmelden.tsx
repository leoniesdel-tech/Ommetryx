// /mein/abmelden – beendet die Sitzung (nur per Formular, POST).

import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { pruefeHerkunft } from "../intern/team.server";
import { meinAbmelden, meinCookieLoeschen } from "../kundin/mein-sitzung.server";

export const loader = () => redirect("/mein");

export const action = async ({ request }: ActionFunctionArgs) => {
  pruefeHerkunft(request);
  await meinAbmelden(request);
  return redirect("/mein/anmelden", { headers: { "Set-Cookie": meinCookieLoeschen() } });
};
