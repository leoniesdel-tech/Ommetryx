// /mein – geschützter Bereich „Mein Ommetryx“. Alle Unterseiten erfordern eine Anmeldung.

import type { HeadersFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, Outlet } from "react-router";
import { internLinks } from "../intern/stil";
import { OHNE_CACHE, verlangeKundin } from "../kundin/mein-sitzung.server";

export const links = internLinks;
export const headers: HeadersFunction = () => OHNE_CACHE;
export const meta: MetaFunction = () => [{ title: "Mein Ommetryx" }, { name: "robots", content: "noindex" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verlangeKundin(request);
  return null;
};

export default function Mein() {
  return (
    <div className="intern">
      <header className="intern-kopf">
        <Link to="/mein">
          <strong>Mein Ommetryx</strong>
        </Link>
        <Form method="post" action="/mein/abmelden">
          <button className="knopf knopf-zweit" type="submit">
            Abmelden
          </button>
        </Form>
      </header>
      <main className="intern-inhalt" style={{ maxWidth: 760 }}>
        <Outlet />
      </main>
    </div>
  );
}
