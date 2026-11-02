// Formular des Messbuchs, für Neu und Bearbeiten. Größen als Karten untereinander, damit es am Handy gut geht.

import { useRef, useState } from "react";
import { Form, useNavigation } from "react-router";
import { PASSFORMEN } from "@ommetryx/empfehlung";
import type { Passform } from "@ommetryx/empfehlung";
import { AERMEL_TYPEN, BUND_TYPEN, feldname, MASSFELDER } from "./erfassung";
import { HERKUNFT } from "./messbuch";

const PASSFORM_TEXT: Record<Passform, string> = { koerpernah: "körpernah", regulaer: "regulär", locker: "locker", oversized: "oversized" };

export interface MessVorgabe {
  herkunft: string;
  onlineShop: string;
  marke: string;
  produktname: string;
  link: string;
  notiz: string;
  kategorie: string;
  schnitt: string;
  dehnung: string;
  material: string;
  tailliert: boolean;
  bundTyp: string;
  aermelTyp: string;
  messhoehe: string;
  groessen: { groesse: string; flach: Record<string, string> }[];
}

export const LEER: MessVorgabe = {
  herkunft: "",
  onlineShop: "",
  marke: "",
  produktname: "",
  link: "",
  notiz: "",
  kategorie: "",
  schnitt: "",
  dehnung: "",
  material: "",
  tailliert: false,
  bundTyp: "",
  aermelTyp: "",
  messhoehe: "2,5",
  groessen: [{ groesse: "", flach: {} }],
};

interface Props {
  vorgabe: MessVorgabe;
  kategorien: { name: string; text: string }[];
  shops: string[];
  fehler?: Record<string, string>;
  knopf: string;
}

export function MessFormular({ vorgabe: v, kategorien, shops, fehler = {}, knopf }: Props) {
  const naechste = useRef(v.groessen.length);
  const [zeilen, setZeilen] = useState(() => v.groessen.map((g, i) => ({ schluessel: i, ...g })));
  const sendet = useNavigation().state === "submitting";

  const attr = (name: string) => (fehler[name] ? { "aria-invalid": true as const, "aria-describedby": `${name}-fehler` } : {});
  const meldung = (name: string) =>
    fehler[name] ? (
      <span id={`${name}-fehler`} className="fehler">
        {fehler[name]}
      </span>
    ) : null;

  const hinzufuegen = () => {
    setZeilen((alt) => [...alt, { schluessel: naechste.current++, groesse: "", flach: {} }]);
  };

  return (
    <Form method="post">
      <input type="hidden" name="absicht" value="speichern" />
      <input type="hidden" name="anzahl_groessen" value={zeilen.length} />

      {Object.keys(fehler).length > 0 && (
        <p className="meldung meldung-fehler" role="alert">
          Nicht gespeichert: Bitte die markierten Felder prüfen.
        </p>
      )}

      <div className="karte">
        <h2 style={{ marginTop: 0 }}>Teil</h2>
        <div className="mess-felder">
          <div className="feld">
            <label htmlFor="herkunft">Herkunft</label>
            <select id="herkunft" name="herkunft" defaultValue={v.herkunft} required {...attr("herkunft")}>
              <option value="">Bitte wählen</option>
              {Object.entries(HERKUNFT).map(([wert, text]) => (
                <option key={wert} value={wert}>
                  {text}
                </option>
              ))}
            </select>
            {meldung("herkunft")}
          </div>
          <div className="feld">
            <label htmlFor="online_shop">Online-Shop</label>
            <input id="online_shop" name="online_shop" list="bekannte-shops" defaultValue={v.onlineShop} required {...attr("online_shop")} />
            <datalist id="bekannte-shops">
              {shops.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
            {meldung("online_shop")}
          </div>
          <div className="feld">
            <label htmlFor="marke">Marke (optional)</label>
            <input id="marke" name="marke" defaultValue={v.marke} {...attr("marke")} />
            {meldung("marke")}
          </div>
          <div className="feld">
            <label htmlFor="produktname">Produktname</label>
            <input id="produktname" name="produktname" defaultValue={v.produktname} required {...attr("produktname")} />
            {meldung("produktname")}
          </div>
          <div className="feld">
            <label htmlFor="link">Link zum Produkt (optional)</label>
            <input id="link" name="link" type="url" inputMode="url" defaultValue={v.link} {...attr("link")} />
            {meldung("link")}
          </div>
        </div>
      </div>

      <div className="karte">
        <h2 style={{ marginTop: 0 }}>Kategorie und Material</h2>
        <div className="mess-felder">
          <div className="feld">
            <label htmlFor="artikelart">Kategorie</label>
            <select id="artikelart" name="artikelart" defaultValue={v.kategorie} required {...attr("artikelart")}>
              <option value="">Bitte wählen</option>
              {kategorien.map((k) => (
                <option key={k.name} value={k.name}>
                  {k.text}
                </option>
              ))}
            </select>
            {meldung("artikelart")}
          </div>
          <div className="feld">
            <label htmlFor="schnitt">Schnitt</label>
            <select id="schnitt" name="schnitt" defaultValue={v.schnitt} required {...attr("schnitt")}>
              <option value="">Bitte wählen</option>
              {PASSFORMEN.map((p) => (
                <option key={p} value={p}>
                  {PASSFORM_TEXT[p]}
                </option>
              ))}
            </select>
            {meldung("schnitt")}
          </div>
          <div className="feld">
            <label htmlFor="material_dehnung_prozent">Querdehnung in % (optional)</label>
            <input id="material_dehnung_prozent" name="material_dehnung_prozent" inputMode="decimal" defaultValue={v.dehnung} {...attr("material_dehnung_prozent")} />
            <span className="erklaerung">Vorerst nicht nötig, das Material reicht.</span>
            {meldung("material_dehnung_prozent")}
          </div>
          <div className="feld">
            <label htmlFor="material_zusammensetzung">Material</label>
            <input id="material_zusammensetzung" name="material_zusammensetzung" defaultValue={v.material} required {...attr("material_zusammensetzung")} />
            <span className="erklaerung">Vom Pflegeetikett, z. B. 97 % Baumwolle, 3 % Elastan.</span>
            {meldung("material_zusammensetzung")}
          </div>
          <div className="feld">
            <label htmlFor="bund_typ">Bund (nur Röcke und Hosen)</label>
            <select id="bund_typ" name="bund_typ" defaultValue={v.bundTyp} {...attr("bund_typ")}>
              <option value="">—</option>
              {BUND_TYPEN.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            {meldung("bund_typ")}
          </div>
          <div className="feld">
            <label htmlFor="aermel_typ">Ärmel (nur Oberteile)</label>
            <select id="aermel_typ" name="aermel_typ" defaultValue={v.aermelTyp} {...attr("aermel_typ")}>
              <option value="">—</option>
              {AERMEL_TYPEN.map((t) => (
                <option key={t} value={t}>
                  {t === "ueberschnitten" ? "überschnitten" : t}
                </option>
              ))}
            </select>
            {meldung("aermel_typ")}
          </div>
          <div className="feld">
            <label htmlFor="messhoehe_brust_cm">Messhöhe Brust unter dem Armloch (cm)</label>
            <input id="messhoehe_brust_cm" name="messhoehe_brust_cm" inputMode="decimal" defaultValue={v.messhoehe} {...attr("messhoehe_brust_cm")} />
            {meldung("messhoehe_brust_cm")}
          </div>
        </div>
        <label className="zeile" style={{ alignItems: "center", gap: 8 }}>
          <input type="checkbox" name="tailliert" value="ja" defaultChecked={v.tailliert} />
          tailliert (Taille wird gewertet)
        </label>
      </div>

      <h2>Größen und Handmaße</h2>
      <p className="erklaerung">
        Handmaße sind freiwillig, das Vermessungsprogramm misst anhand der Fotos. Für den Vergleich: flach messen, Knöpfe und Reißverschlüsse geschlossen, nicht dehnen. Umfänge werden
        automatisch × 2 gerechnet.
      </p>
      {fehler.groessen && <p className="fehler">{fehler.groessen}</p>}

      {zeilen.map((z, i) => (
        <div className="karte" key={z.schluessel}>
          <div className="mess-groesse-kopf">
            <div className="feld" style={{ marginBottom: 0 }}>
              <label htmlFor={`g${i}_groesse`}>Größe</label>
              <input id={`g${i}_groesse`} name={`g${i}_groesse`} defaultValue={z.groesse} {...attr(`g${i}_groesse`)} />
              {meldung(`g${i}_groesse`)}
            </div>
            <button type="button" className="knopf knopf-zweit" onClick={() => setZeilen((alt) => alt.filter((a) => a.schluessel !== z.schluessel))}>
              Größe entfernen
            </button>
          </div>
          <div className="mess-felder mess-masse">
            {MASSFELDER.map(({ feld, beschriftung, umfang }) => {
              const name = feldname(i, feld);
              return (
                <div className="feld" key={feld}>
                  <label htmlFor={`${z.schluessel}-${feld}`}>
                    {beschriftung} <span className="erklaerung">{umfang ? "flach, cm" : "cm"}</span>
                  </label>
                  <input id={`${z.schluessel}-${feld}`} name={name} inputMode="decimal" defaultValue={z.flach[feld] ?? ""} {...attr(name)} />
                  {meldung(name)}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <p>
        <button type="button" className="knopf knopf-zweit" onClick={hinzufuegen}>
          Größe hinzufügen
        </button>
      </p>

      <div className="karte">
        <div className="feld" style={{ marginBottom: 0 }}>
          <label htmlFor="notiz">Notiz (optional)</label>
          <textarea id="notiz" name="notiz" rows={3} defaultValue={v.notiz} {...attr("notiz")} />
          <span className="erklaerung">Zum Beispiel: Besonderheiten beim Messen. Bitte keine Daten von Personen.</span>
          {meldung("notiz")}
        </div>
      </div>

      <p>
        <button className="knopf" type="submit" disabled={sendet}>
          {sendet ? "Wird gespeichert …" : knopf}
        </button>
      </p>
    </Form>
  );
}
