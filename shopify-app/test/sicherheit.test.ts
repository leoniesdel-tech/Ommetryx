// Sicherheits-Kopfzeilen für /intern und /mein.

import { describe, expect, it } from "vitest";
import { setzeSicherheitsKopfzeilen } from "../app/lib/sicherheit";

const kopf = (pfad: string) => {
  const h = new Headers();
  setzeSicherheitsKopfzeilen(pfad, h);
  return h;
};

describe("Sicherheits-Kopfzeilen", () => {
  it("/intern und /mein dürfen nicht eingebettet werden", () => {
    for (const pfad of ["/intern", "/intern/anmelden", "/mein", "/mein/daten"]) {
      expect(kopf(pfad).get("Content-Security-Policy")).toBe("frame-ancestors 'none'");
      expect(kopf(pfad).get("X-Frame-Options")).toBe("DENY");
      expect(kopf(pfad).get("Referrer-Policy")).toBe("no-referrer");
    }
  });

  it("die eingebettete App bleibt unberührt", () => {
    for (const pfad of ["/app", "/app/produkte", "/internet", "/meine", "/auth/login"]) {
      expect([...kopf(pfad).keys()]).toEqual([]);
    }
  });
});
