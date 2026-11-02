// Pflege-Lauf: 24-Monats-Löschung mit Erinnerung, Aufräumen. Erfundene Testdaten, werden aufgeräumt.

import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { identityDb } from "../app/kundin/datenbanken.server";
import { erinnereUndLoesche, raeumeAuf } from "../app/kundin/pflege.server";
import { verschluessele } from "../app/lib/krypto.server";

// Echtes Datum: Der Lauf gilt für die ganze lokale Datenbank, andere Testdaten dürfen nicht „alt“ wirken.
const JETZT = new Date();
const tage = (n: number) => new Date(JETZT.getTime() - n * 24 * 3600 * 1000);
const PREFIX = "pflege-test-";
const email = (n: string) => `${PREFIX}${n}@test.invalid`;

async function kundin(name: string, letzteAktivitaet: Date, erinnertAm: Date | null = null) {
  await identityDb.kundin.create({
    data: { id: `${PREFIX}${name}`, emailVerschluesselt: verschluessele(email(name), "OX_SCHLUESSEL_IDENTITY"), emailHash: `${PREFIX}${name}`, letzteAktivitaet, erinnertAm },
  });
}

async function aufraeumen() {
  await identityDb.kundin.deleteMany({ where: { id: { startsWith: PREFIX } } });
  await identityDb.entwicklungsMail.deleteMany({ where: { an: { startsWith: PREFIX } } });
  await identityDb.loginCode.deleteMany({ where: { emailHash: { startsWith: PREFIX } } });
}

const gibt = (name: string) => identityDb.kundin.count({ where: { id: `${PREFIX}${name}` } });

beforeEach(aufraeumen);
afterAll(aufraeumen);

describe("Löschung nach 24 Monaten", () => {
  it("aktive Kundin bleibt unberührt", async () => {
    await kundin("aktiv", tage(100));
    await erinnereUndLoesche(JETZT);
    expect(await gibt("aktiv")).toBe(1);
    expect(await identityDb.entwicklungsMail.count({ where: { an: email("aktiv") } })).toBe(0);
  });

  it("30 Tage vor Ablauf kommt die Erinnerung, gelöscht wird noch nicht", async () => {
    await kundin("bald", tage(712));
    await erinnereUndLoesche(JETZT);
    expect(await gibt("bald")).toBe(1);
    const mail = await identityDb.entwicklungsMail.findFirstOrThrow({ where: { an: email("bald") } });
    const termin = new Date(JETZT.getTime() + 30 * 24 * 3600 * 1000);
    expect(mail.text).toContain(termin.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" }));
    expect((await identityDb.kundin.findUniqueOrThrow({ where: { id: `${PREFIX}bald` } })).erinnertAm).not.toBeNull();
  });

  it("erinnert nur einmal", async () => {
    await kundin("einmal", tage(712));
    await erinnereUndLoesche(JETZT);
    await erinnereUndLoesche(JETZT);
    expect(await identityDb.entwicklungsMail.count({ where: { an: email("einmal") } })).toBe(1);
  });

  it("löscht erst, wenn die Erinnerung mindestens 30 Tage her ist", async () => {
    await kundin("faellig", tage(800), tage(31));
    await kundin("zu-frisch", tage(800), tage(5));
    await erinnereUndLoesche(JETZT);
    expect(await gibt("faellig")).toBe(0);
    expect(await gibt("zu-frisch")).toBe(1);
  });

  it("ohne Erinnerung wird nie gelöscht, sondern zuerst erinnert", async () => {
    await kundin("nie-erinnert", tage(900));
    const lauf = await erinnereUndLoesche(JETZT);
    expect(lauf).toMatchObject({ erinnert: 1, geloescht: 0 });
    expect(await gibt("nie-erinnert")).toBe(1);
  });
});

describe("Aufräumen", () => {
  it("entfernt abgelaufene Codes, behält frische", async () => {
    // Echtes Datum: raeumeAuf gilt für die ganze lokale Datenbank.
    const jetzt = Date.now();
    await identityDb.loginCode.createMany({
      data: [
        { emailHash: `${PREFIX}alt`, codeHash: "x", gueltigBis: new Date(jetzt - 3 * 24 * 3600 * 1000) },
        { emailHash: `${PREFIX}neu`, codeHash: "x", gueltigBis: new Date(jetzt + 600000) },
      ],
    });
    await raeumeAuf();
    expect(await identityDb.loginCode.count({ where: { emailHash: `${PREFIX}alt` } })).toBe(0);
    expect(await identityDb.loginCode.count({ where: { emailHash: `${PREFIX}neu` } })).toBe(1);
  });
});
