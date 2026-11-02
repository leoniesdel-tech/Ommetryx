// /intern/messbuch/programm – Austausch mit dem Vermessungsprogramm: Fotos exportieren, Ergebnisse importieren.

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";
import db from "../db.server";
import { speichereProgrammErgebnisse } from "../intern/messbuch.server";
import { MAX_IMPORT_MB, pruefeProgrammDatei } from "../intern/programm";
import { pruefeHerkunft, verlangeTeam } from "../intern/team.server";

const BEISPIEL = `{
  "programm_version": "2026-11-02",
  "ergebnisse": [
    {
      "groesse_id": 67,
      "garment_measurements": { "brust": 104, "gesamtlaenge": 62.5 }
    }
  ]
}`;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verlangeTeam(db, request);
  const [mitFoto, gemessen, offen] = await Promise.all([
    db.messFoto.count(),
    db.messProgrammMessung.count(),
    db.messGroesse.count({ where: { foto: { isNot: null }, programm: { is: null } } }),
  ]);
  return { mitFoto, gemessen, offen };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  pruefeHerkunft(request);
  await verlangeTeam(db, request);
  const laenge = Number(request.headers.get("Content-Length"));
  if (!laenge || laenge > (MAX_IMPORT_MB + 1) * 1024 * 1024) return { meldung: `Die Datei ist größer als ${MAX_IMPORT_MB} MB.` };
  const datei = (await request.formData()).get("datei");
  if (!(datei instanceof File) || datei.size === 0) return { meldung: "Bitte eine Datei wählen." };
  const pruefung = pruefeProgrammDatei(await datei.text());
  if (!pruefung.ok) return { meldung: pruefung.meldung };
  const { gespeichert, unbekannt } = await speichereProgrammErgebnisse(pruefung.zeilen, pruefung.version);
  return { gespeichert, fehler: [...pruefung.fehler, ...unbekannt.map((id) => `Größen-Nummer ${id}: gibt es im Messbuch nicht.`)] };
};

export default function Programm() {
  const { mitFoto, gemessen, offen } = useLoaderData<typeof loader>();
  const antwort = useActionData<typeof action>();
  const sendet = useNavigation().state === "submitting";
  const fehler = antwort?.fehler ?? [];

  return (
    <>
      <p>
        <Link to="/intern/messbuch">← Messbuch</Link>
      </p>
      <h1>Vermessungsprogramm</h1>
      <p className="erklaerung" role="status">
        {mitFoto} {mitFoto === 1 ? "Foto" : "Fotos"} · {gemessen} vom Programm gemessen · {offen} noch offen
      </p>

      <div className="karte">
        <h2 style={{ marginTop: 0 }}>1. Fotos exportieren</h2>
        <p>Die ZIP-Datei enthält die Fotos und die Datei daten.json mit den Angaben zu Teilen und Größen. Handmaße sind dabei, Produktnamen und Shops nicht.</p>
        <div className="zeile" style={{ gap: 12, flexWrap: "wrap" }}>
          {/* Kein Link von React Router: Der Download soll die Seite nicht verlassen. */}
          <a className="knopf" href="/intern/messbuch/export?offen=1" download>
            Nur offene Fotos ({offen})
          </a>
          <a className="knopf knopf-zweit" href="/intern/messbuch/export" download>
            Alles exportieren
          </a>
        </div>
      </div>

      <div className="karte">
        <h2 style={{ marginTop: 0 }}>2. Ergebnisse importieren</h2>
        <p>Das Programm liefert eine JSON-Datei. Ein neuer Lauf ersetzt die alten Programm-Maße, Handmaße bleiben erhalten.</p>
        <Form method="post" encType="multipart/form-data">
          <div className="feld">
            <label htmlFor="datei">Ergebnis-Datei (JSON)</label>
            <input id="datei" name="datei" type="file" accept="application/json,.json" required />
          </div>
          <button className="knopf" type="submit" disabled={sendet}>
            {sendet ? "Wird importiert …" : "Importieren"}
          </button>
        </Form>
        {antwort && "meldung" in antwort && (
          <p className="meldung meldung-fehler" role="alert" style={{ marginTop: 12 }}>
            {antwort.meldung}
          </p>
        )}
        {antwort && "gespeichert" in antwort && (
          <div className={`meldung ${fehler.length > 0 ? "meldung-fehler" : "meldung-ok"}`} role="status" style={{ marginTop: 12 }}>
            <p style={{ margin: 0 }}>
              {antwort.gespeichert} {antwort.gespeichert === 1 ? "Größe" : "Größen"} übernommen.
              {fehler.length > 0 && ` ${fehler.length} nicht übernommen:`}
            </p>
            {fehler.length > 0 && (
              <ul style={{ margin: "8px 0 0", paddingLeft: 20 }}>
                {fehler.slice(0, 50).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="karte">
        <h2 style={{ marginTop: 0 }}>Format der Ergebnis-Datei</h2>
        <p className="erklaerung">
          Die groesse_id steht in daten.json und im Foto-Namen. Alle Maße in cm, Umfänge bereits × 2. Erlaubt sind brust, taille, huefte, oberschenkel, oberarm, schulter, armlaenge und
          gesamtlaenge.
        </p>
        <pre className="mess-code">{BEISPIEL}</pre>
      </div>
    </>
  );
}
