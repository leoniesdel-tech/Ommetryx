// Fotos des Messbuchs: je Größe eines, von vorne. Eigene Formulare, weil das Maß-Formular ohne Datei auskommt.

import { useState } from "react";
import { Form, useNavigation } from "react-router";
import { MAX_FOTO_MB } from "./messbuch";
import type { Vergleich } from "./programm";

export interface FotoGroesse {
  id: number;
  groesse: string;
  foto: { version: string; breite: number; hoehe: number; kamera: string | null; mb: string } | null;
  programm: { version: string | null; am: string; vergleich: Vergleich[] } | null;
}

const cm = (wert: number) => String(wert).replace(".", ",");

function ProgrammMasse({ programm }: { programm: NonNullable<FotoGroesse["programm"]> }) {
  return (
    <>
      <table className="mess-vergleich">
        <caption className="erklaerung" style={{ textAlign: "left" }}>
          Vom Programm gemessen, in cm{programm.version ? ` (Version ${programm.version})` : ""}
        </caption>
        <thead>
          <tr>
            <th scope="col">Maß</th>
            <th scope="col">Programm</th>
            <th scope="col">Hand</th>
            <th scope="col">Abweichung</th>
          </tr>
        </thead>
        <tbody>
          {programm.vergleich.map((v) => (
            <tr key={v.feld}>
              <th scope="row" style={{ fontWeight: 400 }}>
                {v.beschriftung}
                {v.umfang ? " (Umfang)" : ""}
              </th>
              <td>{cm(v.programm)}</td>
              <td>{v.hand === null ? "–" : cm(v.hand)}</td>
              <td className={v.auffaellig ? "fehler" : undefined}>
                {v.differenz === null ? "–" : `${v.differenz > 0 ? "+" : ""}${cm(v.differenz)}`}
                {v.auffaellig ? " (zu viel)" : ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function FotoKarte({ g }: { g: FotoGroesse }) {
  const [zuGross, setZuGross] = useState(false);
  const navigation = useNavigation();
  const sendet = navigation.state === "submitting" && navigation.formData?.get("groesse_id") === String(g.id);
  const feld = `foto-${g.id}`;

  return (
    <div className="karte">
      <h3 style={{ marginTop: 0 }}>Größe {g.groesse}</h3>
      {g.foto && (
        <>
          <img className="mess-foto" src={`/intern/messbuch/foto/${g.id}?v=${g.foto.version}`} alt={`Foto von Größe ${g.groesse}`} loading="lazy" />
          <p className="erklaerung">
            {g.foto.breite} × {g.foto.hoehe} Pixel · {g.foto.mb} MB · {g.foto.kamera ?? "Handy-Modell unbekannt"}
          </p>
        </>
      )}

      {g.programm && <ProgrammMasse programm={g.programm} />}

      {/* key: Nach dem Hochladen ist das Dateifeld wieder leer. */}
      <Form
        key={g.foto?.version ?? "leer"}
        method="post"
        encType="multipart/form-data"
        preventScrollReset
        onSubmit={(e) => {
          const datei = (e.currentTarget.elements.namedItem("foto") as HTMLInputElement).files?.[0];
          const istZuGross = Boolean(datei && datei.size > MAX_FOTO_MB * 1024 * 1024);
          setZuGross(istZuGross);
          if (istZuGross) e.preventDefault();
        }}
      >
        <input type="hidden" name="absicht" value="foto" />
        <input type="hidden" name="groesse_id" value={g.id} />
        <div className="feld">
          <label htmlFor={feld}>{g.foto ? "Foto ersetzen" : "Foto wählen"}</label>
          <input id={feld} name="foto" type="file" accept="image/jpeg,image/png" required {...(zuGross ? { "aria-invalid": true as const, "aria-describedby": `${feld}-fehler` } : {})} />
          {zuGross && (
            <span id={`${feld}-fehler`} className="fehler">
              Das Foto ist größer als {MAX_FOTO_MB} MB.
            </span>
          )}
        </div>
        <button className="knopf knopf-zweit" type="submit" disabled={sendet}>
          {sendet ? "Wird hochgeladen …" : "Hochladen"}
        </button>
      </Form>

      {g.foto && (
        <Form
          method="post"
          preventScrollReset
          style={{ marginTop: 8 }}
          onSubmit={(e) => {
            if (!window.confirm(`Foto von Größe ${g.groesse} endgültig löschen?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="absicht" value="foto_loeschen" />
          <input type="hidden" name="groesse_id" value={g.id} />
          <button className="knopf knopf-zweit" type="submit">
            Foto löschen
          </button>
        </Form>
      )}
    </div>
  );
}

export function MessFotos({ groessen, fehler }: { groessen: FotoGroesse[]; fehler?: string }) {
  return (
    <section aria-labelledby="fotos-titel">
      <h2 id="fotos-titel">Fotos und Programm-Maße</h2>
      <div className="karte">
        <ul className="erklaerung" style={{ margin: 0, paddingLeft: 20 }}>
          <li>Ein Foto je Größe, von vorne. Handy gerade von oben halten, parallel zum Boden.</li>
          <li>Teil und A4-Blatt ganz im Bild, mit etwas Rand.</li>
          <li>Das Blatt immer rechts unten neben das Teil legen, ohne es zu berühren.</li>
          <li>Keine Personen auf dem Foto. JPEG oder PNG, höchstens {MAX_FOTO_MB} MB. iPhone: unter Einstellungen → Kamera → Formate „Maximale Kompatibilität“ wählen.</li>
          <li>Wird eine Größe umbenannt oder entfernt, ist ihr Foto weg.</li>
        </ul>
      </div>
      {fehler && (
        <p className="meldung meldung-fehler" role="alert">
          {fehler}
        </p>
      )}
      <div className="mess-fotos">
        {groessen.map((g) => (
          <FotoKarte key={g.id} g={g} />
        ))}
      </div>
    </section>
  );
}
