// /intern/shops/:shop – Produkte eines Shops, mit Status der Erfassung.

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect, useLoaderData, useNavigation } from "react-router";
import db from "../db.server";
import { legeTestbluseAn, produkteDesShops } from "../intern/erfassung.server";
import { pruefeShop, produktNummer } from "../intern/pfade";
import { pruefeHerkunft, verlangeTeam } from "../intern/team.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await verlangeTeam(db, request);
  const shop = pruefeShop(params.shop);
  const suche = new URL(request.url).searchParams.get("suche");
  return { shop, suche, produkte: await produkteDesShops(shop, suche), entwicklung: process.env.NODE_ENV !== "production" };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  pruefeHerkunft(request);
  const team = await verlangeTeam(db, request);
  const shop = pruefeShop(params.shop);
  if (process.env.NODE_ENV === "production") throw new Response("Nicht verfügbar", { status: 404 });
  const gid = await legeTestbluseAn(shop, team.id);
  return redirect(`/intern/shops/${shop}/produkte/${produktNummer(gid)}`);
};

const STATUS: Record<string, string> = { vermessen: "vermessen", entwurf: "Entwurf" };

export default function Produkte() {
  const { shop, suche, produkte, entwicklung } = useLoaderData<typeof loader>();
  const laeuft = useNavigation().state === "submitting";

  return (
    <>
      <p>
        <Link to="/intern">← Alle Shops</Link>
      </p>
      <h1>{shop}</h1>

      <Form method="get" className="zeile" style={{ alignItems: "flex-end", marginBottom: 16 }}>
        <div className="feld" style={{ marginBottom: 0 }}>
          <label htmlFor="suche">Produkt suchen</label>
          <input id="suche" name="suche" defaultValue={suche ?? ""} />
        </div>
        <button className="knopf knopf-zweit" type="submit">
          Suchen
        </button>
      </Form>

      <div className="tabelle-rahmen">
        <table className="tabelle">
          <thead>
            <tr>
              <th scope="col">Produkt</th>
              <th scope="col">Erfassung</th>
            </tr>
          </thead>
          <tbody>
            {produkte.length === 0 && (
              <tr>
                <td colSpan={2}>Keine Produkte gefunden.</td>
              </tr>
            )}
            {produkte.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link to={`/intern/shops/${shop}/produkte/${produktNummer(p.id)}`}>{p.title}</Link>
                </td>
                <td>
                  {p.erfassung ? (
                    <span className={`status ${p.erfassung === "vermessen" ? "status-vermessen" : ""}`}>{STATUS[p.erfassung] ?? p.erfassung}</span>
                  ) : p.wunsch === "vorgemerkt" ? (
                    <span className="status">vom Händler vorgemerkt</span>
                  ) : p.wunsch === "keine_beratung" ? (
                    "Händler: keine Beratung nötig"
                  ) : (
                    "noch nicht erfasst"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {entwicklung && (
        <div className="karte" style={{ marginTop: 32 }}>
          <h2 style={{ marginTop: 0 }}>Nur in der Entwicklung</h2>
          <p>Legt im Shop die „Testbluse Leinen“ (Größen 38–44) an und erfasst sie mit erfundenen Beispielmaßen.</p>
          <Form method="post">
            <button className="knopf knopf-zweit" type="submit" disabled={laeuft}>
              {laeuft ? "Wird angelegt …" : "Testbluse anlegen"}
            </button>
          </Form>
        </div>
      )}
    </>
  );
}
