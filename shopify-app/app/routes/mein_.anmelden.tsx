// /mein/anmelden – Anmeldung bei „Mein Ommetryx“ per E-Mail-Code. Nur für bestehende Profile.

import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { z } from "zod";
import { pruefeHerkunft } from "../intern/team.server";
import { internLinks } from "../intern/stil";
import { fordereCodeAn, MEIN_BEREICH, pruefeCode } from "../kundin/login.server";
import { kundinAusAnfrage, meinCookie, OHNE_CACHE } from "../kundin/mein-sitzung.server";

export const links = internLinks;
export const headers: HeadersFunction = () => OHNE_CACHE;
export const meta: MetaFunction = () => [{ title: "Anmelden · Mein Ommetryx" }, { name: "robots", content: "noindex" }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (await kundinAusAnfrage(request)) throw redirect("/mein");
  return null;
};

const email = z.string().trim().email().max(254);

export const action = async ({ request }: ActionFunctionArgs) => {
  pruefeHerkunft(request);
  const form = await request.formData();
  const adresse = email.safeParse(form.get("email"));
  if (!adresse.success) return { schritt: "email" as const, fehler: "Bitte geben Sie eine gültige E-Mail-Adresse ein." };

  if (form.get("absicht") === "code_anfordern") {
    await fordereCodeAn(adresse.data, { nurBestehende: true });
    return { schritt: "code" as const, email: adresse.data };
  }

  const anmeldung = await pruefeCode(adresse.data, String(form.get("code") ?? ""), MEIN_BEREICH, { nurBestehende: true });
  if (!anmeldung.ok) {
    return {
      schritt: "code" as const,
      email: adresse.data,
      fehler: "Der Code stimmt nicht oder ist abgelaufen. Bitte prüfen Sie ihn oder fordern Sie einen neuen an.",
    };
  }
  return redirect("/mein", { headers: { "Set-Cookie": meinCookie(anmeldung.token) } });
};

export default function MeinAnmelden() {
  const daten = useActionData<typeof action>();
  const laeuft = useNavigation().state === "submitting";
  const codeSchritt = daten?.schritt === "code";

  return (
    <div className="intern">
      <main className="intern-schmal">
        <h1>Mein Ommetryx</h1>
        <p>Hier sehen, ändern und löschen Sie Ihre gespeicherten Maße und Einwilligungen.</p>
        <div className="karte">
          {daten && "fehler" in daten && daten.fehler && (
            <p className="meldung meldung-fehler" role="alert">
              {daten.fehler}
            </p>
          )}
          {!codeSchritt ? (
            <Form method="post">
              <input type="hidden" name="absicht" value="code_anfordern" />
              <div className="feld">
                <label htmlFor="email">E-Mail-Adresse Ihres Profils</label>
                <input id="email" name="email" type="email" autoComplete="email" required />
              </div>
              <button className="knopf" type="submit" disabled={laeuft}>
                {laeuft ? "Wird gesendet …" : "Code senden"}
              </button>
            </Form>
          ) : (
            <Form method="post">
              <p role="status">
                Wenn es zu <strong>{daten.email}</strong> ein Profil gibt, haben wir Ihnen einen 6-stelligen Code geschickt. Er ist 10 Minuten
                gültig.
              </p>
              <input type="hidden" name="email" value={daten.email} />
              <input type="hidden" name="absicht" value="code_pruefen" />
              <div className="feld">
                <label htmlFor="code">Code aus der E-Mail</label>
                <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} required />
              </div>
              <button className="knopf" type="submit" disabled={laeuft}>
                {laeuft ? "Wird geprüft …" : "Anmelden"}
              </button>
            </Form>
          )}
        </div>
        <p className="erklaerung">Noch kein Profil? Ein Profil legen Sie im Größenberater eines Shops mit Ommetryx an.</p>
      </main>
    </div>
  );
}
