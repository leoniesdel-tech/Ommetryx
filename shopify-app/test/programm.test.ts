// Ergebnis-Datei des Vermessungsprogramms und Vergleich mit Handmaßen. Erfundene Werte.

import { describe, expect, it } from "vitest";
import { gliedere, groesseStand, teilStand } from "../app/intern/messbuch";
import { massTabelle, pruefeProgrammDatei } from "../app/intern/programm";

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

describe("Maßtabelle", () => {
  it("zeigt die Abweichung und markiert Umfänge über 1 cm", () => {
    const { spalten, zeilen } = massTabelle([{ programm: { brust: 106, taille: 90, schulter: 45 }, hand: { brust: 104, taille: 89.5, schulter: 40 } }]);
    expect(spalten.map((s) => s.feld)).toEqual(["brust", "taille", "schulter"]);
    expect(zeilen[0]!.zellen.map((z) => [z.differenz, z.auffaellig])).toEqual([
      [2, true],
      [0.5, false],
      [5, false], // Für Längen gibt es noch kein festgelegtes Ziel.
    ]);
  });

  it("zeigt nur Maße, die es gibt, und lässt Lücken ohne Abweichung", () => {
    const { spalten, zeilen } = massTabelle([
      { programm: { brust: 100 }, hand: {} },
      { programm: {}, hand: { gesamtlaenge: 60 } },
    ]);
    expect(spalten.map((s) => s.feld)).toEqual(["brust", "gesamtlaenge"]);
    expect(zeilen[0]!.zellen).toEqual([
      { programm: 100, hand: null, differenz: null, auffaellig: false },
      { programm: null, hand: null, differenz: null, auffaellig: false },
    ]);
    expect(zeilen[1]!.zellen[1]).toEqual({ programm: null, hand: 60, differenz: null, auffaellig: false });
  });

  it("ohne Maße gibt es keine Spalten", () => {
    expect(massTabelle([{ programm: {}, hand: {} }]).spalten).toEqual([]);
  });
});

describe("Stand", () => {
  const g = (foto: boolean, programm: boolean, hand: boolean) => ({ foto, programm, hand });

  it("nennt den Stand je Größe", () => {
    expect(groesseStand(g(true, true, false))).toBe("Gemessen");
    expect(groesseStand(g(false, false, true))).toBe("Von Hand gemessen");
    expect(groesseStand(g(true, false, false))).toBe("Wartet aufs Programm");
    expect(groesseStand(g(false, false, false))).toBe("Foto fehlt");
  });

  it("fasst ein Teil zusammen", () => {
    expect(teilStand([g(true, true, false), g(false, false, true)])).toBe("Alle Größen gemessen");
    expect(teilStand([g(false, false, false), g(true, false, false)])).toBe("1 Foto fehlt, 1 wartet aufs Programm");
    expect(teilStand([g(false, false, false), g(false, false, false)])).toBe("2 Fotos fehlen");
  });
});

describe("Gliederung", () => {
  it("sortiert nach Kategorie-Name und Shop", () => {
    const teile = [
      { kategorie: "web_oberteil", onlineShop: "Zebra", id: 1 },
      { kategorie: "hose", onlineShop: "Atelier", id: 2 },
      { kategorie: "web_oberteil", onlineShop: "Ähre", id: 3 },
    ];
    const g = gliedere(teile, { web_oberteil: "Blusen", hose: "Hosen" });
    expect(g.map((k) => k.kategorie)).toEqual(["Blusen", "Hosen"]);
    expect(g[0]!.shops.map((s) => s.shop)).toEqual(["Ähre", "Zebra"]);
    expect(g[1]!.shops[0]!.teile.map((t) => t.id)).toEqual([2]);
  });
});
