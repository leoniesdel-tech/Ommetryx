// /intern/postfach – Entwicklungs-Postfach: Login-Codes, die sonst per E-Mail verschickt würden.
// Nur in der Entwicklung; im Livebetrieb verschickt Brevo die Mails.

import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import db from "../db.server";
import { verlangeTeam } from "../intern/team.server";
import { postfach } from "../kundin/mail.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verlangeTeam(db, request);
  if (process.env.NODE_ENV === "production") throw new Response("Nicht verfügbar", { status: 404 });
  const mails = await postfach();
  return { mails: mails.map((m) => ({ id: m.id, an: m.an, betreff: m.betreff, text: m.text, am: m.erstelltAm.toISOString() })) };
};

export default function Postfach() {
  const { mails } = useLoaderData<typeof loader>();
  return (
    <>
      <h1>Entwicklungs-Postfach</h1>
      <p className="erklaerung">
        Hier landen in der Entwicklung die E-Mails an Kundinnen (z. B. Login-Codes), statt verschickt zu werden. Nur erfundene Adressen
        verwenden. Einträge werden nach 24 Stunden gelöscht.
      </p>
      {mails.length === 0 ? (
        <p className="karte">Noch keine Mails.</p>
      ) : (
        mails.map((m) => (
          <div className="karte" key={m.id}>
            <p className="erklaerung" style={{ margin: 0 }}>
              {new Date(m.am).toLocaleString("de-DE")} · an {m.an}
            </p>
            <h2 style={{ margin: "8px 0" }}>{m.betreff}</h2>
            <p style={{ margin: 0 }}>{m.text}</p>
          </div>
        ))
      )}
    </>
  );
}
