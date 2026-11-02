// /intern/messbuch – alle vermessenen Teile, mit Suche und Filtern.

import type { LoaderFunctionArgs } from "react-router";
import { Form, Link, useLoaderData, useSubmit } from "react-router";
import db from "../db.server";
import { konfiguration } from "../intern/erfassung.server";
import { HERKUNFT } from "../intern/messbuch";
import type { Herkunft } from "../intern/messbuch";
import { ladeMessListe } from "../intern/messbuch.server";
import { verlangeTeam } from "../intern/team.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verlangeTeam(db, request);
  const url = new URL(request.url);
  const filter = {
    suche: url.searchParams.get("suche") ?? "",
    kategorie: url.searchParams.get("kategorie") ?? "",
    shop: url.searchParams.get("shop") ?? "",
    groesse: url.searchParams.get("groesse") ?? "",
  };
  const [liste, k] = await Promise.all([ladeMessListe(filter), konfiguration()]);
  const kategorieName = Object.fromEntries(k.artikelarten.map((name) => [name, k.artikelart(name).name]));
  return { ...liste, filter, kategorieName };
};

export default function Messbuch() {
  const { artikel, gesamt, optionen, filter, kategorieName } = useLoaderData<typeof loader>();
  const senden = useSubmit();
  const gefiltert = Boolean(filter.suche || filter.kategorie || filter.shop || filter.groesse);

  return (
    <>
      <div className="mess-titel">
        <h1 style={{ margin: 0 }}>Messbuch</h1>
        <Link className="knopf" to="/intern/messbuch/neu">
          Neues Teil
        </Link>
      </div>

      <Form method="get" className="karte mess-felder" onChange={(e) => (e.target as HTMLElement).tagName === "SELECT" && senden(e.currentTarget)}>
        <div className="feld" style={{ marginBottom: 0 }}>
          <label htmlFor="suche">Suche</label>
          <input id="suche" name="suche" type="search" defaultValue={filter.suche} placeholder="Produkt, Marke, Shop" />
        </div>
        <div className="feld" style={{ marginBottom: 0 }}>
          <label htmlFor="kategorie">Kategorie</label>
          <select id="kategorie" name="kategorie" defaultValue={filter.kategorie}>
            <option value="">Alle</option>
            {optionen.kategorien.map((k) => (
              <option key={k} value={k}>
                {kategorieName[k] ?? k}
              </option>
            ))}
          </select>
        </div>
        <div className="feld" style={{ marginBottom: 0 }}>
          <label htmlFor="shop">Online-Shop</label>
          <select id="shop" name="shop" defaultValue={filter.shop}>
            <option value="">Alle</option>
            {optionen.shops.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="feld" style={{ marginBottom: 0 }}>
          <label htmlFor="groesse">Größe</label>
          <select id="groesse" name="groesse" defaultValue={filter.groesse}>
            <option value="">Alle</option>
            {optionen.groessen.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
        <button className="knopf knopf-zweit" type="submit" style={{ alignSelf: "end" }}>
          Suchen
        </button>
      </Form>

      <p className="erklaerung" role="status">
        {gesamt === 1 ? "1 Teil" : `${gesamt} Teile`}
        {gesamt > artikel.length ? `, die neuesten ${artikel.length} werden angezeigt` : ""}
      </p>

      {artikel.length === 0 ? (
        <p className="karte">
          {gefiltert ? "Kein Teil passt zu diesen Filtern." : "Noch keine Teile. Legt mit „Neues Teil“ das erste an."}
        </p>
      ) : (
        <ul className="mess-liste">
          {artikel.map((a) => (
            <li key={a.id}>
              <Link to={`/intern/messbuch/${a.id}`} className="karte mess-eintrag">
                <strong>{a.produktname}</strong>
                <span>
                  {[a.marke, a.onlineShop].filter(Boolean).join(" · ")}
                </span>
                <span className="erklaerung">
                  {kategorieName[a.kategorie] ?? a.kategorie} · {HERKUNFT[a.herkunft as Herkunft] ?? a.herkunft} · Größen: {a.groessen.map((g) => g.groesse).join(", ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
