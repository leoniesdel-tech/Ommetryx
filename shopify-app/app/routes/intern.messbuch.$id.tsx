// /intern/messbuch/:id – Teil ansehen und bearbeiten.

import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { Form, Link, redirect, useActionData, useLoaderData, useSearchParams } from "react-router";
import db from "../db.server";
import { MASSFELDER, wachstumsHinweise } from "../intern/erfassung";
import type { Masse, Massfeld } from "../intern/erfassung";
import { konfiguration } from "../intern/erfassung.server";
import { MessFormular } from "../intern/MessFormular";
import type { MessVorgabe } from "../intern/MessFormular";
import { MessFotos } from "../intern/MessFotos";
import type { FotoGroesse } from "../intern/MessFotos";
import { pruefeFoto } from "../intern/fotodatei.server";
import { MAX_FOTO_MB, pruefeMessArtikel } from "../intern/messbuch";
import { ladeMessArtikel, ladeMessListe, loescheMessArtikel, loescheMessFoto, speichereMessArtikel, speichereMessFoto } from "../intern/messbuch.server";
import { pruefeHerkunft, verlangeTeam } from "../intern/team.server";

const FOTO_FEHLER = {
  format: "Das geht nur mit JPEG oder PNG. Auf dem iPhone unter Einstellungen → Kamera → Formate „Maximale Kompatibilität“ wählen.",
  kaputt: "Diese Bilddatei lässt sich nicht lesen. Bitte das Foto neu aufnehmen oder erneut hochladen.",
  zu_gross: `Das Foto ist größer als ${MAX_FOTO_MB} MB.`,
};

const komma = (wert: number | null | undefined) => (wert === null || wert === undefined ? "" : String(wert).replace(".", ","));

function pruefeId(roh: string | undefined) {
  if (!roh || !/^\d{1,9}$/.test(roh)) throw new Response("Nicht gefunden", { status: 404 });
  return Number(roh);
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await verlangeTeam(db, request);
  const a = await ladeMessArtikel(pruefeId(params.id));
  if (!a) throw new Response("Nicht gefunden", { status: 404 });
  const [k, liste] = await Promise.all([konfiguration(), ladeMessListe({})]);

  const vorgabe: MessVorgabe = {
    herkunft: a.herkunft,
    onlineShop: a.onlineShop,
    marke: a.marke ?? "",
    produktname: a.produktname,
    link: a.link ?? "",
    notiz: a.notiz ?? "",
    kategorie: a.kategorie,
    schnitt: a.schnitt,
    dehnung: komma(a.materialDehnungProzent),
    material: a.materialZusammensetzung,
    tailliert: a.tailliert,
    bundTyp: a.bundTyp ?? "",
    aermelTyp: a.aermelTyp ?? "",
    messhoehe: komma(a.messhoeheBrustCm),
    // Anzeige wie gemessen: Umfänge wieder halbieren.
    groessen: a.groessen.map((g) => ({
      groesse: g.groesse,
      flach: Object.fromEntries(MASSFELDER.map(({ feld, umfang }) => [feld, komma(g[feld] === null ? null : umfang ? g[feld] / 2 : g[feld])])),
    })),
  };

  const masse = (g: (typeof a.groessen)[number]): Masse =>
    Object.fromEntries(MASSFELDER.flatMap(({ feld }) => (g[feld] === null ? [] : [[feld as Massfeld, g[feld]]])));

  const fotos: FotoGroesse[] = a.groessen.map((g) => ({
    id: g.id,
    groesse: g.groesse,
    foto: g.foto && {
      version: String(g.foto.hochgeladenAm.getTime()),
      breite: g.foto.breite,
      hoehe: g.foto.hoehe,
      kamera: g.foto.kamera,
      mb: (g.foto.bytes / (1024 * 1024)).toFixed(1).replace(".", ","),
    },
  }));

  return {
    id: a.id,
    vorgabe,
    fotos,
    gemessen: a.groessen.map((g) => ({ groesse: g.groesse, von: g.gemessenVon?.name ?? "unbekannt", am: g.gemessenAm.toISOString() })),
    hinweise: wachstumsHinweise(a.groessen.map((g) => ({ groesse: g.groesse, masse: masse(g) }))),
    kategorien: k.artikelarten.map((name) => ({ name, text: k.artikelart(name).name })),
    shops: liste.optionen.shops,
  };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  pruefeHerkunft(request);
  const team = await verlangeTeam(db, request);
  const id = pruefeId(params.id);
  // Fotos kommen als Datei-Formular: Die Größe prüfen, bevor alles in den Speicher geladen wird.
  if ((request.headers.get("Content-Type") ?? "").startsWith("multipart/form-data")) {
    const laenge = Number(request.headers.get("Content-Length"));
    if (!laenge || laenge > (MAX_FOTO_MB + 1) * 1024 * 1024) return { fotoFehler: FOTO_FEHLER.zu_gross };
  }
  const form = await request.formData();
  const absicht = form.get("absicht");
  if (absicht === "loeschen") {
    await loescheMessArtikel(id);
    return redirect("/intern/messbuch");
  }
  if (absicht === "foto" || absicht === "foto_loeschen") {
    const groesseId = pruefeId(String(form.get("groesse_id") ?? ""));
    if (absicht === "foto_loeschen") {
      await loescheMessFoto(id, groesseId);
      return redirect(`/intern/messbuch/${id}`);
    }
    const datei = form.get("foto");
    if (!(datei instanceof File) || datei.size === 0) return { fotoFehler: FOTO_FEHLER.format };
    if (datei.size > MAX_FOTO_MB * 1024 * 1024) return { fotoFehler: FOTO_FEHLER.zu_gross };
    const geprueft = pruefeFoto(Buffer.from(await datei.arrayBuffer()));
    if (!geprueft.ok) return { fotoFehler: FOTO_FEHLER[geprueft.grund] };
    if (!(await speichereMessFoto(id, groesseId, geprueft.foto))) throw new Response("Nicht gefunden", { status: 404 });
    return redirect(`/intern/messbuch/${id}?foto=1`);
  }
  const pruefung = pruefeMessArtikel(form, await konfiguration());
  if (!pruefung.ok) return { fehler: pruefung.fehler };
  await speichereMessArtikel(id, pruefung.daten, team.id);
  return redirect(`/intern/messbuch/${id}?gespeichert=1`);
};

export default function TeilBearbeiten() {
  const daten = useLoaderData<typeof loader>();
  const antwort = useActionData<typeof action>();
  const [params] = useSearchParams();
  const fehler = antwort && "fehler" in antwort ? antwort.fehler : undefined;
  const fotoFehler = antwort && "fotoFehler" in antwort ? antwort.fotoFehler : undefined;

  return (
    <>
      <p>
        <Link to="/intern/messbuch">← Messbuch</Link>
      </p>
      <h1>{daten.vorgabe.produktname}</h1>

      {params.get("gespeichert") && !fehler && (
        <p className="meldung meldung-ok" role="status">
          Gespeichert.
        </p>
      )}
      {params.get("foto") && !fotoFehler && (
        <p className="meldung meldung-ok" role="status">
          Foto gespeichert.
        </p>
      )}
      {daten.hinweise.length > 0 && (
        <div className="meldung" role="status">
          {daten.hinweise.map((h) => (
            <p key={h} className="hinweis" style={{ margin: 0 }}>
              Hinweis: {h}
            </p>
          ))}
        </div>
      )}

      <p className="erklaerung">
        {daten.gemessen.map((g) => `${g.groesse}: ${g.von}, ${new Date(g.am).toLocaleDateString("de-DE")}`).join(" · ")}
      </p>

      {/* key: Nach dem Speichern zeigt das Formular den neuen Stand. */}
      <MessFormular key={JSON.stringify(daten.vorgabe)} vorgabe={daten.vorgabe} kategorien={daten.kategorien} shops={daten.shops} fehler={fehler} knopf="Änderungen speichern" />

      <MessFotos groessen={daten.fotos} fehler={fotoFehler} />

      <Form
        method="post"
        onSubmit={(e) => {
          if (!window.confirm("Dieses Teil mit allen Größen endgültig löschen?")) e.preventDefault();
        }}
      >
        <input type="hidden" name="absicht" value="loeschen" />
        <button className="knopf knopf-zweit" type="submit">
          Teil löschen
        </button>
      </Form>
    </>
  );
}
