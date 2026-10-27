// Sie oder du im Widget (stellt der Händler ein, CLAUDE.md Abschnitt 6).
// Prüft, dass die Du-Fassung kein „Sie/Ihr/Ihnen“ enthält und kein sichtbarer Text die Ansprache umgeht.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { bereichText, fehltText } from "../widget/src/eingaben";
import { ersatzSatz, warumSatz } from "../widget/src/ergebnis";
import type { GroessenAnsicht } from "../widget/src/ergebnis";
import { pruefePlausibel } from "../widget/src/plausi";
import { SCHRITTE, SCHRITTE_DU } from "../widget/src/texte";

const SIE = /\b(Sie|Ihr|Ihre|Ihren|Ihrem|Ihrer|Ihres|Ihnen)\b/;
const k = { abweichung_cm: 6, huefte_minus_brust_cm: 8, brust_minus_taille_cm: 16 };
const g40: GroessenAnsicht = { groesse: "40", variante: "1", zonen: [{ zone: "brust", spielraum: -2, lage: 0, bewertung: "passt" }] };

describe("Du-Fassung", () => {
  it("Mess-Schritte ohne Sie", () => {
    for (const text of Object.values(SCHRITTE_DU).flatMap((s) => Object.values(s))) expect(text).not.toMatch(SIE);
    expect(SCHRITTE_DU.brust.frage).toBe("Dein Brustumfang");
    expect(SCHRITTE.brust.frage).toBe("Ihr Brustumfang");
  });

  it("Nachfragen bei unplausiblen Werten", () => {
    expect(pruefePlausibel("koerpergroesse", 1.68, {}, k, true)).toMatchObject({ frage: "1,68 m? Meintest du 168 cm?" });
    expect(pruefePlausibel("brust", 38, {}, k, true)).toMatchObject({ frage: expect.stringMatching(/^Hast du in Zoll gemessen\?/) });
    const huefte = pruefePlausibel("huefte", 78, { brust: 92 }, k, true);
    expect(huefte && "text" in huefte ? huefte.text : "").toBe("Die Hüfte wirkt im Vergleich zu deinen anderen Maßen klein. Die Hüfte wird oft zu klein gemessen.");
  });

  it("Feldfehler mit richtigem Artikel (Körpergröße ist weiblich)", () => {
    expect(fehltText("koerpergroesse")).toBe("Bitte geben Sie Ihre Körpergröße in cm ein.");
    expect(fehltText("brust")).toBe("Bitte geben Sie Ihren Brustumfang in cm ein.");
    expect(fehltText("koerpergroesse", true)).toBe("Bitte gib deine Körpergröße in cm ein.");
    expect(fehltText("taille", true)).toBe("Bitte gib deinen Taillenumfang in cm ein.");
    expect(bereichText(30, 250, true)).not.toMatch(SIE);
  });

  it("Ergebnis-Sätze", () => {
    expect(warumSatz(g40, "brust", "koerpernah", true)).toContain("schmaler als dein Maß");
    expect(warumSatz(g40, "brust", "koerpernah")).toContain("schmaler als Ihr Maß");
    expect(ersatzSatz({ ...g40, zonen: [] }, g40, "brust", true)).toBe("Die nächstbeste Größe für deine Maße.");
  });

  it("Widget: jeder sichtbare Sie-Text läuft über die Ansprache, die Du-Fassung ohne Sie", () => {
    const quelle = readFileSync(new URL("../widget/src/widget.ts", import.meta.url), "utf8");
    const zeilen = quelle
      .split("\n")
      .filter((z) => !/^\s*(\/\/|\/\*\*|\*)/.test(z))
      .filter((z) => SIE.test(z.replace(/this\.t\("[^"]*",\s*"[^"]*"\)/g, "")));
    expect(zeilen).toEqual([]);
    const duTexte = [...quelle.matchAll(/this\.t\("[^"]*",\s*"([^"]*)"\)/g)].map((m) => m[1]!);
    expect(duTexte.length).toBeGreaterThan(20);
    for (const text of duTexte) expect(text).not.toMatch(SIE);
  });
});
