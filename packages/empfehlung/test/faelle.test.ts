// Weitere Fälle nach v3. Alle Erwartungswerte sind von Hand nachgerechnet (Rechenweg im Kommentar).

import { describe, expect, it } from "vitest";
import { bestimmeStatus, empfehle, EmpfehlungsFehler, standardKonfiguration } from "../src/index.ts";
import { anfrage, artikel, groesse, groessen, kundin, zone } from "./hilfen.ts";

const k = standardKonfiguration();

describe("Dehnung", () => {
  it("Rippstrick (Klasse 3) in Kategorie Strick (Referenz 2), körpernah: Korrektur −2 cm", () => {
    // Mitte −1, Korrektur −6 − (−4) = −2 → −3. Mehrweiten −8 / −4 / 0, Zone ±2.
    const e = empfehle(
      anfrage({
        passform: "koerpernah",
        artikel: artikel({
          artikelart: "strick",
          schnitt: "koerpernah",
          material_dehnung_prozent: 60,
          groessen: groessen([
            ["S", { brust: 84 }],
            ["M", { brust: 88 }],
            ["L", { brust: 92 }],
          ]),
        }),
      }),
      k,
    );
    expect(zone(e, "M", "brust").ziel_mitte).toBeCloseTo(-3, 6);
    expect(zone(e, "M", "brust").mindest).toBeCloseTo(-11.04, 6); // −0,2 × 0,6 × 92
    expect(groesse(e, "S").score).toBeCloseTo(6, 6);
    expect(groesse(e, "L").score).toBeCloseTo(1, 6);
    expect(e.recommended_size).toBe("M");
  });
});

describe("Begrenzung durch den Schnitt", () => {
  const pullover = artikel({
    artikelart: "strick",
    schnitt: "oversized",
    material_dehnung_prozent: 30,
    groessen: groessen([
      ["S", { brust: 104 }],
      ["M", { brust: 108 }],
      ["L", { brust: 112 }],
      ["XL", { brust: 116 }],
    ]),
  });

  it("Oversize-Pullover mit Wunsch körpernah: höchstens ein Größensprung vom Schnitt", () => {
    // Schnitt-Mitte 24, Wunsch −1 → begrenzt auf 24 − 4 = 20. Mehrweite 20 bei L.
    const e = empfehle(anfrage({ passform: "koerpernah", artikel: pullover }), k);
    expect(zone(e, "L", "brust").ziel_mitte).toBeCloseTo(20, 6);
    expect(e.recommended_size).toBe("L");
    expect(e.begrenzt_durch_schnitt).toBe(true);
    expect(e.confidence).toBe(90);
  });

  it("dieselbe Kundin mit Wunsch oversized bekommt XL, ohne Begrenzung", () => {
    const e = empfehle(anfrage({ passform: "oversized", artikel: pullover }), k);
    expect(e.recommended_size).toBe("XL");
    expect(e.begrenzt_durch_schnitt).toBe(false);
    expect(e.confidence).toBe(100);
  });
});

describe("Hose mit Taille, Hüfte und Oberschenkel", () => {
  const hose = artikel({
    artikelart: "hose_web",
    bund_typ: "fest",
    aermel_typ: undefined,
    groessen: groessen([
      ["36", { taille: 72, huefte: 98, oberschenkel: 58 }],
      ["38", { taille: 76, huefte: 102, oberschenkel: 60 }],
      ["40", { taille: 80, huefte: 106, oberschenkel: 62 }],
    ]),
  });

  it("wertet alle drei Messpunkte mit den Hosen-Gewichten 1 / 1 / 0,6", () => {
    // Taille: Mitte 2, Zone ±2, Mindest 1, Obergrenze oversized 5.
    //   36: 2×2 + 4×3 = 16 · 38: 0 · 40: 2 + 2×(6 − 5) = 4
    // Hüfte: 9 × 0,97 = 8,73, Zone ±2.     36: 2×2,73 = 5,46 · 38: 0 · 40: 1,27
    // Oberschenkel: Mitte 8, G = 2, Zone ±1. 36: 2 · 38: 0 · 40: 1
    const e = empfehle(anfrage({ koerper: kundin({ taille: 74, huefte: 94, oberschenkel: 52 }), artikel: hose }), k);
    expect(zone(e, "38", "huefte").ziel_mitte).toBeCloseTo(8.73, 6);
    expect(zone(e, "38", "oberschenkel").gewicht).toBe(0.6);
    expect(groesse(e, "36").score).toBeCloseTo(16 + 5.46 + 0.6 * 2, 6);
    expect(groesse(e, "38").score).toBe(0);
    expect(groesse(e, "40").score).toBeCloseTo(4 + 1.27 + 0.6 * 1, 6);
    expect(e.recommended_size).toBe("38");
  });

  it("wertet den Oberschenkel nur, wenn er im Profil steht", () => {
    const e = empfehle(anfrage({ koerper: kundin({ taille: 74, huefte: 94 }), artikel: hose }), k);
    expect(groesse(e, "38").zonen.map((z) => z.messpunkt)).toEqual(["taille", "huefte"]);
  });

  it("wertet die Taille bei Gummizugbund nicht", () => {
    const e = empfehle(
      anfrage({ koerper: kundin({ taille: 74, huefte: 94 }), artikel: { ...hose, bund_typ: "gummizug" } }),
      k,
    );
    expect(groesse(e, "38").zonen.map((z) => z.messpunkt)).toEqual(["huefte"]);
  });

  it("braucht bei Hosen die Taille und nennt im Fehler keine Messwerte", () => {
    let fehler: unknown;
    try {
      empfehle(anfrage({ koerper: kundin({ huefte: 94 }), artikel: hose }), k);
    } catch (f) {
      fehler = f;
    }
    expect(fehler).toBeInstanceOf(EmpfehlungsFehler);
    expect((fehler as EmpfehlungsFehler).code).toBe("fehlendes_koerpermass");
    expect((fehler as EmpfehlungsFehler).message).not.toMatch(/\d/);
  });
});

describe("Mindest-Mehrweite und Ausschluss", () => {
  const bluse = (liste: [string, { brust: number }][]) =>
    artikel({ artikelart: "web_oberteil", groessen: groessen(liste) });

  it("schließt Größen aus, die mehr als 3 cm unter Mindest liegen (Klasse 0)", () => {
    // Mindest 5 → Ausschluss unter 2. Mehrweiten −4 / 0 / 4 / 8.
    const e = empfehle(
      anfrage({
        koerper: kundin({ brust: 100 }),
        artikel: bluse([
          ["36", { brust: 96 }],
          ["38", { brust: 100 }],
          ["40", { brust: 104 }],
          ["42", { brust: 108 }],
        ]),
      }),
      k,
    );
    expect(groesse(e, "36").ausgeschlossen).toBe(true);
    expect(groesse(e, "38").ausschlussgruende).toEqual(["unter_mindest"]);
    expect(groesse(e, "40").ausgeschlossen).toBe(false);
    // 40: 2 × 4,4348 + 4 × (5 − 4) = 12,87
    expect(groesse(e, "40").score).toBeCloseTo(12.8696, 3);
    expect(e.recommended_size).toBe("42");
  });

  it("zieht 20 Punkte ab, wenn die beste Größe unter Mindest liegt", () => {
    const e = empfehle(
      anfrage({
        koerper: kundin({ brust: 100 }),
        artikel: bluse([
          ["38", { brust: 100 }],
          ["40", { brust: 104 }],
        ]),
      }),
      k,
    );
    expect(e.recommended_size).toBe("40");
    expect(e.confidence).toBe(80);
  });

  it("meldet „keine passende Größe“, wenn alle ausgeschlossen sind", () => {
    const e = empfehle(
      anfrage({
        koerper: kundin({ brust: 100 }),
        artikel: bluse([
          ["36", { brust: 96 }],
          ["38", { brust: 100 }],
        ]),
      }),
      k,
    );
    expect(e.status).toBe("keine_passende_groesse");
    expect(e.recommended_size).toBeNull();
  });
});

describe("Schulter", () => {
  it("schließt Größen aus, deren Schulter mehr als 2,5 cm schmaler ist als das Referenzteil", () => {
    // Brust: Mitte 10, Mehrweiten 10 / 14 / 18. Schulter −3 / −1,5 / 0, Toleranz ±1.
    // 40: Brust 2 + Schulter 0,8 × 2 × 0,5 = 2,8 · 42: Brust 6
    const e = empfehle(
      anfrage({
        koerper: kundin({ schulterbreite_referenz: 39 }),
        artikel: artikel({
          artikelart: "web_oberteil",
          groessen: groessen([
            ["38", { brust: 102, schulter: 36 }],
            ["40", { brust: 106, schulter: 37.5 }],
            ["42", { brust: 110, schulter: 39 }],
          ]),
        }),
      }),
      k,
    );
    expect(groesse(e, "38").ausschlussgruende).toEqual(["schulter_zu_schmal"]);
    expect(groesse(e, "40").score).toBeCloseTo(2.8, 6);
    expect(e.recommended_size).toBe("40");
  });
});

describe("Taille bei Oberteilen", () => {
  const masse = groessen([["40", { brust: 102, taille: 84 }]]);

  it("tailliert: Bereich aus „Kleider und Blusen tailliert“, Gewicht 0,8", () => {
    const e = empfehle(
      anfrage({ koerper: kundin({ taille: 76 }), artikel: artikel({ artikelart: "web_oberteil", tailliert: true, groessen: masse }) }),
      k,
    );
    expect(zone(e, "40", "taille").ziel_mitte).toBe(6);
    expect(zone(e, "40", "taille").gewicht).toBe(0.8);
  });

  it("nicht tailliert: nur Mindestprüfung, Gewicht 0", () => {
    const e = empfehle(
      anfrage({ koerper: kundin({ taille: 76 }), artikel: artikel({ artikelart: "web_oberteil", groessen: masse }) }),
      k,
    );
    expect(zone(e, "40", "taille").ziel_mitte).toBeNull();
    expect(zone(e, "40", "taille").gewicht).toBe(0);
    expect(zone(e, "40", "taille").mindest).toBe(2);
  });
});

describe("Leggings", () => {
  it("rechnet den Bereich in Prozent des Körpermaßes", () => {
    // −15 % bis −5 % → Mitte −10 % von 100 cm = −10 cm. Mehrweiten −14 / −10 / −6.
    const e = empfehle(
      anfrage({
        passform: "koerpernah",
        artikel: artikel({
          artikelart: "leggings",
          schnitt: "koerpernah",
          material_dehnung_prozent: 80,
          aermel_typ: undefined,
          groessen: groessen([
            ["S", { huefte: 86 }],
            ["M", { huefte: 90 }],
            ["L", { huefte: 94 }],
          ]),
        }),
      }),
      k,
    );
    expect(zone(e, "M", "huefte").ziel_mitte).toBeCloseTo(-10, 6);
    expect(e.recommended_size).toBe("M");
  });
});

describe("Lernen als Eingabe", () => {
  it("ein persönlicher Offset verschiebt die Ziel-Mitte", () => {
    // Rechenbeispiel-Bluse, Mitte 9,22 + 4 = 13,22 → Größe 42 (Mehrweite 12) passt.
    const e = empfehle(
      anfrage({
        koerper: kundin({ brust: 96 }),
        offsets: { brust: 4 },
        artikel: artikel({
          artikelart: "web_oberteil",
          material_dehnung_prozent: 15,
          groessen: groessen([
            ["38", { brust: 100 }],
            ["40", { brust: 104 }],
            ["42", { brust: 108 }],
            ["44", { brust: 112 }],
          ]),
        }),
      }),
      k,
    );
    expect(zone(e, "42", "brust").ziel_mitte).toBeCloseTo(13.2174, 3);
    expect(e.recommended_size).toBe("42");
  });
});

describe("Konfidenz und Status", () => {
  it("füllt die Nachbargröße, wenn zwei Größen gleich gut passen", () => {
    // Mitte 10, Zone ±2: Mehrweiten 8 und 12 sind beide straffrei.
    const e = empfehle(
      anfrage({
        artikel: artikel({
          artikelart: "web_oberteil",
          groessen: groessen([
            ["38", { brust: 100 }],
            ["40", { brust: 104 }],
          ]),
        }),
      }),
      k,
    );
    expect(e.recommended_size).toBe("38");
    expect(e.alternative_size).toBe("40");
  });

  it("unter 60 ist das Ergebnis „unsicher“", () => {
    expect(bestimmeStatus(k, 59)).toBe("unsicher");
    expect(bestimmeStatus(k, 60)).toBe("empfohlen");
  });

  it.todo("Abzug „knapp“ (−10 bis −25): Abstufung fehlt noch (offene Frage 1 an den Mitgründer)");
});

describe("Noch offen", () => {
  it.todo("Figur-Korrektur (höchstens ±2 cm, Gewichte): Regeln aus v2 fehlen (offene Frage 3)");
  it.todo("Kragen: Ausschluss bei zu engem Hals, Felder hat_kragen und hals fehlen (offene Frage 4)");
  it.todo("Gummizugbund: Ausschluss, wenn Bund gedehnt kleiner als Hüfte, Feld taille_gedehnt fehlt (offene Frage 4)");
});
