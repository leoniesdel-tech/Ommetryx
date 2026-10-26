// Widget: Eingabeprüfung und Größe der Dateien im Shop.

import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { alsZahl, pruefeEingaben, sicherheitInWorten } from "../widget/src/eingaben";

describe("Eingaben im Widget", () => {
  it("nimmt Komma und Punkt", () => {
    expect(alsZahl("92,5")).toBe(92.5);
    expect(alsZahl("92.5")).toBe(92.5);
    expect(alsZahl("")).toBeNull();
    expect(alsZahl("9x")).toBeNaN();
  });

  it("verlangt Körpergröße, Brust und Hüfte, die Taille nur wenn Pflicht", () => {
    expect(pruefeEingaben({ koerpergroesse: "168", brust: "96", huefte: "102" }, false)).toEqual({
      ok: true,
      koerper: { koerpergroesse: 168, brust: 96, huefte: 102 },
    });
    const ohneTaille = pruefeEingaben({ koerpergroesse: "168", brust: "96", huefte: "102" }, true);
    expect(ohneTaille.ok).toBe(false);
  });

  it("meldet unrealistische Werte, ohne den Wert zu wiederholen", () => {
    const e = pruefeEingaben({ koerpergroesse: "168", brust: "999", huefte: "102" }, false);
    expect(e.ok).toBe(false);
    if (e.ok) return;
    expect(e.fehler.brust).toBeDefined();
    expect(e.fehler.brust).not.toContain("999");
  });

  it("übersetzt die Sicherheit in Worte", () => {
    expect(sicherheitInWorten(100)).toBe("hoch");
    expect(sicherheitInWorten(70)).toBe("mittel");
    expect(sicherheitInWorten(40)).toBe("niedrig");
  });
});

describe("Ladezeit im Shop", () => {
  it("der Lader bleibt unter 10 KB", () => {
    expect(statSync("extensions/ommetryx-widget/assets/ommetryx-lader.js").size).toBeLessThan(10 * 1024);
  });

  it("Widget und Lader enthalten keine Konsolen-Ausgaben und kein sessionStorage", () => {
    for (const datei of ["extensions/ommetryx-widget/assets/ommetryx-lader.js", "widget/src/widget.ts", "widget/src/eingaben.ts"]) {
      const inhalt = readFileSync(datei, "utf8");
      expect(inhalt).not.toMatch(/console\.|sessionStorage/);
    }
  });

  it("localStorage nur für den Login-Token, nie für Maße oder E-Mail", () => {
    expect(readFileSync("extensions/ommetryx-widget/assets/ommetryx-lader.js", "utf8")).not.toMatch(/localStorage/);
    expect(readFileSync("widget/src/eingaben.ts", "utf8")).not.toMatch(/localStorage/);
    const widget = readFileSync("widget/src/widget.ts", "utf8");
    // Genau ein Schreibzugriff, und zwar mit dem festen Schlüssel für den Token.
    expect(widget.match(/localStorage\.setItem\(/g)).toHaveLength(1);
    expect(widget).toMatch(/localStorage\.setItem\(SPEICHER_SCHLUESSEL, token\)/);
  });
});
