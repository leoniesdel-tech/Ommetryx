// Einrichtung im Admin (Figma H01): Reihenfolge und Fortschritt der fünf Schritte.

import { describe, expect, it } from "vitest";
import { einrichtungsSchritte } from "../app/haendler/einrichtung.server";
import type { Einrichtung } from "../app/haendler/einrichtung.server";

const neu: Einrichtung = {
  avvBestaetigt: false,
  avvBestaetigtAm: null,
  avvVersion: null,
  positionGeprueft: false,
  ausgeblendet: false,
  produkteGesamt: 12,
  produkteVermessen: 0,
  produkteVorgemerkt: 0,
};

describe("Einrichtung", () => {
  it("neuer Shop: 0 von 5, zuerst der AVV", () => {
    const e = einrichtungsSchritte(neu, false);
    expect(e.erledigt).toBe(0);
    expect(e.gesamt).toBe(5);
    expect(e.schritte.find((s) => !s.erledigt)?.id).toBe("avv");
  });

  it("nach AVV und aktivem Widget: 2 von 5, als Nächstes die Position", () => {
    const e = einrichtungsSchritte({ ...neu, avvBestaetigt: true }, true);
    expect(e.erledigt).toBe(2);
    expect(e.schritte.find((s) => !s.erledigt)?.id).toBe("position");
  });

  it("unbekannter Widget-Status zählt nicht als erledigt", () => {
    expect(einrichtungsSchritte({ ...neu, avvBestaetigt: true }, null).schritte[1]?.erledigt).toBe(false);
  });

  it("vermessene Produkte erledigen Auswahl und Muster", () => {
    const e = einrichtungsSchritte({ ...neu, avvBestaetigt: true, positionGeprueft: true, produkteVermessen: 3 }, true);
    expect(e.erledigt).toBe(5);
  });
});
