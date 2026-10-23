// Prüft, dass die Konfiguration aus der Datenbank genauso rechnet wie die aus den Dateien.
// Braucht die lokale PostgreSQL-Datenbank mit Startwerten (npm run db:startwerte).

import { PrismaClient } from "@prisma/client";
import { afterAll, describe, expect, it } from "vitest";
import { empfehle, standardKonfiguration } from "@ommetryx/empfehlung";
import { ladeAktiveKonfiguration } from "../app/models/konfiguration.server";

const db = new PrismaClient();
afterAll(() => db.$disconnect());

// Erfundene Testdaten: Rechenbeispiel aus der Excel-Datei.
const bluse = {
  koerper: { koerpergroesse: 168, brust: 96, huefte: 102 },
  passform: "regulaer" as const,
  artikel: {
    artikelart: "web_oberteil",
    schnitt: "regulaer" as const,
    material_dehnung_prozent: 15,
    tailliert: false,
    aermel_typ: "eingesetzt" as const,
    groessen: [
      { groesse: "38", masse: { brust: 100 } },
      { groesse: "40", masse: { brust: 104 } },
      { groesse: "42", masse: { brust: 108 } },
      { groesse: "44", masse: { brust: 112 } },
    ],
  },
};

describe("Konfiguration aus der Datenbank", () => {
  it("ist als Version v3 aktiv", async () => {
    const k = await ladeAktiveKonfiguration(db);
    expect(k.version).toBe("v3");
  });

  it("enthält dieselben Werte wie die Dateien", async () => {
    const ausDb = await ladeAktiveKonfiguration(db);
    const ausDatei = standardKonfiguration();
    expect(ausDb.bereich("web_oberteil", "brust", "regulaer")).toEqual(ausDatei.bereich("web_oberteil", "brust", "regulaer"));
    expect(ausDb.mindestKlasse0("jacke", "brust")).toBe(9);
    expect(ausDb.parameter("faktor_zu_eng")).toBe(2);
    expect(ausDb.dehnungsklasse(15)).toBe(1);
    expect(ausDb.artikelarten).toEqual(ausDatei.artikelarten);
  });

  it("empfiehlt für die Bluse (Brust 96, regulär) Größe 40, mit denselben Strafen wie Excel", async () => {
    const ergebnis = empfehle(bluse, await ladeAktiveKonfiguration(db));
    expect(ergebnis.recommended_size).toBe("40");
    expect(ergebnis.groessen.map((g) => Number(g.score.toFixed(2)))).toEqual([6.43, 0, 0.78, 4.78]);
  });
});
