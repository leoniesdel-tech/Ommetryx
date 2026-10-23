import { describe, expect, it } from "vitest";
import excel from "../konfiguration/konfiguration-v3.json" with { type: "json" };
import ergaenzungen from "../konfiguration/ergaenzungen-v3.json" with { type: "json" };
import { EmpfehlungsFehler, ladeKonfiguration, standardKonfiguration } from "../src/index.ts";

const k = standardKonfiguration();

describe("Konfiguration aus der Excel-Datei", () => {
  it("enthält die Werte aus dem Blatt Bereiche, die Mitte wird berechnet", () => {
    expect(k.bereich("web_oberteil", "brust", "regulaer")).toMatchObject({ unter: 8, ober: 12, mitte: 10 });
    expect(k.bereich("jacke", "brust", "locker")?.mitte).toBe(18.5);
    expect(k.bereich("rock_hose_stretch", "taille", "koerpernah")?.mitte).toBe(0);
    expect(k.bereich("web_tailliert", "taille", "oversized")).toBeUndefined(); // „nicht werten“
  });

  it("enthält die Parameter", () => {
    expect(k.parameter("faktor_zu_eng")).toBe(2);
    expect(k.parameter("schwelle_unsicher")).toBe(60);
    expect(k.kRef("brust")).toBe(92);
    expect(k.kRef("taille")).toBeUndefined();
  });

  it("ordnet die Dehnung den Klassen zu (Obergrenze jeweils ausschließlich)", () => {
    expect(k.dehnungsklasse(3)).toBe(0);
    expect(k.dehnungsklasse(5)).toBe(1);
    expect(k.dehnungsklasse(15)).toBe(1);
    expect(k.dehnungsklasse(25)).toBe(2);
    expect(k.dehnungsklasse(60)).toBe(3);
    expect(k.dehnungsklasse(80)).toBe(4);
  });

  it("kennt alle Artikelarten, und jede verweist nur auf vorhandene Zeilen", () => {
    expect(k.artikelarten).toEqual(
      expect.arrayContaining(["web_oberteil", "jersey_oberteil", "strick", "jacke", "mantel", "rock_web", "hose_web", "leggings"]),
    );
  });

  it("bricht mit klarer Meldung ab, wenn ein Parameter fehlt", () => {
    const { faktor_zu_eng: _weg, ...rest } = excel.parameter;
    expect(() => ladeKonfiguration({ ...excel, parameter: rest }, ergaenzungen)).toThrow(/faktor_zu_eng/);
  });

  it("bricht ab, wenn eine Artikelart auf eine unbekannte Zeile verweist", () => {
    const kaputt = structuredClone(ergaenzungen);
    kaputt.artikelarten.strick.messpunkte.brust.zeile = "gibt_es_nicht";
    expect(() => ladeKonfiguration(excel, kaputt)).toThrow(EmpfehlungsFehler);
  });
});
