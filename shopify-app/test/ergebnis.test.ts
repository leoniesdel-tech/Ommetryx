// Texte im Ergebnis-Fenster: Warum 40?, So säße 42, zwischen zwei Größen, Skala.

import { describe, expect, it } from "vitest";
import {
  begrenztSatz,
  entscheidungshilfe,
  ersatzSatz,
  groessenKurz,
  kurzSatz,
  sicherheitText,
  skalaProzent,
  spielraumText,
  vergleichSatz,
  warumSatz,
} from "../widget/src/ergebnis";
import type { GroessenAnsicht } from "../widget/src/ergebnis";

// Erfundene Testdaten: Bluse aus dem Pflicht-Testfall (Brust 96, regulär).
const g40: GroessenAnsicht = { groesse: "40", variante: "1", zonen: [{ zone: "brust", spielraum: 8, lage: -0.2, bewertung: "passt" }] };
const g42: GroessenAnsicht = { groesse: "42", variante: "2", zonen: [{ zone: "brust", spielraum: 12, lage: 0.47, bewertung: "zu_weit" }] };

describe("Ergebnis-Texte", () => {
  it("Warum 40? (Figma E09)", () => {
    expect(warumSatz(g40, "brust", "regulaer")).toBe("An der Brust bleiben 8 cm Spielraum, ideal für eine reguläre Passform.");
  });

  it("Warum, wenn die beste Größe nicht ganz im Wunschbereich liegt", () => {
    expect(warumSatz(g42, "brust", "regulaer")).toBe(
      "An der Brust bleiben 12 cm Spielraum. Das ist etwas weiter als ideal für eine reguläre Passform, passt insgesamt aber am besten.",
    );
  });

  it("dehnbare Teile dürfen schmaler sein als der Körper", () => {
    const top: GroessenAnsicht = { groesse: "S", variante: null, zonen: [{ zone: "brust", spielraum: -2.5, lage: 0, bewertung: "passt" }] };
    expect(warumSatz(top, "brust", "koerpernah")).toBe("An der Brust ist das Teil 2,5 cm schmaler als Ihr Maß, das Material gibt nach, ideal für eine körpernahe Passform.");
    expect(spielraumText(top.zonen[0]!)).toBe("2,5 cm schmaler, dehnt sich");
  });

  it("kurzer Satz unter der Größe", () => {
    expect(kurzSatz(g40, "regulaer")).toBe("Sitzt regulär.");
    const mitTaille: GroessenAnsicht = { ...g40, zonen: [...g40.zonen, { zone: "taille", spielraum: 17, lage: 0.6, bewertung: "zu_weit" }] };
    expect(kurzSatz(mitTaille, "regulaer")).toBe("Sitzt regulär, an der Taille etwas weiter.");
  });

  it("So säße 42 (Figma E10)", () => {
    expect(vergleichSatz(g40, g42, "brust")).toBe("Insgesamt weiter, an der Brust 4 cm mehr Spielraum.");
    expect(vergleichSatz(g42, g40, "brust")).toBe("Insgesamt enger, an der Brust 4 cm weniger Spielraum.");
  });

  it("zwischen zwei Größen (Figma E38)", () => {
    expect(entscheidungshilfe(g42, g40, "brust")).toBe("Lieber etwas enger: 40. Lieber etwas weiter: 42.");
    expect(groessenKurz(g40, "brust")).toBe("Brust 8 cm Spielraum, sitzt wie gewünscht.");
  });

  it("Ersatz, wenn die empfohlene Größe ausverkauft ist (Figma E15)", () => {
    const g38: GroessenAnsicht = { groesse: "38", variante: "0", zonen: [{ zone: "brust", spielraum: 4, lage: -0.9, bewertung: "zu_eng" }] };
    expect(ersatzSatz(g40, g38, "brust")).toBe("Etwas enger: an der Brust 4 cm Spielraum statt 8 cm.");
    expect(ersatzSatz(g40, g42, "brust")).toBe("Etwas weiter: an der Brust 12 cm Spielraum statt 8 cm.");
  });

  it("Hinweis bei Begrenzung durch den Schnitt", () => {
    expect(begrenztSatz("koerpernah", "locker")).toBe(
      "Dieses Teil ist körpernah geschnitten. Locker sitzt es deshalb nur begrenzt – wir haben die Empfehlung an den Schnitt angepasst.",
    );
  });

  it("Skala: eng links, weit rechts, Mitte bei 50 %", () => {
    expect(skalaProzent(0)).toBe(50);
    expect(skalaProzent(-1)).toBe(0);
    expect(skalaProzent(2)).toBe(100);
    expect(skalaProzent(-0.2)).toBe(40);
  });

  it("Sicherheit in Worten", () => {
    expect(sicherheitText(100)).toBe("sehr sicher");
    expect(sicherheitText(70)).toBe("recht sicher");
  });

  it("sagt nie „Mehrweite“", () => {
    const texte = [warumSatz(g40, "brust", "regulaer"), vergleichSatz(g40, g42, "brust"), groessenKurz(g42, "brust")].join(" ");
    expect(texte).not.toMatch(/Mehrweite/i);
  });
});
