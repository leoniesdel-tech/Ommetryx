// /intern – Übersicht: Shops mit installierter App.

import type { LoaderFunctionArgs } from "react-router";
import { Link, useLoaderData } from "react-router";
import db from "../db.server";
import { shopsMitArtikeln } from "../intern/erfassung.server";
import { verlangeTeam } from "../intern/team.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verlangeTeam(db, request);
  return { shops: await shopsMitArtikeln() };
};

export default function Uebersicht() {
  const { shops } = useLoaderData<typeof loader>();
  return (
    <>
      <h1>Erfassung der Kleidungsmaße</h1>
      <p>Wählen Sie einen Shop. Dort sehen Sie seine Produkte und können Maße eintragen.</p>
      {shops.length === 0 ? (
        <p className="karte">Noch kein Shop hat die App installiert.</p>
      ) : (
        <div className="tabelle-rahmen">
          <table className="tabelle">
            <thead>
              <tr>
                <th scope="col">Shop</th>
                <th scope="col">Vermessene Artikel</th>
                <th scope="col">Vom Händler vorgemerkt</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((s) => (
                <tr key={s.domain}>
                  <td>
                    <Link to={`/intern/shops/${s.domain}`}>{s.domain}</Link>
                  </td>
                  <td>{s._count.artikel}</td>
                  <td>{s._count.produktWuensche}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
