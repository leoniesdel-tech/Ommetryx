// Mail-Versand in Produktion über Brevo. Es geht nie etwas ins Internet: fetch ist ersetzt.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendeLoginCode } from "../app/kundin/mail.server";

const EMAIL = "erfunden@test.invalid";

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "production");
  vi.stubEnv("BREVO_API_KEY", "erfundener-schluessel");
  vi.stubEnv("OX_MAIL_ABSENDER", "absender@test.invalid");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("Brevo", () => {
  it("schickt die dokumentierte Anfrage", async () => {
    const abruf = vi.fn(async () => new Response(JSON.stringify({ messageId: "erfunden" }), { status: 201 }));
    vi.stubGlobal("fetch", abruf);
    await sendeLoginCode(EMAIL, "123456");
    const [adresse, optionen] = abruf.mock.calls[0] as unknown as [string, RequestInit];
    expect(adresse).toBe("https://api.brevo.com/v3/smtp/email");
    expect(optionen.headers).toMatchObject({ "api-key": "erfundener-schluessel", "content-type": "application/json" });
    const inhalt = JSON.parse(String(optionen.body));
    expect(inhalt).toMatchObject({ sender: { email: "absender@test.invalid" }, to: [{ email: EMAIL }], subject: "Ihr Ommetryx-Code" });
    expect(inhalt.textContent).toContain("123456");
  });

  it("Fehlermeldung ohne Adresse und Code", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("nein", { status: 401 })));
    const fehler = await sendeLoginCode(EMAIL, "123456").catch((f: Error) => f.message);
    expect(fehler).toBe("E-Mail-Versand fehlgeschlagen (401)");
  });

  it("ohne Schlüssel kein Versandversuch", async () => {
    vi.stubEnv("BREVO_API_KEY", "");
    const abruf = vi.fn();
    vi.stubGlobal("fetch", abruf);
    await expect(sendeLoginCode(EMAIL, "123456")).rejects.toThrow("noch nicht eingerichtet");
    expect(abruf).not.toHaveBeenCalled();
  });
});
