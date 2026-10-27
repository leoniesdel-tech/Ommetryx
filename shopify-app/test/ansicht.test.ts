// Antwort an das Widget: nur Empfehlung und Vergleichsgröße, gerundet, ohne interne Rechenwerte.

import { describe, expect, it } from "vitest";
import { empfehle, standardKonfiguration } from "@ommetryx/empfehlung";
import type { Ergebnis } from "@ommetryx/empfehlung";
import { variantenNummer, widgetErgebnis } from "../app/widget/ansicht";

const k = standardKonfiguration();

// Erfundene Testdaten: Pflicht-Testfall Bluse (CLAUDE.md Abschnitt 7).
const artikel = {
  artikelart: "web_oberteil",
  schnitt: "regulaer" as const,
  material_dehnung_prozent: 15,
  tailliert: false,
  aermel_typ: "eingesetzt" as const,
  groessen: [100, 104, 108, 112].map((brust, i) => ({ groesse: String(38 + 2 * i), masse: { brust } })),
};
const kontext = {
  passform: "regulaer" as const,
  schnitt: "regulaer" as const,
  primaer: "brust",
  groessen: ["38", "40", "42", "44"].map((groesse, i) => ({ groesse, variante: String(1000 + i) })),
};

const rechne = (brust: number) => empfehle({ koerper: { koerpergroesse: 168, brust, huefte: 102 }, passform: "regulaer", artikel }, k);

describe("Antwort an das Widget", () => {
  it("Bluse, Brust 96: Größe 40 mit 8 cm Spielraum an der Brust, Vergleich 42", () => {
    const a = widgetErgebnis(rechne(96), kontext);
    expect(a.status).toBe("empfohlen");
    expect(a.recommended_size).toBe("40");
    expect(a.haupt).toEqual({ groesse: "40", variante: "1001", zonen: [{ zone: "brust", spielraum: 8, lage: -0.2, bewertung: "passt" }] });
    expect(a.vergleich?.groesse).toBe("42");
    expect(a.vergleich?.zonen[0]?.spielraum).toBe(12);
    expect(a.primaer).toBe("brust");
  });

  it("schickt höchstens zwei Größen und keine Strafen, Gewichte oder Ziel-Werte", () => {
    const text = JSON.stringify(widgetErgebnis(rechne(96), kontext));
    for (const wort of ["score", "strafe", "gewicht", "ziel_mitte", "mindest", "groessen", "zone_halbbreite"]) expect(text).not.toContain(wort);
    expect(text).not.toContain('"38"');
    expect(text).not.toContain('"44"');
  });

  it("rundet Spielräume auf halbe Zentimeter", () => {
    const a = widgetErgebnis(rechne(96.3), kontext);
    expect(a.haupt?.zonen[0]?.spielraum).toBe(7.5);
  });

  it("nimmt bei der größten Größe die nächstkleinere zum Vergleich", () => {
    const a = widgetErgebnis(rechne(104), kontext);
    expect(a.recommended_size).toBe("44");
    expect(a.vergleich?.groesse).toBe("42");
  });

  it("zeigt bei „unsicher“ die zwei besten Größen ohne feste Empfehlung", () => {
    const e = rechne(96);
    const unsicher: Ergebnis = { ...e, status: "unsicher", recommended_size: null, alternative_size: null, confidence: 40 };
    const a = widgetErgebnis(unsicher, kontext);
    expect(a.recommended_size).toBeNull();
    expect(a.haupt?.groesse).toBe("40");
    expect(a.vergleich?.groesse).toBe("42");
  });

  it("schickt ohne passende Größe keine Größen", () => {
    const e = rechne(96);
    const keine: Ergebnis = { ...e, status: "keine_passende_groesse", recommended_size: null, confidence: 0 };
    expect(widgetErgebnis(keine, kontext)).toMatchObject({ haupt: null, vergleich: null });
  });

  it("liest die Varianten-Nummer aus der Shopify-ID", () => {
    expect(variantenNummer("gid://shopify/ProductVariant/4711")).toBe("4711");
    expect(variantenNummer(null)).toBeNull();
    expect(variantenNummer("kaputt")).toBeNull();
  });
});
