// /intern/messbuch/neu – neues Teil anlegen.

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Link, redirect, useActionData, useLoaderData } from "react-router";
import db from "../db.server";
import { konfiguration } from "../intern/erfassung.server";
import { LEER, MessFormular } from "../intern/MessFormular";
import { pruefeMessArtikel } from "../intern/messbuch";
import { ladeMessListe, speichereMessArtikel } from "../intern/messbuch.server";
import { pruefeHerkunft, verlangeTeam } from "../intern/team.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verlangeTeam(db, request);
  const [k, liste] = await Promise.all([konfiguration(), ladeMessListe({})]);
  return { kategorien: k.artikelarten.map((name) => ({ name, text: k.artikelart(name).name })), shops: liste.optionen.shops };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  pruefeHerkunft(request);
  const team = await verlangeTeam(db, request);
  const pruefung = pruefeMessArtikel(await request.formData(), await konfiguration());
  if (!pruefung.ok) return { fehler: pruefung.fehler };
  const id = await speichereMessArtikel(null, pruefung.daten, team.id);
  return redirect(`/intern/messbuch/${id}?gespeichert=1`);
};

export default function NeuesTeil() {
  const { kategorien, shops } = useLoaderData<typeof loader>();
  const antwort = useActionData<typeof action>();

  return (
    <>
      <p>
        <Link to="/intern/messbuch">← Messbuch</Link>
      </p>
      <h1>Neues Teil</h1>
      <MessFormular vorgabe={LEER} kategorien={kategorien} shops={shops} fehler={antwort?.fehler} knopf="Teil speichern" />
    </>
  );
}
