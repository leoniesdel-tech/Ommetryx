// /mein/geloescht – Bestätigung nach Löschung oder Widerruf.

import type { HeadersFunction, MetaFunction } from "react-router";
import { internLinks } from "../intern/stil";
import { OHNE_CACHE } from "../kundin/mein-sitzung.server";

export const links = internLinks;
export const headers: HeadersFunction = () => OHNE_CACHE;
export const meta: MetaFunction = () => [{ title: "Profil gelöscht · Mein Ommetryx" }, { name: "robots", content: "noindex" }];

export default function Geloescht() {
  return (
    <div className="intern">
      <main className="intern-schmal">
        <h1>Ihr Profil ist gelöscht</h1>
        <div className="karte" role="status">
          <p>Ihre Maße, Ihre E-Mail-Adresse und alle Anmeldungen sind gelöscht. Sie sind überall abgemeldet.</p>
          <p style={{ marginBottom: 0 }}>
            Als Nachweis bleibt nur festgehalten, dass eine Einwilligung erteilt und widerrufen wurde – ohne Bezug zu Ihrer Person.
          </p>
        </div>
      </main>
    </div>
  );
}
