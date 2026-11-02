// Begrenzung der Empfehlungs-Anfragen.

import { beforeEach, describe, expect, it, vi } from "vitest";
import { anfrageErlaubt, setzeBegrenzungZurueck } from "../app/widget/begrenzung.server";

vi.mock("../app/lib/krypto.server", () => ({ sha256: (wert: string) => wert }));

const SHOP = "begrenzung-test.myshopify.com";

beforeEach(setzeBegrenzungZurueck);

describe("Begrenzung je Besucher", () => {
  it("erlaubt 30 Anfragen pro Minute, die 31. nicht", () => {
    for (let i = 0; i < 30; i++) expect(anfrageErlaubt(SHOP, "203.0.113.1", 1000)).toBe(true);
    expect(anfrageErlaubt(SHOP, "203.0.113.1", 1000)).toBe(false);
  });

  it("nach einer Minute geht es wieder", () => {
    for (let i = 0; i < 31; i++) anfrageErlaubt(SHOP, "203.0.113.1", 1000);
    expect(anfrageErlaubt(SHOP, "203.0.113.1", 61_000)).toBe(true);
  });

  it("andere Besucher und andere Shops sind nicht betroffen", () => {
    for (let i = 0; i < 31; i++) anfrageErlaubt(SHOP, "203.0.113.1", 1000);
    expect(anfrageErlaubt(SHOP, "203.0.113.2", 1000)).toBe(true);
    expect(anfrageErlaubt("anderer.myshopify.com", "203.0.113.1", 1000)).toBe(true);
  });

  it("zählt die erste Adresse der Weiterleitungs-Kette", () => {
    for (let i = 0; i < 31; i++) anfrageErlaubt(SHOP, "203.0.113.1, 198.51.100.7", 1000);
    expect(anfrageErlaubt(SHOP, "203.0.113.1, 192.0.2.9", 1000)).toBe(false);
  });
});

describe("Begrenzung je Shop", () => {
  it("greift auch bei wechselnden Adressen", () => {
    for (let i = 0; i < 1200; i++) expect(anfrageErlaubt(SHOP, `10.0.${Math.floor(i / 250)}.${i % 250}`, 1000)).toBe(true);
    expect(anfrageErlaubt(SHOP, "203.0.113.50", 1000)).toBe(false);
  });
});
