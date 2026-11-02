// Messbuch: Prüfung, Speichern, Filter. Erfundene Testdaten, werden danach aufgeräumt.

import { existsSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { standardKonfiguration } from "@ommetryx/empfehlung";
import type { GeprueftesFoto } from "../app/intern/fotodatei.server";
import { pruefeMessArtikel } from "../app/intern/messbuch";
import type { MessDaten } from "../app/intern/messbuch";
import { ladeMessArtikel, ladeMessFoto, ladeMessListe, loescheMessArtikel, loescheMessFoto, speichereMessArtikel, speichereMessFoto } from "../app/intern/messbuch.server";

const db = new PrismaClient();
const k = standardKonfiguration();
const SHOP = "Messbuch-Testshop-Erfunden";
let teamA = 0;
let teamB = 0;
const fotoOrdner = mkdtempSync(path.join(tmpdir(), "ox-fotos-"));
const dateien = () => readdirSync(fotoOrdner);
const testFoto = (kamera: string | null = "Erfundenes Handy"): GeprueftesFoto => ({
  daten: Buffer.from([1, 2, 3]),
  typ: "image/jpeg",
  endung: "jpg",
  breite: 4000,
  hoehe: 3000,
  kamera,
});

function formular(aenderung: Record<string, string> = {}, groessen = [["38", "50"], ["40", "52,5"]]) {
  const f = new FormData();
  const werte: Record<string, string> = {
    herkunft: "eigen",
    online_shop: SHOP,
    produktname: "Erfundene Bluse",
    marke: "Erfundene Marke",
    link: "https://shop.example/bluse",
    artikelart: "web_oberteil",
    schnitt: "regulaer",
    material_zusammensetzung: "97 % Baumwolle, 3 % Elastan",
    anzahl_groessen: String(groessen.length),
    ...aenderung,
  };
  for (const [name, wert] of Object.entries(werte)) f.set(name, wert);
  groessen.forEach(([g, brust], i) => {
    f.set(`g${i}_groesse`, g!);
    f.set(`g${i}_brust`, brust!);
  });
  return f;
}

function daten(aenderung?: Record<string, string>, groessen?: string[][]): MessDaten {
  const p = pruefeMessArtikel(formular(aenderung, groessen), k);
  if (!p.ok) throw new Error(JSON.stringify(p.fehler));
  return p.daten;
}

beforeAll(async () => {
  process.env.OX_FOTO_ORDNER = fotoOrdner;
  await db.messArtikel.deleteMany({ where: { onlineShop: { startsWith: "Messbuch-Testshop" } } });
  await db.teamMitglied.deleteMany({ where: { email: { endsWith: "@messbuch.test.invalid" } } });
  teamA = (await db.teamMitglied.create({ data: { email: "a@messbuch.test.invalid", name: "Erfunden A" } })).id;
  teamB = (await db.teamMitglied.create({ data: { email: "b@messbuch.test.invalid", name: "Erfunden B" } })).id;
});

afterAll(async () => {
  await db.messArtikel.deleteMany({ where: { onlineShop: { startsWith: "Messbuch-Testshop" } } });
  await db.teamMitglied.deleteMany({ where: { email: { endsWith: "@messbuch.test.invalid" } } });
  await db.$disconnect();
  rmSync(fotoOrdner, { recursive: true, force: true });
});

describe("Prüfung", () => {
  it("rechnet Flachmaße × 2, Komma erlaubt", () => {
    expect(daten().artikel.groessen.map((g) => g.masse.brust)).toEqual([100, 105]);
  });

  it("verlangt Shop, Produktname, Herkunft und eine Größe", () => {
    const p = pruefeMessArtikel(formular({ online_shop: "", produktname: " ", herkunft: "quatsch" }, []), k);
    expect(p.ok).toBe(false);
    if (!p.ok) expect(Object.keys(p.fehler)).toEqual(expect.arrayContaining(["online_shop", "produktname", "herkunft", "groessen"]));
    if (!p.ok) expect(p.fehler.groessen).toBe("Bitte mindestens eine Größe hinzufügen.");
  });

  it("lehnt doppelte Größen und kaputte Links ab", () => {
    const p = pruefeMessArtikel(formular({ link: "javascript:alert(1)" }, [["M", "50"], ["m", "52"]]), k);
    expect(p.ok).toBe(false);
    if (!p.ok) expect(Object.keys(p.fehler)).toEqual(expect.arrayContaining(["link", "g1_groesse"]));
  });

  it("Dehnung ist freiwillig, das Material Pflicht", () => {
    expect(daten().dehnung).toBeNull();
    expect(daten({ material_dehnung_prozent: "15" }).dehnung).toBe(15);
    const p = pruefeMessArtikel(formular({ material_zusammensetzung: " " }), k);
    expect(p.ok).toBe(false);
    if (!p.ok) expect(Object.keys(p.fehler)).toEqual(["material_zusammensetzung"]);
    expect(pruefeMessArtikel(formular({ material_dehnung_prozent: "viel" }), k).ok).toBe(false);
  });

  it("nutzt die Plausibilität der Erfassung", () => {
    const p = pruefeMessArtikel(formular({}, [["38", "500"]]), k);
    expect(p.ok).toBe(false);
  });
});

describe("Speichern", () => {
  it("legt an und zeigt, wer gemessen hat", async () => {
    const id = await speichereMessArtikel(null, daten(), teamA);
    const a = await ladeMessArtikel(id);
    expect(a?.materialDehnungProzent).toBeNull();
    expect(a?.materialZusammensetzung).toBe("97 % Baumwolle, 3 % Elastan");
    expect(a?.groessen.map((g) => [g.groesse, g.brust, g.gemessenVon?.name])).toEqual([
      ["38", 100, "Erfunden A"],
      ["40", 105, "Erfunden A"],
    ]);
  });

  it("ändert: gleiche Größe behält ihre Nummer, „gemessen von“ nur bei geänderten Maßen", async () => {
    const id = await speichereMessArtikel(null, daten({ produktname: "Änderungs-Test" }), teamA);
    const vorher = (await ladeMessArtikel(id))!;
    await speichereMessArtikel(id, daten({ produktname: "Änderungs-Test" }, [["38", "50"], ["40", "53"], ["42", "55"]]), teamB);
    const nachher = (await ladeMessArtikel(id))!;
    expect(nachher.groessen.map((g) => g.groesse)).toEqual(["38", "40", "42"]);
    expect(nachher.groessen[0]!.id).toBe(vorher.groessen[0]!.id);
    expect(nachher.groessen[1]!.id).toBe(vorher.groessen[1]!.id);
    expect(nachher.groessen.map((g) => g.gemessenVon?.name)).toEqual(["Erfunden A", "Erfunden B", "Erfunden B"]);
  });

  it("entfernte Größen verschwinden", async () => {
    const id = await speichereMessArtikel(null, daten({ produktname: "Entfernen-Test" }), teamA);
    await speichereMessArtikel(id, daten({ produktname: "Entfernen-Test" }, [["40", "52,5"]]), teamA);
    expect((await ladeMessArtikel(id))!.groessen.map((g) => g.groesse)).toEqual(["40"]);
  });

  it("löscht mit allen Größen", async () => {
    const id = await speichereMessArtikel(null, daten({ produktname: "Lösch-Test" }), teamA);
    await loescheMessArtikel(id);
    expect(await ladeMessArtikel(id)).toBeNull();
    expect(await db.messGroesse.count({ where: { artikelId: id } })).toBe(0);
  });
});

describe("Fotos", () => {
  async function teilMitFoto(name: string) {
    const id = await speichereMessArtikel(null, daten({ produktname: name }), teamA);
    const groesse = (await ladeMessArtikel(id))!.groessen[0]!;
    expect(await speichereMessFoto(id, groesse.id, testFoto())).toBe(true);
    return { id, groesseId: groesse.id };
  }

  it("speichert Angaben und Datei, Ersetzen entfernt die alte Datei", async () => {
    const { groesseId, id } = await teilMitFoto("Foto-Ersetzen");
    const alt = (await ladeMessFoto(groesseId))!;
    expect(alt.kamera).toBe("Erfundenes Handy");
    expect(existsSync(path.join(fotoOrdner, alt.datei))).toBe(true);

    await speichereMessFoto(id, groesseId, testFoto(null));
    const neu = (await ladeMessFoto(groesseId))!;
    expect(neu.datei).not.toBe(alt.datei);
    expect(neu.kamera).toBeNull();
    expect(existsSync(path.join(fotoOrdner, alt.datei))).toBe(false);
    expect(existsSync(path.join(fotoOrdner, neu.datei))).toBe(true);
  });

  it("nimmt kein Foto für die Größe eines anderen Teils an", async () => {
    const eins = await teilMitFoto("Foto-Fremd-Eins");
    const zwei = await teilMitFoto("Foto-Fremd-Zwei");
    const vorher = dateien().length;
    expect(await speichereMessFoto(eins.id, zwei.groesseId, testFoto())).toBe(false);
    await loescheMessFoto(eins.id, zwei.groesseId);
    expect(await ladeMessFoto(zwei.groesseId)).not.toBeNull();
    expect(dateien()).toHaveLength(vorher);
  });

  it("Löschen entfernt Eintrag und Datei", async () => {
    const { id, groesseId } = await teilMitFoto("Foto-Löschen");
    const { datei } = (await ladeMessFoto(groesseId))!;
    await loescheMessFoto(id, groesseId);
    expect(await ladeMessFoto(groesseId)).toBeNull();
    expect(existsSync(path.join(fotoOrdner, datei))).toBe(false);
  });

  it("eine entfernte Größe nimmt ihre Datei mit, Maß-Änderungen lassen das Foto stehen", async () => {
    const { id, groesseId } = await teilMitFoto("Foto-Größe");
    const { datei } = (await ladeMessFoto(groesseId))!;
    await speichereMessArtikel(id, daten({ produktname: "Foto-Größe" }, [["38", "51"], ["40", "53"]]), teamA);
    expect((await ladeMessFoto(groesseId))?.datei).toBe(datei);
    await speichereMessArtikel(id, daten({ produktname: "Foto-Größe" }, [["40", "53"]]), teamA);
    expect(await ladeMessFoto(groesseId)).toBeNull();
    expect(existsSync(path.join(fotoOrdner, datei))).toBe(false);
  });

  it("ein gelöschtes Teil nimmt seine Dateien mit", async () => {
    const { id, groesseId } = await teilMitFoto("Foto-Teil-Löschen");
    const { datei } = (await ladeMessFoto(groesseId))!;
    await loescheMessArtikel(id);
    expect(existsSync(path.join(fotoOrdner, datei))).toBe(false);
  });

  it("die Liste zeigt, welche Größen ein Foto haben", async () => {
    await teilMitFoto("Foto-Liste");
    const { artikel } = await ladeMessListe({ suche: "Foto-Liste" });
    expect(artikel[0]!.groessen.map((g) => Boolean(g.foto))).toEqual([true, false]);
  });
});

describe("Liste", () => {
  it("filtert nach Shop, Größe, Kategorie und Suche", async () => {
    await speichereMessArtikel(null, daten({ online_shop: "Messbuch-Testshop-Zwei", produktname: "Suchbares Kleid" }, [["XS", "45"]]), teamA);
    const shop = await ladeMessListe({ shop: "Messbuch-Testshop-Zwei" });
    expect(shop.artikel.map((a) => a.produktname)).toEqual(["Suchbares Kleid"]);
    expect((await ladeMessListe({ groesse: "XS", shop: "Messbuch-Testshop-Zwei" })).gesamt).toBe(1);
    expect((await ladeMessListe({ groesse: "XL", shop: "Messbuch-Testshop-Zwei" })).gesamt).toBe(0);
    expect((await ladeMessListe({ suche: "suchbares" })).gesamt).toBe(1);
    expect((await ladeMessListe({ kategorie: "gibt-es-nicht" })).gesamt).toBe(0);
    expect(shop.optionen.shops).toContain("Messbuch-Testshop-Zwei");
    expect(shop.optionen.groessen).toContain("XS");
  });
});
