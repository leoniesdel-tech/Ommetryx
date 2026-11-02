// Prüfung der Einstellungen beim Start und Gesundheits-Adresse.

import { randomBytes } from "node:crypto";
import { describe, expect, it } from "vitest";
import { pruefeUmgebung, umgebungsFehler } from "../app/lib/umgebung";
import { loader as gesund } from "../app/routes/gesund";

const schluessel = () => randomBytes(32).toString("base64");
const vollstaendig = () => ({
  NODE_ENV: "production",
  SHOPIFY_API_KEY: "erfunden",
  SHOPIFY_API_SECRET: "erfunden",
  SHOPIFY_APP_URL: "https://ommetryx.example",
  SCOPES: "write_products,write_app_proxy",
  DATABASE_URL: "postgresql://erfunden",
  DATABASE_URL_IDENTITY: "postgresql://erfunden",
  DATABASE_URL_BODY: "postgresql://erfunden",
  DIRECT_DATABASE_URL: "postgresql://erfunden",
  BREVO_API_KEY: "erfunden",
  OX_MAIL_ABSENDER: "absender@test.invalid",
  INTERN_SCHLUESSEL: schluessel(),
  OX_SCHLUESSEL_IDENTITY: schluessel(),
  OX_SCHLUESSEL_BODY: schluessel(),
  OX_HASH_SCHLUESSEL: schluessel(),
});

describe("Einstellungen beim Start", () => {
  it("vollständig: kein Fehler", () => {
    expect(umgebungsFehler(vollstaendig())).toEqual([]);
    expect(() => pruefeUmgebung(vollstaendig())).not.toThrow();
  });

  it("nennt fehlende Namen, aber keine Werte", () => {
    const env = { ...vollstaendig(), BREVO_API_KEY: undefined, SHOPIFY_API_SECRET: "geheim-erfunden", OX_SCHLUESSEL_BODY: "zu-kurz" };
    let meldung = "";
    try {
      pruefeUmgebung(env);
    } catch (f) {
      meldung = (f as Error).message;
    }
    expect(meldung).toContain("BREVO_API_KEY fehlt");
    expect(meldung).toContain("OX_SCHLUESSEL_BODY muss 32 Byte lang sein");
    expect(meldung).not.toContain("geheim-erfunden");
    expect(meldung).not.toContain("zu-kurz");
  });

  it("gleiche Schlüssel und http werden abgelehnt", () => {
    const k = schluessel();
    const fehler = umgebungsFehler({ ...vollstaendig(), INTERN_SCHLUESSEL: k, OX_HASH_SCHLUESSEL: k, SHOPIFY_APP_URL: "http://ommetryx.example" });
    expect(fehler).toEqual(["Die Schlüssel müssen sich unterscheiden", "SHOPIFY_APP_URL muss mit https:// beginnen"]);
  });

  it("in der Entwicklung keine Prüfung", () => {
    expect(() => pruefeUmgebung({ NODE_ENV: "development" })).not.toThrow();
  });
});

describe("Gesundheits-Adresse", () => {
  it("antwortet mit ok, solange die Datenbank erreichbar ist", async () => {
    const antwort = await gesund();
    expect(antwort.status).toBe(200);
    expect(await antwort.text()).toBe("ok");
  });
});
