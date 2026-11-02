// Einrichtung der Datenbank-Benutzer für den Server. Nur erfundene Werte, keine Datenbank.

import { describe, expect, it } from "vitest";
import { rollenSql, zugang } from "../scripts/db-rollen.mjs";

const adresse = (name: string, passwort: string) => `postgresql://${name}:${passwort}@db.example:5432/ommetryx?schema=app`;

describe("Datenbank-Benutzer", () => {
  it("liest Name und Passwort aus der Adresse", () => {
    expect(zugang(adresse("ommetryx_app", "erfundenesPasswort16"), "ommetryx_app")).toEqual({ name: "ommetryx_app", passwort: "erfundenesPasswort16" });
  });

  it("lehnt falschen Benutzer, kurze Passwörter und Sonderzeichen ab", () => {
    expect(() => zugang(adresse("ommetryx_dev", "erfundenesPasswort16"), "ommetryx_app")).toThrow();
    expect(() => zugang(adresse("ommetryx_app", "kurz"), "ommetryx_app")).toThrow();
    expect(() => zugang(adresse("ommetryx_app", "erfunden%27passwort16lang"), "ommetryx_app")).toThrow();
  });

  it("Fehlermeldungen nennen kein Passwort", () => {
    let meldung = "";
    try {
      zugang(adresse("ommetryx_app", "kurz"), "ommetryx_app");
    } catch (f) {
      meldung = (f as Error).message;
    }
    expect(meldung).not.toContain("kurz@");
  });

  it("legt an oder setzt das Passwort neu", () => {
    const sql = rollenSql({ name: "ommetryx_app", passwort: "erfundenesPasswort16" });
    expect(sql).toContain("ALTER ROLE ommetryx_app LOGIN PASSWORD");
    expect(sql).toContain("CREATE ROLE ommetryx_app LOGIN PASSWORD");
  });
});
