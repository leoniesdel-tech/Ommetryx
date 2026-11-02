// Maße eines Teils auf einen Blick: je Größe eine Zeile, je Maß eine Spalte.

import { fotoAdresse } from "./MessFotos";
import type { FotoGroesse } from "./MessFotos";
import { massTabelle } from "./programm";
import type { MassZelle } from "./programm";
import type { Masse } from "./erfassung";

export interface TabellenGroesse extends FotoGroesse {
  hand: Masse;
  programm: Masse;
  stand: string;
}

const cm = (wert: number) => String(wert).replace(".", ",");

function Zelle({ z }: { z: MassZelle }) {
  if (z.programm === null && z.hand === null) return <>–</>;
  if (z.programm === null) return <span className="mess-klein">{cm(z.hand!)} (Hand)</span>;
  return (
    <>
      {cm(z.programm)}
      {z.hand !== null && (
        <span className={`mess-klein ${z.auffaellig ? "fehler" : ""}`}>
          Hand {cm(z.hand)} ({z.differenz! > 0 ? "+" : ""}
          {cm(z.differenz!)})
        </span>
      )}
    </>
  );
}

export function MassTabelle({ groessen }: { groessen: TabellenGroesse[] }) {
  const { spalten, zeilen } = massTabelle(groessen);
  const titel = "Maße je Größe";

  return (
    <section aria-label={titel}>
      <h2>{titel}</h2>
      {/* tabIndex: Auf schmalen Bildschirmen lässt sich die Tabelle auch per Tastatur seitlich verschieben. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div className="karte mess-tabelle-huelle" role="region" aria-label={`${titel}, seitlich verschiebbar`} tabIndex={0}>
        <table className="mess-tabelle">
          <caption className="erklaerung">In cm, Umfänge als ganzer Umfang (Flachmaß × 2). Rot: mehr als 1 cm Abweichung von der Handmessung.</caption>
          <thead>
            <tr>
              <th scope="col">Größe</th>
              <th scope="col">Foto</th>
              {spalten.map(({ feld, beschriftung }) => (
                <th scope="col" key={feld}>
                  {beschriftung}
                </th>
              ))}
              <th scope="col">Stand</th>
            </tr>
          </thead>
          <tbody>
            {zeilen.map(({ groesse: g, zellen }) => (
              <tr key={g.id}>
                <th scope="row">{g.groesse}</th>
                <td>
                  {g.foto ? (
                    <a href={fotoAdresse(g)} target="_blank" rel="noreferrer">
                      <img className="mess-mini" src={fotoAdresse(g)} alt={`Foto von Größe ${g.groesse} öffnen`} loading="lazy" />
                    </a>
                  ) : (
                    "–"
                  )}
                </td>
                {zellen.map((z, i) => (
                  <td key={spalten[i]!.feld}>
                    <Zelle z={z} />
                  </td>
                ))}
                <td>{g.stand}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
