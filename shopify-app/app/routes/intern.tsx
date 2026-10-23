// /intern – geschützter Bereich für das Team. Alle Unterseiten erfordern eine Anmeldung.

import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, Outlet, useLoaderData } from "react-router";
import db from "../db.server";
import { verlangeTeam } from "../intern/team.server";
import { internLinks } from "../intern/stil";

export const links = internLinks;
export const meta: MetaFunction = () => [{ title: "Ommetryx intern" }, { name: "robots", content: "noindex" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const team = await verlangeTeam(db, request);
  return { name: team.name };
};

export default function Intern() {
  const { name } = useLoaderData<typeof loader>();
  return (
    <div className="intern">
      <header className="intern-kopf">
        <Link to="/intern">
          <strong>Ommetryx intern</strong>
        </Link>
        <div className="zeile" style={{ alignItems: "center" }}>
          <span>Angemeldet: {name}</span>
          <Form method="post" action="/intern/abmelden">
            <button className="knopf knopf-zweit" type="submit">
              Abmelden
            </button>
          </Form>
        </div>
      </header>
      <main className="intern-inhalt">
        <Outlet />
      </main>
    </div>
  );
}
