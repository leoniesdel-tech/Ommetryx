// /intern/messbuch/:id – Teil ansehen und bearbeiten.

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect, useActionData, useLoaderData, useSearchParams } from "react-router";
import db from "../db.server";
import { MASSFELDER, wachstumsHinweise } from "../intern/erfassung";
import type { Masse, Massfeld } from "../intern/erfassung";
import { konfiguration } from "../intern/erfassung.server";
import { MessFormular } from "../intern/MessFormular";
import type { MessVorgabe } from "../intern/MessFormular";
import { pruefeMessArtikel } from "../intern/messbuch";
import { ladeMessArtikel, ladeMessListe, loescheMessArtikel, speichereMessArtikel } from "../intern/messbuch.server";
import { pruefeHerkunft, verlangeTeam } from "../intern/team.server";

const komma = (wert: number | null | undefined) => (wert === null || wert === undefined ? "" : String(wert).replace(".", ","));

function pruefeId(roh: string | undefined) {
  if (!roh || !/^\d{1,9}$/.test(roh)) throw new Response("Nicht gefunden", { status: 404 });
  return Number(roh);
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await verlangeTeam(db, request);
  const a = await ladeMessArtikel(pruefeId(params.id));
  if (!a) throw new Response("Nicht gefunden", { status: 404 });
  const [k, liste] = await Promise.all([konfiguration(), ladeMessListe({})]);

  const vorgabe: MessVorgabe = {
    herkunft: a.herkunft,
    onlineShop: a.onlineShop,
    marke: a.marke ?? "",
    produktname: a.produktname,
    link: a.link ?? "",
    notiz: a.notiz ?? "",
    kategorie: a.kategorie,
    schnitt: a.schnitt,
    dehnung: komma(a.materialDehnungProzent),
    material: a.materialZusammensetzung,
    tailliert: a.tailliert,
    bundTyp: a.bundTyp ?? "",
    aermelTyp: a.aermelTyp ?? "",
    messhoehe: komma(a.messhoeheBrustCm),
    // Anzeige wie gemessen: Umfänge wieder halbieren.
    groessen: a.groessen.map((g) => ({
      groesse: g.groesse,
      flach: Object.fromEntries(MASSFELDER.map(({ feld, umfang }) => [feld, komma(g[feld] === null ? null : umfang ? g[feld] / 2 : g[feld])])),
    })),
  };

  const masse = (g: (typeof a.groessen)[number]): Masse =>
    Object.fromEntries(MASSFELDER.flatMap(({ feld }) => (g[feld] === null ? [] : [[feld as Massfeld, g[feld]]])));

  return {
    id: a.id,
    vorgabe,
    gemessen: a.groessen.map((g) => ({ groesse: g.groesse, von: g.gemessenVon?.name ?? "unbekannt", am: g.gemessenAm.toISOString() })),
    hinweise: wachstumsHinweise(a.groessen.map((g) => ({ groesse: g.groesse, masse: masse(g) }))),
    kategorien: k.artikelarten.map((name) => ({ name, text: k.artikelart(name).name })),
    shops: liste.optionen.shops,
  };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  pruefeHerkunft(request);
  const team = await verlangeTeam(db, request);
  const id = pruefeId(params.id);
  const form = await request.formData();
  if (form.get("absicht") === "loeschen") {
    await loescheMessArtikel(id);
    return redirect("/intern/messbuch");
  }
  const pruefung = pruefeMessArtikel(form, await konfiguration());
  if (!pruefung.ok) return { fehler: pruefung.fehler };
  await speichereMessArtikel(id, pruefung.daten, team.id);
  return redirect(`/intern/messbuch/${id}?gespeichert=1`);
};

export default function TeilBearbeiten() {
  const daten = useLoaderData<typeof loader>();
  const antwort = useActionData<typeof action>();
  const [params] = useSearchParams();

  return (
    <>
      <p>
        <Link to="/intern/messbuch">← Messbuch</Link>
      </p>
      <h1>{daten.vorgabe.produktname}</h1>

      {params.get("gespeichert") && !antwort?.fehler && (
        <p className="meldung meldung-ok" role="status">
          Gespeichert.
        </p>
      )}
      {daten.hinweise.length > 0 && (
        <div className="meldung" role="status">
          {daten.hinweise.map((h) => (
            <p key={h} className="hinweis" style={{ margin: 0 }}>
              Hinweis: {h}
            </p>
          ))}
        </div>
      )}

      <p className="erklaerung">
        {daten.gemessen.map((g) => `${g.groesse}: ${g.von}, ${new Date(g.am).toLocaleDateString("de-DE")}`).join(" · ")}
      </p>

      {/* key: Nach dem Speichern zeigt das Formular den neuen Stand. */}
      <MessFormular key={JSON.stringify(daten.vorgabe)} vorgabe={daten.vorgabe} kategorien={daten.kategorien} shops={daten.shops} fehler={antwort?.fehler} knopf="Änderungen speichern" />

      <Form
        method="post"
        onSubmit={(e) => {
          if (!window.confirm("Dieses Teil mit allen Größen endgültig löschen?")) e.preventDefault();
        }}
      >
        <input type="hidden" name="absicht" value="loeschen" />
        <button className="knopf knopf-zweit" type="submit">
          Teil löschen
        </button>
      </Form>
    </>
  );
}
