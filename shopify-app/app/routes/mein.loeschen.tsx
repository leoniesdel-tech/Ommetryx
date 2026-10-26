// /mein/loeschen – Profil endgültig löschen (mit Sicherheitsfrage).

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect, useActionData, useNavigation } from "react-router";
import { pruefeHerkunft } from "../intern/team.server";
import { meinCookieLoeschen, verlangeKundin } from "../kundin/mein-sitzung.server";
import { loescheKundin } from "../kundin/verwaltung.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verlangeKundin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  pruefeHerkunft(request);
  const kundin = await verlangeKundin(request);
  const form = await request.formData();
  if (form.get("bestaetigung") !== "ja") return { fehler: "Bitte bestätigen Sie, dass Sie Ihr Profil löschen möchten." };
  await loescheKundin(kundin.kundinId);
  return redirect("/mein/geloescht", { headers: { "Set-Cookie": meinCookieLoeschen() } });
};

export default function Loeschen() {
  const antwort = useActionData<typeof action>();
  const laeuft = useNavigation().state === "submitting";
  return (
    <>
      <h1>Profil löschen</h1>
      <div className="karte">
        <p>Wenn Sie Ihr Profil löschen, entfernen wir sofort:</p>
        <ul>
          <li>Ihre gespeicherten Körpermaße,</li>
          <li>Ihre E-Mail-Adresse,</li>
          <li>alle Anmeldungen in allen Shops.</li>
        </ul>
        <p>Das lässt sich nicht rückgängig machen. Beim nächsten Einkauf können Sie jederzeit ein neues Profil anlegen.</p>
        {antwort?.fehler && (
          <p className="meldung meldung-fehler" role="alert">
            {antwort.fehler}
          </p>
        )}
        <Form method="post">
          <label className="zeile" style={{ alignItems: "center", gap: 8, marginBottom: 16 }}>
            <input type="checkbox" name="bestaetigung" value="ja" required />
            Ja, ich möchte mein Profil endgültig löschen.
          </label>
          <button className="knopf" type="submit" disabled={laeuft}>
            {laeuft ? "Wird gelöscht …" : "Profil endgültig löschen"}
          </button>
        </Form>
      </div>
      <p>
        <Link to="/mein">Abbrechen und zurück</Link>
      </p>
    </>
  );
}
