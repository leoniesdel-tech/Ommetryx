// Pflicht-Test: Blatt „Rechenbeispiel“ der Excel-Datei.
// Bluse aus Webware, Dehnungsklasse 1, Kundin Brust 96 cm, Passform regulär → Größe 40.
// Die Excel-Datei nennt „3 % Elastan“; als gemessene Dehnung wäre das Klasse 0.
// Wir nehmen 15 % Dehnung, das liegt sicher in Klasse 1 (offene Frage an den Mitgründer).

import { describe, expect, it } from "vitest";
import { empfehle, standardKonfiguration } from "../src/index.ts";
import { anfrage, artikel, groesse, groessen, kundin, zone } from "./hilfen.ts";

const k = standardKonfiguration();

const bluse = artikel({
  artikelart: "web_oberteil",
  schnitt: "regulaer",
  material_dehnung_prozent: 15,
  groessen: groessen([
    ["38", { brust: 100 }],
    ["40", { brust: 104 }],
    ["42", { brust: 108 }],
    ["44", { brust: 112 }],
  ]),
});

const ergebnis = empfehle(anfrage({ koerper: kundin({ brust: 96 }), artikel: bluse }), k);

describe("Rechenbeispiel Bluse (Excel)", () => {
  it("empfiehlt Größe 40", () => {
    expect(ergebnis.recommended_size).toBe("40");
    expect(ergebnis.status).toBe("empfohlen");
  });

  it("rechnet die Ziel-Mitte wie Excel: 10 × (0,5 + 0,5 × 96/92) − 1 = 9,217", () => {
    expect(zone(ergebnis, "40", "brust").ziel_mitte).toBeCloseTo(9.2174, 3);
    expect(zone(ergebnis, "40", "brust").zone_halbbreite).toBe(2);
  });

  it("hat genau die Strafen aus Excel: 6,43 / 0 / 0,78 / 4,78", () => {
    expect(groesse(ergebnis, "38").score).toBeCloseTo(6.4348, 3);
    expect(groesse(ergebnis, "40").score).toBe(0);
    expect(groesse(ergebnis, "42").score).toBeCloseTo(0.7826, 3);
    expect(groesse(ergebnis, "44").score).toBeCloseTo(4.7826, 3);
  });

  it("bewertet 38 als zu eng und 42 als zu weit", () => {
    expect(zone(ergebnis, "38", "brust").bewertung).toBe("zu_eng");
    expect(zone(ergebnis, "42", "brust").bewertung).toBe("zu_weit");
  });

  it("ist sicher (100), ohne Nachbargröße und ohne Begrenzung", () => {
    expect(ergebnis.confidence).toBe(100);
    expect(ergebnis.alternative_size).toBeNull();
    expect(ergebnis.begrenzt_durch_schnitt).toBe(false);
  });
});
