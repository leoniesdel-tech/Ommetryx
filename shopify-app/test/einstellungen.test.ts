// Einstellungen und Lesbarkeits-Check des Buttons (Figma H10).

import { describe, expect, it } from "vitest";
import { STANDARD, einstellungenSchema, fuerBlock, mitStandard, pruefeButton } from "../app/haendler/einstellungen";
import { kontrast, schriftfarbe } from "../app/haendler/kontrast";

describe("Kontrast nach WCAG", () => {
  it("Schwarz auf Weiß 21 : 1, Weiß auf Weiß 1 : 1", () => {
    expect(kontrast("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(kontrast("#FFFFFF", "#FFFFFF")).toBe(1);
  });

  it("wählt Weiß auf Ink und Schwarz auf Apricot hell", () => {
    expect(schriftfarbe("#0C3A4A")).toBe("#FFFFFF");
    expect(schriftfarbe("#F5916A")).toBe("#000000");
  });
});

describe("Lesbarkeits-Check", () => {
  it("Theme- und Ommetryx-Modus sind immer in Ordnung", () => {
    expect(pruefeButton({ ...STANDARD, modus: "theme" }).ok).toBe(true);
    expect(pruefeButton({ ...STANDARD, modus: "ommetryx" }).ok).toBe(true);
  });

  it("eigene Gestaltung in Dunkelgrau (Figma-Beispiel #2B2B2B) ist gut lesbar", () => {
    const p = pruefeButton({ ...STANDARD, modus: "eigen", darstellung: "umrandet", farbe: "#2B2B2B" });
    expect(p.ok).toBe(true);
    expect(p.rahmen).toBeGreaterThan(12);
  });

  it("zu helle Farbe wird abgelehnt", () => {
    const p = pruefeButton({ ...STANDARD, modus: "eigen", darstellung: "umrandet", farbe: "#F5916A" });
    expect(p.ok).toBe(false);
  });

  it("gefüllt: Schrift wird automatisch lesbar, die Fläche muss sich trotzdem vom Hintergrund abheben", () => {
    expect(pruefeButton({ ...STANDARD, modus: "eigen", darstellung: "gefuellt", farbe: "#0C3A4A" }).ok).toBe(true);
    expect(pruefeButton({ ...STANDARD, modus: "eigen", darstellung: "gefuellt", farbe: "#FFF7E0" }).ok).toBe(false);
  });
});

describe("Speichern", () => {
  it("füllt alte oder fehlende Werte mit Standardwerten", () => {
    expect(mitStandard(null)).toEqual(STANDARD);
    expect(mitStandard({ buttonText: "Größe finden", modus: "quatsch" })).toEqual({ ...STANDARD, buttonText: "Größe finden" });
  });

  it("Datenschutz-Link nur mit https", () => {
    expect(einstellungenSchema.safeParse({ ...STANDARD, datenschutzLink: "http://shop.example/datenschutz" }).success).toBe(false);
    expect(einstellungenSchema.safeParse({ ...STANDARD, datenschutzLink: "https://shop.example/datenschutz" }).success).toBe(true);
    expect(einstellungenSchema.safeParse({ ...STANDARD, datenschutzLink: 'https://x.example/"><script>' }).success).toBe(false);
  });

  it("Block bekommt nur, was er für den Button braucht", () => {
    const b = fuerBlock({ ...STANDARD, modus: "eigen", darstellung: "gefuellt", farbe: "#0C3A4A", ecken: "pille", datenschutzLink: "https://x.example" });
    expect(b).toEqual({ text: "Meine Größe finden", modus: "eigen", darstellung: "gefuellt", farbe: "#0C3A4A", schrift: "#FFFFFF", radius: 999, symbol: "logo" });
  });
});
