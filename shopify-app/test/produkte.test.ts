// Produkte im Admin (Figma H03): Status, Größen-Spanne, wer was ändern darf.

import { describe, expect, it } from "vitest";
import { groessenSpanne, haendlerDarfAendern, produktStatus } from "../app/haendler/produkte";

describe("Status je Produkt", () => {
  it("Erfassung des Teams hat Vorrang vor dem Wunsch des Händlers", () => {
    expect(produktStatus("vermessen", "keine_beratung")).toBe("live");
    expect(produktStatus("entwurf", "vorgemerkt")).toBe("in_vermessung");
  });

  it("ohne Erfassung gilt der Wunsch, sonst „nicht vermessen“", () => {
    expect(produktStatus(null, "vorgemerkt")).toBe("vorgemerkt");
    expect(produktStatus(null, "keine_beratung")).toBe("keine_beratung");
    expect(produktStatus(null, null)).toBe("nicht_vermessen");
    expect(produktStatus(null, "quatsch")).toBe("nicht_vermessen");
  });

  it("Händler ändern nur, was das Team noch nicht erfasst", () => {
    expect(haendlerDarfAendern("nicht_vermessen")).toBe(true);
    expect(haendlerDarfAendern("vorgemerkt")).toBe(true);
    expect(haendlerDarfAendern("keine_beratung")).toBe(true);
    expect(haendlerDarfAendern("in_vermessung")).toBe(false);
    expect(haendlerDarfAendern("live")).toBe(false);
  });
});

describe("Größen-Spanne", () => {
  it("aus der Größen-Option, egal ob Deutsch oder Englisch", () => {
    expect(groessenSpanne([{ name: "Größe", werte: ["38", "40", "42", "44"] }])).toBe("38–44");
    expect(groessenSpanne([{ name: "Farbe", werte: ["Blau"] }, { name: "Size", werte: ["XS", "S", "M", "L", "XL"] }])).toBe("XS–XL");
  });

  it("ohne Größen-Option: One Size", () => {
    expect(groessenSpanne([{ name: "Title", werte: ["Default Title"] }])).toBe("One Size");
    expect(groessenSpanne([])).toBe("One Size");
  });
});
