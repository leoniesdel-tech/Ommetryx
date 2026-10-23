// /intern/abmelden – beendet die Sitzung (nur per Formular, POST).

import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import db from "../db.server";
import { meldeAb, pruefeHerkunft, sitzungsCookieLoeschen } from "../intern/team.server";

export const loader = () => redirect("/intern");

export const action = async ({ request }: ActionFunctionArgs) => {
  pruefeHerkunft(request);
  await meldeAb(db, request);
  return redirect("/intern/anmelden", { headers: { "Set-Cookie": sitzungsCookieLoeschen() } });
};
