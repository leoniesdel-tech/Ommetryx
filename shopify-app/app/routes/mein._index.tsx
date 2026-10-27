// /mein – Übersicht: Maße, Einwilligungen, Shops, Daten herunterladen, Profil löschen.

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import { zahlAusFeld } from "../intern/erfassung";
import { pruefeHerkunft } from "../intern/team.server";
import { meinCookieLoeschen, verlangeKundin } from "../kundin/mein-sitzung.server";
import { profilSchema, speichereProfil } from "../kundin/profil.server";
import { ALTERSGRUPPEN } from "../kundin/texte";
import { trenneShop, uebersicht, widerrufe } from "../kundin/verwaltung.server";

const ZWECK: Record<string, string> = {
  verarbeitung: "Maße für eine Größenempfehlung verarbeiten",
  profil: "Profil und Maße speichern",
  umfrage: "Umfrage-Mail „Hat es gepasst?“",
  lernen: "Rückmeldungen für bessere Empfehlungen nutzen",
};

const datum = (d: string) => new Date(d).toLocaleString("de-DE", { dateStyle: "medium", timeStyle: "short" });

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const kundin = await verlangeKundin(request);
  const u = await uebersicht(kundin.kundinId);
  return {
    email: u.email,
    profil: u.profil,
    einwilligungen: u.einwilligungen.map((e) => ({ ...e, erteiltAm: e.erteiltAm.toISOString(), widerrufenAm: e.widerrufenAm?.toISOString() ?? null })),
    shops: u.shops.map((s) => ({ shop: s.shop, letzteNutzung: s.letzteNutzung.toISOString() })),
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  pruefeHerkunft(request);
  const kundin = await verlangeKundin(request);
  const form = await request.formData();

  switch (form.get("absicht")) {
    case "masse": {
      const taille = zahlAusFeld(form.get("taille"));
      const altersgruppe = String(form.get("altersgruppe") ?? "");
      const profil = profilSchema.safeParse({
        koerpergroesse: zahlAusFeld(form.get("koerpergroesse")),
        brust: zahlAusFeld(form.get("brust")),
        huefte: zahlAusFeld(form.get("huefte")),
        ...(taille !== null ? { taille } : {}),
        ...(altersgruppe ? { altersgruppe } : {}),
      });
      if (!profil.success) {
        return { fehler: "Bitte prüfen Sie Ihre Angaben: Körpergröße 100–230 cm, Umfänge 30–250 cm, Zahlen wie 92 oder 92,5." };
      }
      await speichereProfil(kundin.pseudonymId, profil.data);
      return { meldung: "Ihre Maße sind gespeichert. Die alten Werte wurden überschrieben." };
    }
    case "widerrufen": {
      const ergebnis = await widerrufe(kundin.kundinId, Number(form.get("id")));
      if (ergebnis === "geloescht") return redirect("/mein/geloescht", { headers: { "Set-Cookie": meinCookieLoeschen() } });
      return { meldung: "Die Einwilligung ist widerrufen." };
    }
    case "trennen":
      await trenneShop(kundin.kundinId, String(form.get("shop") ?? ""));
      return { meldung: "Die Verbindung zum Shop ist getrennt. Dort sind Sie jetzt abgemeldet." };
  }
  return { fehler: "Unbekannte Aktion." };
};

export default function MeinUebersicht() {
  const d = useLoaderData<typeof loader>();
  const antwort = useActionData<typeof action>();
  const laeuft = useNavigation().state === "submitting";
  const p = d.profil;
  const komma = (n: number | undefined) => (n === undefined ? "" : String(n).replace(".", ","));

  return (
    <>
      <h1>Ihre Daten bei Ommetryx</h1>
      <p className="erklaerung">Angemeldet als {d.email}</p>

      {antwort && "meldung" in antwort && (
        <p className="meldung meldung-ok" role="status">
          {antwort.meldung}
        </p>
      )}
      {antwort && "fehler" in antwort && (
        <p className="meldung meldung-fehler" role="alert">
          {antwort.fehler}
        </p>
      )}

      <section className="karte" aria-labelledby="titel-masse">
        <h2 id="titel-masse" style={{ marginTop: 0 }}>
          Meine Maße
        </h2>
        {!p && <p>Es sind keine Maße gespeichert.</p>}
        <Form method="post">
          <input type="hidden" name="absicht" value="masse" />
          <div className="zeile">
            {[
              ["koerpergroesse", "Körpergröße in cm", p?.koerpergroesse],
              ["brust", "Brustumfang in cm", p?.brust],
              ["huefte", "Hüftumfang in cm", p?.huefte],
              ["taille", "Taillenumfang in cm (optional)", p?.taille],
            ].map(([name, text, wert]) => (
              <div className="feld" key={name as string}>
                <label htmlFor={name as string}>{text}</label>
                <input id={name as string} name={name as string} inputMode="decimal" defaultValue={komma(wert as number | undefined)} />
              </div>
            ))}
            <div className="feld">
              <label htmlFor="altersgruppe">Altersgruppe (optional)</label>
              <select id="altersgruppe" name="altersgruppe" defaultValue={p?.altersgruppe ?? ""}>
                <option value="">Keine Angabe</option>
                {ALTERSGRUPPEN.map((g) => (
                  <option key={g} value={g}>
                    {g.replace("-", "–")} Jahre
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="knopf" type="submit" disabled={laeuft}>
            Maße speichern
          </button>
        </Form>
      </section>

      <section className="karte" aria-labelledby="titel-einwilligungen">
        <h2 id="titel-einwilligungen" style={{ marginTop: 0 }}>
          Meine Einwilligungen
        </h2>
        <div className="tabelle-rahmen">
          <table className="tabelle">
            <thead>
              <tr>
                <th scope="col">Wofür</th>
                <th scope="col">Erteilt</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {d.einwilligungen.map((e) => (
                <tr key={e.id}>
                  <td>
                    {ZWECK[e.zweck] ?? e.zweck}
                    <span className="umfang">
                      Textversion {e.textversion} · {e.shop}
                    </span>
                  </td>
                  <td>{datum(e.erteiltAm)}</td>
                  <td>
                    {e.widerrufenAm ? (
                      `widerrufen am ${datum(e.widerrufenAm)}`
                    ) : (
                      <Form method="post">
                        <input type="hidden" name="absicht" value="widerrufen" />
                        <input type="hidden" name="id" value={e.id} />
                        <button className="knopf knopf-zweit" type="submit" aria-describedby="widerruf-hinweis">
                          Widerrufen
                        </button>
                      </Form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p id="widerruf-hinweis" className="erklaerung">
          Ein Widerruf der Einwilligung zum Profil löscht Ihr Profil sofort, denn ohne Einwilligung dürfen wir Ihre Maße nicht speichern.
        </p>
      </section>

      <section className="karte" aria-labelledby="titel-shops">
        <h2 id="titel-shops" style={{ marginTop: 0 }}>
          Meine Shops
        </h2>
        {d.shops.length === 0 ? (
          <p>Sie haben Ommetryx noch in keinem Shop genutzt.</p>
        ) : (
          <div className="tabelle-rahmen">
            <table className="tabelle">
              <thead>
                <tr>
                  <th scope="col">Shop</th>
                  <th scope="col">Zuletzt genutzt</th>
                  <th scope="col">
                    <span className="nur-vorleser">Aktion</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {d.shops.map((s) => (
                  <tr key={s.shop}>
                    <td>{s.shop}</td>
                    <td>{datum(s.letzteNutzung)}</td>
                    <td>
                      <Form method="post">
                        <input type="hidden" name="absicht" value="trennen" />
                        <input type="hidden" name="shop" value={s.shop} />
                        <button className="knopf knopf-zweit" type="submit" aria-label={`Verbindung zu ${s.shop} trennen`}>
                          Trennen
                        </button>
                      </Form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="karte" aria-labelledby="titel-daten">
        <h2 id="titel-daten" style={{ marginTop: 0 }}>
          Meine Daten
        </h2>
        <p>
          <a className="knopf knopf-zweit" href="/mein/daten" download>
            Alle Daten herunterladen
          </a>
        </p>
        <p style={{ marginBottom: 0 }}>
          <Link to="/mein/loeschen">Profil löschen</Link>
        </p>
      </section>
    </>
  );
}
