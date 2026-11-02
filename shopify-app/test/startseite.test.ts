// Öffentliche Startseite: keine Eingabe der Shop-Adresse (App-Store-Regel 2.3.1).

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { loader } from "../app/routes/_index/route";

const aufruf = (url: string) => loader({ request: new Request(url), params: {}, context: {} } as never);

describe("Öffentliche Startseite", () => {
  it("leitet Aufrufe von Shopify in die App weiter", async () => {
    const antwort = await aufruf("https://ommetryx-test.example/?shop=erfunden.myshopify.com&host=abc").catch((r: Response) => r);
    expect((antwort as Response).status).toBe(302);
    expect((antwort as Response).headers.get("Location")).toBe("/app?shop=erfunden.myshopify.com&host=abc");
  });

  it("hat kein Eingabefeld für die Shop-Adresse", () => {
    const quelle = readFileSync(new URL("../app/routes/_index/route.tsx", import.meta.url), "utf8");
    expect(quelle).not.toMatch(/<input|<Form|myshopify\.com/);
  });
});
