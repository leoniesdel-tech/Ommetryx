// /intern/einrichten/:token – Einmalige Einrichtung nach der Einladung:
// Passwort festlegen, Authenticator-App verbinden, mit einem Code bestätigen.

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import db from "../db.server";
import type { EinrichtungsFehler } from "../intern/regeln";
import { MIN_PASSWORT_LAENGE } from "../intern/regeln";
import { ladeEinrichtung, pruefeHerkunft, schliesseEinrichtungAb, sitzungsCookie } from "../intern/team.server";
import { internLinks } from "../intern/stil";

export const links = internLinks;
export const meta: MetaFunction = () => [{ title: "Zugang einrichten · Ommetryx intern" }, { name: "robots", content: "noindex" }];

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const einrichtung = await ladeEinrichtung(db, params.token ?? "");
  return { einrichtung };
};

const FEHLERTEXTE: Record<EinrichtungsFehler, string> = {
  einladung_ungueltig: "Diese Einladung ist abgelaufen oder wurde schon benutzt. Bitte eine neue Einladung anfordern.",
  passwort_zu_kurz: `Das Passwort braucht mindestens ${MIN_PASSWORT_LAENGE} Zeichen.`,
  passwoerter_ungleich: "Die beiden Passwörter stimmen nicht überein.",
  code_falsch: "Der Code passt nicht. Bitte den aktuellen Code aus der App eingeben.",
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  pruefeHerkunft(request);
  const form = await request.formData();
  const ergebnis = await schliesseEinrichtungAb(db, params.token ?? "", {
    passwort: String(form.get("passwort") ?? ""),
    wiederholung: String(form.get("wiederholung") ?? ""),
    code: String(form.get("code") ?? ""),
  });
  if (!ergebnis.ok) return { fehler: FEHLERTEXTE[ergebnis.fehler] };
  return redirect("/intern", { headers: { "Set-Cookie": sitzungsCookie(ergebnis.sitzungToken) } });
};

export default function Einrichten() {
  const { einrichtung } = useLoaderData<typeof loader>();
  const daten = useActionData<typeof action>();
  const laeuft = useNavigation().state === "submitting";

  if (!einrichtung) {
    return (
      <div className="intern">
        <main className="intern-schmal">
          <h1>Einladung nicht gültig</h1>
          <p className="karte">{FEHLERTEXTE.einladung_ungueltig}</p>
        </main>
      </div>
    );
  }

  return (
    <div className="intern">
      <main className="intern-schmal">
        <h1>Hallo {einrichtung.name}, richten Sie Ihren Zugang ein</h1>
        {daten?.fehler && (
          <p className="meldung meldung-fehler" role="alert">
            {daten.fehler}
          </p>
        )}
        <Form method="post">
          <div className="karte">
            <h2 style={{ marginTop: 0 }}>1. Passwort festlegen</h2>
            <div className="feld">
              <label htmlFor="passwort">Neues Passwort</label>
              <input
                id="passwort"
                name="passwort"
                type="password"
                autoComplete="new-password"
                minLength={MIN_PASSWORT_LAENGE}
                required
                aria-describedby="passwort-erklaerung"
              />
              <span id="passwort-erklaerung" className="erklaerung">
                Mindestens {MIN_PASSWORT_LAENGE} Zeichen. Am besten in einem Passwort-Manager speichern.
              </span>
            </div>
            <div className="feld">
              <label htmlFor="wiederholung">Passwort wiederholen</label>
              <input id="wiederholung" name="wiederholung" type="password" autoComplete="new-password" required />
            </div>
          </div>

          <div className="karte">
            <h2 style={{ marginTop: 0 }}>2. Authenticator-App verbinden</h2>
            <p>
              Öffnen Sie auf dem Handy eine Authenticator-App (z. B. Google Authenticator, Microsoft Authenticator oder
              1Password) und scannen Sie diesen QR-Code.
            </p>
            {/* SVG wird auf dem Server von der Bibliothek qrcode erzeugt, kein fremder Inhalt. */}
            <div className="qr" role="img" aria-label="QR-Code für die Authenticator-App" dangerouslySetInnerHTML={{ __html: einrichtung.qrSvg }} />
            <p className="erklaerung">
              QR-Code geht nicht? Diesen Schlüssel in der App von Hand eingeben:
              <br />
              <span className="geheimnis">{einrichtung.geheimnisZumAbtippen}</span>
            </p>
          </div>

          <div className="karte">
            <h2 style={{ marginTop: 0 }}>3. Mit einem Code bestätigen</h2>
            <div className="feld">
              <label htmlFor="code">Aktueller Code aus der App</label>
              <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required />
            </div>
            <button className="knopf" type="submit" disabled={laeuft}>
              {laeuft ? "Wird eingerichtet …" : "Zugang einrichten"}
            </button>
          </div>
        </Form>
      </main>
    </div>
  );
}
