// Ergebnis-Datei des Vermessungsprogramms und Vergleich mit Handmaßen. Erfundene Werte.

import { describe, expect, it } from "vitest";
import { pruefeProgrammDatei, vergleiche } from "../app/intern/programm";

const datei = (ergebnisse: unknown, rest: object = {}) => JSON.stringify({ ergebnisse, ...rest });

describe("Ergebnis-Datei", () => {
  it("liest gültige Zeilen und die Version", () => {
    const p = pruefeProgrammDatei(datei([{ groesse_id: 7, garment_measurements: { brust: 104, gesamtlaenge: 62.5 } }], { programm_version: "v1" }));
    expect(p).toEqual({ ok: true, version: "v1", zeilen: [{ groesseId: 7, masse: { brust: 104, gesamtlaenge: 62.5 } }], fehler: [] });
  });

  it("lehnt kaputte Dateien als Ganzes ab", () => {
    expect(pruefeProgrammDatei("kein json").ok).toBe(false);
    expect(pruefeProgrammDatei("{}").ok).toBe(false);
    expect(pruefeProgrammDatei(datei([])).ok).toBe(false);
    expect(pruefeProgrammDatei(datei([{ groesse_id: "7", garment_measurements: {} }])).ok).toBe(false);
  });

  it("übernimmt gute Zeilen und meldet schlechte einzeln", () => {
    const p = pruefeProgrammDatei(
      datei([
        { groesse_id: 1, garment_measurements: { brust: 104 } },
        { groesse_id: 2, garment_measurements: { brust: 900 } },
        { groesse_id: 3, garment_measurements: { schuh: 40 } },
        { groesse_id: 4, garment_measurements: { brust: "viel" } },
        { groesse_id: 5, garment_measurements: {} },
        { groesse_id: 1, garment_measurements: { brust: 105 } },
      ]),
    );
    if (!p.ok) throw new Error(p.meldung);
    expect(p.zeilen).toEqual([{ groesseId: 1, masse: { brust: 104 } }]);
    expect(p.fehler).toHaveLength(5);
    expect(p.fehler[0]).toContain("unrealistisch");
  });
});

describe("Vergleich", () => {
  it("zeigt die Abweichung und markiert Umfänge über 1 cm", () => {
    const v = vergleiche({ brust: 106, taille: 90, schulter: 45 }, { brust: 104, taille: 89.5, schulter: 40 });
    expect(v.map((z) => [z.feld, z.differenz, z.auffaellig])).toEqual([
      ["brust", 2, true],
      ["taille", 0.5, false],
      ["schulter", 5, false], // Für Längen gibt es noch kein festgelegtes Ziel.
    ]);
  });

  it("ohne Handmaß gibt es keine Abweichung", () => {
    expect(vergleiche({ brust: 106 }, {})).toEqual([{ feld: "brust", beschriftung: "Brust", umfang: true, programm: 106, hand: null, differenz: null, auffaellig: false }]);
  });
});
