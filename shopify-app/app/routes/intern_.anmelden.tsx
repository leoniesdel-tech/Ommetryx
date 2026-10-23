// /intern/anmelden – Anmeldung für das Team (E-Mail, Passwort, Zwei-Faktor-Code).

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import db from "../db.server";
import { meldeAn, pruefeHerkunft, sitzungsCookie, teamAusAnfrage } from "../intern/team.server";
import { internLinks } from "../intern/stil";

export const links = internLinks;
export const meta: MetaFunction = () => [{ title: "Anmelden · Ommetryx intern" }, { name: "robots", content: "noindex" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (await teamAusAnfrage(db, request)) throw redirect("/intern");
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  pruefeHerkunft(request);
  const form = await request.formData();
  const ergebnis = await meldeAn(db, {
    email: String(form.get("email") ?? ""),
    passwort: String(form.get("passwort") ?? ""),
    code: String(form.get("code") ?? ""),
  });
  if (!ergebnis.ok) {
    return { fehler: "Anmeldung nicht möglich. Bitte prüfen Sie E-Mail, Passwort und Code. Nach mehreren Fehlversuchen ist das Konto kurz gesperrt." };
  }
  return redirect("/intern", { headers: { "Set-Cookie": sitzungsCookie(ergebnis.sitzungToken) } });
};

export default function Anmelden() {
  const daten = useActionData<typeof action>();
  const laeuft = useNavigation().state === "submitting";

  return (
    <div className="intern">
      <main className="intern-schmal">
        <h1>Ommetryx intern</h1>
        <div className="karte">
          {daten?.fehler && (
            <p className="meldung meldung-fehler" role="alert">
              {daten.fehler}
            </p>
          )}
          <Form method="post">
            <div className="feld">
              <label htmlFor="email">E-Mail</label>
              <input id="email" name="email" type="email" autoComplete="username" required />
            </div>
            <div className="feld">
              <label htmlFor="passwort">Passwort</label>
              <input id="passwort" name="passwort" type="password" autoComplete="current-password" required />
            </div>
            <div className="feld">
              <label htmlFor="code">Code aus der Authenticator-App</label>
              <input
                id="code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9 ]{6,7}"
                maxLength={7}
                required
                aria-describedby="code-erklaerung"
              />
              <span id="code-erklaerung" className="erklaerung">
                6 Ziffern, ändert sich alle 30 Sekunden.
              </span>
            </div>
            <button className="knopf" type="submit" disabled={laeuft}>
              {laeuft ? "Wird geprüft …" : "Anmelden"}
            </button>
          </Form>
        </div>
      </main>
    </div>
  );
}
