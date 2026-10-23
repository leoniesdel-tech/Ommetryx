// /intern/shops/:shop/produkte/:produktId – Kleidungsmaße eines Produkts erfassen
// und mit erfundenen Körpermaßen eine Probe-Empfehlung rechnen (wird nicht gespeichert).

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";
import { empfehle, EmpfehlungsFehler, PASSFORMEN } from "@ommetryx/empfehlung";
import type { Ergebnis, Passform } from "@ommetryx/empfehlung";
import db from "../db.server";
import {
  AERMEL_TYPEN,
  alsEmpfehlungsArtikel,
  BUND_TYPEN,
  eingabeAusFormular,
  feldname,
  groessenAusProdukt,
  MASSFELDER,
  pruefeErfassung,
  zahlAusFeld,
} from "../intern/erfassung";
import { konfiguration, ladeArtikel, produktMitGroessen, speichereArtikel } from "../intern/erfassung.server";
import { produktGid, pruefeShop } from "../intern/pfade";
import { pruefeHerkunft, verlangeTeam } from "../intern/team.server";

type Antwort =
  | { probe: { fehler: string } | { ergebnis: Ergebnis } }
  | {
      speichern:
        | { fehler: Record<string, string>; hinweise: string[]; werte: Record<string, string> }
        | { gespeichert: true; hinweise: string[]; werte: Record<string, string> };
    };

const PASSFORM_TEXT: Record<Passform, string> = {
  koerpernah: "körpernah",
  regulaer: "regulär",
  locker: "locker",
  oversized: "oversized",
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await verlangeTeam(db, request);
  const shop = pruefeShop(params.shop);
  const gid = produktGid(params.produktId);
  const [produkt, artikel, k] = await Promise.all([produktMitGroessen(shop, gid), ladeArtikel(shop, gid), konfiguration()]);
  if (!produkt) throw new Response("Produkt nicht gefunden", { status: 404 });

  const gespeichert = new Map(artikel?.groessen.map((g) => [g.groesse, g]) ?? []);
  const groessen = groessenAusProdukt(produkt).map((g) => {
    const masse = gespeichert.get(g.groesse);
    // Anzeige wie gemessen: Umfänge wieder halbieren.
    const flach = Object.fromEntries(
      MASSFELDER.map(({ feld, umfang }) => {
        const wert = masse?.[feld];
        return [feld, wert === null || wert === undefined ? "" : String(umfang ? wert / 2 : wert).replace(".", ",")];
      }),
    );
    return { ...g, flach };
  });

  return {
    shop,
    titel: produkt.title,
    groessen,
    artikel: artikel && {
      artikelart: artikel.artikelart,
      schnitt: artikel.schnitt,
      materialDehnungProzent: artikel.materialDehnungProzent,
      materialZusammensetzung: artikel.materialZusammensetzung,
      tailliert: artikel.tailliert,
      bundTyp: artikel.bundTyp,
      aermelTyp: artikel.aermelTyp,
      messhoeheBrustCm: artikel.messhoeheBrustCm,
      status: artikel.status,
      zuletzt: artikel.vermessungen[0]
        ? { am: artikel.vermessungen[0].erfasstAm.toISOString(), von: artikel.vermessungen[0].teamMitglied?.name ?? "unbekannt" }
        : null,
    },
    artikelarten: k.artikelarten.map((name) => ({ name, text: k.artikelart(name).name })),
  };
};

export const action = async ({ request, params }: ActionFunctionArgs): Promise<Antwort> => {
  pruefeHerkunft(request);
  const team = await verlangeTeam(db, request);
  const shop = pruefeShop(params.shop);
  const gid = produktGid(params.produktId);
  const form = await request.formData();
  const k = await konfiguration();

  if (form.get("absicht") === "probe") {
    const artikel = await ladeArtikel(shop, gid);
    if (!artikel || artikel.status !== "vermessen") return { probe: { fehler: "Bitte zuerst die Maße speichern." } };
    const koerper = {
      koerpergroesse: zahlAusFeld(form.get("koerpergroesse")),
      brust: zahlAusFeld(form.get("brust")),
      huefte: zahlAusFeld(form.get("huefte")),
      taille: zahlAusFeld(form.get("taille")),
    };
    if (Object.values(koerper).some((w) => w !== null && (Number.isNaN(w) || w < 30 || w > 250))) {
      return { probe: { fehler: "Bitte Körpermaße zwischen 30 und 250 cm eintragen." } };
    }
    const passform = String(form.get("passform")) as Passform;
    try {
      const ergebnis = empfehle(
        {
          koerper: {
            koerpergroesse: koerper.koerpergroesse ?? 168,
            brust: koerper.brust ?? Number.NaN,
            huefte: koerper.huefte ?? Number.NaN,
            ...(koerper.taille !== null ? { taille: koerper.taille } : {}),
          },
          artikel: alsEmpfehlungsArtikel(artikel),
          passform: PASSFORMEN.includes(passform) ? passform : "regulaer",
        },
        k,
      );
      return { probe: { ergebnis } };
    } catch (fehler) {
      if (fehler instanceof EmpfehlungsFehler) return { probe: { fehler: fehler.message } };
      throw fehler;
    }
  }

  const pruefung = pruefeErfassung(eingabeAusFormular(form), k);
  const werte = Object.fromEntries([...form.entries()].map(([name, wert]) => [name, String(wert)]));
  if (!pruefung.ok) return { speichern: { fehler: pruefung.fehler, hinweise: pruefung.hinweise, werte } };

  const produkt = await produktMitGroessen(shop, gid);
  await speichereArtikel(shop, gid, produkt?.title ?? "", pruefung.artikel, team.id);
  return { speichern: { gespeichert: true, hinweise: pruefung.hinweise, werte } };
};

export default function Erfassung() {
  const daten = useLoaderData<typeof loader>();
  const antwort = useActionData<typeof action>() as Antwort | undefined;
  const navigation = useNavigation();
  const absicht = navigation.formData?.get("absicht");

  const speichern = antwort && "speichern" in antwort ? antwort.speichern : undefined;
  const probe = antwort && "probe" in antwort ? antwort.probe : undefined;
  const fehler: Record<string, string> = speichern && "fehler" in speichern ? speichern.fehler : {};
  const werte: Record<string, string> | undefined = speichern?.werte;
  const a = daten.artikel;

  // Formularwert: zuletzt abgeschickte Eingabe, sonst gespeicherter Stand.
  const wert = (name: string, gespeichert: string | number | null | undefined) => werte?.[name] ?? (gespeichert === null || gespeichert === undefined ? "" : String(gespeichert));
  const feldFehler = (name: string) =>
    fehler[name] ? (
      <span id={`${name}-fehler`} className="fehler">
        {fehler[name]}
      </span>
    ) : null;
  const fehlerAttr = (name: string) => (fehler[name] ? { "aria-invalid": true as const, "aria-describedby": `${name}-fehler` } : {});

  return (
    <>
      <p>
        <Link to={`/intern/shops/${daten.shop}`}>← Produkte von {daten.shop}</Link>
      </p>
      <h1>{daten.titel}</h1>
      {a?.zuletzt && (
        <p className="erklaerung">
          Zuletzt erfasst am {new Date(a.zuletzt.am).toLocaleString("de-DE")} von {a.zuletzt.von}.
        </p>
      )}

      {speichern && "gespeichert" in speichern && (
        <p className="meldung meldung-ok" role="status">
          Gespeichert. Der Artikel ist jetzt vermessen.
        </p>
      )}
      {Object.keys(fehler).length > 0 && (
        <p className="meldung meldung-fehler" role="alert">
          Nicht gespeichert: Bitte die markierten Felder prüfen.
        </p>
      )}
      {speichern?.hinweise && speichern.hinweise.length > 0 && (
        <div className="meldung" role="status">
          {speichern.hinweise.map((h) => (
            <p key={h} className="hinweis" style={{ margin: 0 }}>
              Hinweis: {h}
            </p>
          ))}
        </div>
      )}

      <Form method="post" key={speichern && "gespeichert" in speichern ? "gespeichert" : "formular"}>
        <input type="hidden" name="absicht" value="speichern" />
        <input type="hidden" name="anzahl_groessen" value={daten.groessen.length} />

        <div className="karte">
          <h2 style={{ marginTop: 0 }}>Artikel</h2>
          <div className="zeile">
            <div className="feld">
              <label htmlFor="artikelart">Artikelart</label>
              <select id="artikelart" name="artikelart" defaultValue={wert("artikelart", a?.artikelart)} required {...fehlerAttr("artikelart")}>
                <option value="">Bitte wählen</option>
                {daten.artikelarten.map((art) => (
                  <option key={art.name} value={art.name}>
                    {art.text}
                  </option>
                ))}
              </select>
              {feldFehler("artikelart")}
            </div>
            <div className="feld">
              <label htmlFor="schnitt">Schnitt (Passform des Artikels)</label>
              <select id="schnitt" name="schnitt" defaultValue={wert("schnitt", a?.schnitt)} required {...fehlerAttr("schnitt")}>
                <option value="">Bitte wählen</option>
                {PASSFORMEN.map((p) => (
                  <option key={p} value={p}>
                    {PASSFORM_TEXT[p]}
                  </option>
                ))}
              </select>
              <span className="erklaerung">Vorerst immer von Hand (Quelle „manuell“).</span>
              {feldFehler("schnitt")}
            </div>
          </div>
          <div className="zeile">
            <div className="feld">
              <label htmlFor="material_dehnung_prozent">Querdehnung in %</label>
              <input
                id="material_dehnung_prozent"
                name="material_dehnung_prozent"
                inputMode="decimal"
                defaultValue={wert("material_dehnung_prozent", a?.materialDehnungProzent)}
                required
                {...fehlerAttr("material_dehnung_prozent")}
              />
              <span className="erklaerung">10 cm quer markieren, ohne Gewalt dehnen: (gedehnt − 10) × 10.</span>
              {feldFehler("material_dehnung_prozent")}
            </div>
            <div className="feld">
              <label htmlFor="material_zusammensetzung">Materialzusammensetzung (optional)</label>
              <input id="material_zusammensetzung" name="material_zusammensetzung" defaultValue={wert("material_zusammensetzung", a?.materialZusammensetzung)} />
              <span className="erklaerung">Vom Pflegeetikett, z. B. 97 % Baumwolle, 3 % Elastan.</span>
            </div>
          </div>
          <div className="zeile">
            <div className="feld">
              <label htmlFor="bund_typ">Bund (nur Röcke und Hosen)</label>
              <select id="bund_typ" name="bund_typ" defaultValue={wert("bund_typ", a?.bundTyp)} {...fehlerAttr("bund_typ")}>
                <option value="">—</option>
                {BUND_TYPEN.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {feldFehler("bund_typ")}
            </div>
            <div className="feld">
              <label htmlFor="aermel_typ">Ärmel (nur Oberteile)</label>
              <select id="aermel_typ" name="aermel_typ" defaultValue={wert("aermel_typ", a?.aermelTyp)} {...fehlerAttr("aermel_typ")}>
                <option value="">—</option>
                {AERMEL_TYPEN.map((t) => (
                  <option key={t} value={t}>
                    {t === "ueberschnitten" ? "überschnitten" : t}
                  </option>
                ))}
              </select>
              {feldFehler("aermel_typ")}
            </div>
            <div className="feld">
              <label htmlFor="messhoehe_brust_cm">Messhöhe Brust unter dem Armloch (cm)</label>
              <input
                id="messhoehe_brust_cm"
                name="messhoehe_brust_cm"
                inputMode="decimal"
                defaultValue={wert("messhoehe_brust_cm", a?.messhoeheBrustCm ?? 2.5)}
                {...fehlerAttr("messhoehe_brust_cm")}
              />
              {feldFehler("messhoehe_brust_cm")}
            </div>
          </div>
          <label className="zeile" style={{ alignItems: "center", gap: 8 }}>
            <input type="checkbox" name="tailliert" value="ja" defaultChecked={werte ? werte.tailliert === "ja" : (a?.tailliert ?? false)} />
            tailliert (Taille wird gewertet)
          </label>
        </div>

        <h2>Maße je Größe</h2>
        <p className="erklaerung">
          Flach messen, Knöpfe und Reißverschlüsse geschlossen, nicht dehnen. Umfänge werden automatisch × 2 gerechnet.
        </p>
        {fehler.groessen && <p className="fehler">{fehler.groessen}</p>}
        <div className="tabelle-rahmen">
          <table className="tabelle">
            <thead>
              <tr>
                <th scope="col">Größe</th>
                {MASSFELDER.map(({ feld, beschriftung, umfang }) => (
                  <th key={feld} scope="col">
                    {beschriftung}
                    <br />
                    <span className="erklaerung">{umfang ? "flach, cm" : "cm"}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {daten.groessen.map((g, i) => (
                <tr key={g.groesse}>
                  <th scope="row">
                    {g.groesse}
                    <input type="hidden" name={`g${i}_groesse`} value={g.groesse} />
                    <input type="hidden" name={`g${i}_variante`} value={g.shopifyVarianteId ?? ""} />
                  </th>
                  {MASSFELDER.map(({ feld, beschriftung, umfang }) => {
                    const name = feldname(i, feld);
                    const aktuell = wert(name, g.flach[feld]);
                    const zahl = zahlAusFeld(aktuell);
                    return (
                      <td key={feld}>
                        <input
                          name={name}
                          inputMode="decimal"
                          aria-label={`${beschriftung} Größe ${g.groesse}${umfang ? " flach" : ""} in cm`}
                          defaultValue={aktuell}
                          {...fehlerAttr(name)}
                        />
                        {umfang && zahl !== null && !Number.isNaN(zahl) && <span className="umfang">Umfang {(zahl * 2).toLocaleString("de-DE")}</span>}
                        {feldFehler(name)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: 16 }}>
          <button className="knopf" type="submit" disabled={absicht === "speichern"}>
            {absicht === "speichern" ? "Wird gespeichert …" : "Maße speichern"}
          </button>
        </p>
      </Form>

      <div className="karte" style={{ marginTop: 32 }}>
        <h2 style={{ marginTop: 0 }}>Probe-Rechnung</h2>
        <p className="erklaerung">Nur erfundene Werte eintragen. Nichts davon wird gespeichert.</p>
        <Form method="post">
          <input type="hidden" name="absicht" value="probe" />
          <div className="zeile">
            {[
              ["koerpergroesse", "Körpergröße"],
              ["brust", "Brust"],
              ["huefte", "Hüfte"],
              ["taille", "Taille (optional)"],
            ].map(([name, text]) => (
              <div className="feld" key={name}>
                <label htmlFor={`probe-${name}`}>{text} in cm</label>
                <input id={`probe-${name}`} name={name} inputMode="decimal" />
              </div>
            ))}
            <div className="feld">
              <label htmlFor="probe-passform">Passform</label>
              <select id="probe-passform" name="passform" defaultValue="regulaer">
                {PASSFORMEN.map((p) => (
                  <option key={p} value={p}>
                    {PASSFORM_TEXT[p]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="knopf knopf-zweit" type="submit" disabled={absicht === "probe"}>
            {absicht === "probe" ? "Wird gerechnet …" : "Probe rechnen"}
          </button>
        </Form>

        <div aria-live="polite">
          {probe && "fehler" in probe && <p className="fehler">{probe.fehler}</p>}
          {probe && "ergebnis" in probe && <ProbeErgebnis ergebnis={probe.ergebnis} />}
        </div>
      </div>
    </>
  );
}

function ProbeErgebnis({ ergebnis }: { ergebnis: Ergebnis }) {
  const zahl = (n: number | null) => (n === null ? "–" : n.toLocaleString("de-DE", { maximumFractionDigits: 2 }));
  return (
    <div style={{ marginTop: 16 }}>
      <p>
        Empfohlene Größe: <span className="ergebnis-groesse">{ergebnis.recommended_size ?? "keine"}</span>
      </p>
      <p>
        Sicherheit {ergebnis.confidence} ({ergebnis.status})
        {ergebnis.alternative_size && ` · Nachbargröße ${ergebnis.alternative_size}`}
        {ergebnis.begrenzt_durch_schnitt && " · durch den Schnitt begrenzt"}
      </p>
      <div className="tabelle-rahmen">
        <table className="tabelle">
          <thead>
            <tr>
              <th scope="col">Größe</th>
              <th scope="col">Messpunkt</th>
              <th scope="col">Mehrweite</th>
              <th scope="col">Ziel-Mitte</th>
              <th scope="col">Zone ±</th>
              <th scope="col">Strafe</th>
              <th scope="col">Bewertung</th>
              <th scope="col">Score</th>
            </tr>
          </thead>
          <tbody>
            {ergebnis.groessen.flatMap((g) =>
              g.zonen.map((z, i) => (
                <tr key={`${g.groesse}-${z.messpunkt}`}>
                  <td>{i === 0 ? g.groesse + (g.ausgeschlossen ? " (ausgeschlossen)" : "") : ""}</td>
                  <td>{z.messpunkt}</td>
                  <td>{zahl(z.mehrweite)}</td>
                  <td>{zahl(z.ziel_mitte)}</td>
                  <td>{zahl(z.zone_halbbreite)}</td>
                  <td>{zahl(z.strafe)}</td>
                  <td>{z.bewertung.replace("_", " ")}</td>
                  <td>{i === 0 ? zahl(g.score) : ""}</td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
