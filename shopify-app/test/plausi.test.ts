// Plausibilitätsprüfung im Widget: Tippfehler, Meter, Zoll, Abweichung vom erwarteten Wert.

import { describe, expect, it } from "vitest";
import { erwarteterWert, pruefePlausibel } from "../widget/src/plausi";

const k = { abweichung_cm: 6, huefte_minus_brust_cm: 8, brust_minus_taille_cm: 16 };

describe("Tippfehler und Einheiten", () => {
  it("920 cm → „Meinten Sie 92 cm?“ (Figma E17)", () => {
    expect(pruefePlausibel("brust", 920, {}, k)).toEqual({ art: "vorschlag", wert: 92, frage: "920 cm? Meinten Sie 92 cm?" });
  });

  it("Körpergröße in Metern → Vorschlag in cm", () => {
    expect(pruefePlausibel("koerpergroesse", 1.68, {}, k)).toMatchObject({ art: "vorschlag", wert: 168 });
    expect(pruefePlausibel("koerpergroesse", 1680, {}, k)).toMatchObject({ art: "vorschlag", wert: 168 });
    expect(pruefePlausibel("koerpergroesse", 168, {}, k)).toBeNull();
  });

  it("Brust 38 → „Haben Sie in Zoll gemessen?“ mit 97 cm", () => {
    const h = pruefePlausibel("brust", 38, {}, k);
    expect(h).toMatchObject({ art: "vorschlag", wert: 97 });
    expect(h && "frage" in h ? h.frage : "").toMatch(/Zoll/);
  });

  it("normale Werte ohne Vergleich bleiben unauffällig", () => {
    expect(pruefePlausibel("brust", 96, {}, k)).toBeNull();
  });
});

describe("Abweichung vom erwarteten Wert (Konfektionstabelle, mehr als 6 cm)", () => {
  it("erwartet Hüfte ≈ Brust + 8 und Taille ≈ Brust − 16", () => {
    expect(erwarteterWert("huefte", { brust: 92 }, k)).toBe(100);
    expect(erwarteterWert("taille", { brust: 92 }, k)).toBe(76);
    expect(erwarteterWert("taille", { brust: 92, huefte: 100 }, k)).toBe(76);
  });

  it("Hüfte 78 bei Brust 92 → nachfragen, mit Hinweis „oft zu klein gemessen“ (Figma E17)", () => {
    const h = pruefePlausibel("huefte", 78, { brust: 92 }, k);
    expect(h?.art).toBe("nachmessen");
    expect(h && "text" in h ? h.text : "").toBe("Die Hüfte wirkt im Vergleich zu Ihren anderen Maßen klein. Sie wird oft zu klein gemessen.");
  });

  it("innerhalb von 6 cm keine Nachfrage", () => {
    expect(pruefePlausibel("huefte", 102, { brust: 96 }, k)).toBeNull();
    expect(pruefePlausibel("huefte", 110, { brust: 96 }, k)).toBeNull();
  });

  it("deutlich größere Taille → nachfragen", () => {
    expect(pruefePlausibel("taille", 100, { brust: 96, huefte: 102 }, k)?.art).toBe("nachmessen");
  });
});
