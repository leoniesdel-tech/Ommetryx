// Datenschutz: Das Modul darf keine Körpermaße ausgeben oder loggen.

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const srcOrdner = fileURLToPath(new URL("../src/", import.meta.url));
const dateien = readdirSync(srcOrdner).filter((d) => d.endsWith(".ts"));

describe("Datenschutz im Empfehlungsmodul", () => {
  it.each(dateien)("%s enthält keine Konsolen-Ausgabe", (datei) => {
    const inhalt = readFileSync(srcOrdner + datei, "utf8");
    expect(inhalt).not.toMatch(/\bconsole\s*\./);
  });

  it.each(dateien)("%s kennt kein Gewichtsfeld", (datei) => {
    const inhalt = readFileSync(srcOrdner + datei, "utf8");
    expect(inhalt).not.toMatch(/\b(koerpergewicht|gewicht_kg|weight)\b/i);
  });
});
