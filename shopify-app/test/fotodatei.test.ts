// Fotos prüfen und GPS entfernen. Die Testbilder werden Byte für Byte zusammengesetzt, die Angaben sind erfunden.

import { crc32 } from "node:zlib";
import { describe, expect, it } from "vitest";
import { pruefeFoto } from "../app/intern/fotodatei.server";

const ORT = "ERFUNDENER-ORT";

/** TIFF mit Hersteller, Modell und GPS-Block. Breitengrad liegt außerhalb des Eintrags, wie bei echten Fotos. */
function tiff(klein: boolean, mitGps = true): Buffer {
  const b = Buffer.alloc(200);
  const u16 = (w: number, s: number) => (klein ? b.writeUInt16LE(w, s) : b.writeUInt16BE(w, s));
  const u32 = (w: number, s: number) => (klein ? b.writeUInt32LE(w, s) : b.writeUInt32BE(w, s));
  b.write(klein ? "II" : "MM", 0, "latin1");
  u16(42, 2);
  u32(8, 4);

  const eintraege = mitGps ? 3 : 2;
  u16(eintraege, 8);
  const eintrag = (i: number, tag: number, typ: number, anzahl: number, wert: number) => {
    const s = 10 + 12 * i;
    u16(tag, s);
    u16(typ, s + 2);
    u32(anzahl, s + 4);
    u32(wert, s + 8);
  };
  eintrag(0, 0x010f, 2, 6, 100);
  eintrag(1, 0x0110, 2, 10, 110);
  if (mitGps) eintrag(2, 0x8825, 4, 1, 130);
  u32(0, 10 + 12 * eintraege);
  b.write("Apple\0", 100, "latin1");
  b.write("iPhone 15\0", 110, "latin1");

  if (mitGps) {
    u16(2, 130);
    const gps = (i: number, tag: number, typ: number, anzahl: number, wert: number) => {
      const s = 132 + 12 * i;
      u16(tag, s);
      u16(typ, s + 2);
      u32(anzahl, s + 4);
      u32(wert, s + 8);
    };
    gps(0, 1, 2, 2, 0);
    gps(1, 2, 2, ORT.length, 170);
    b.write(ORT, 170, "latin1");
  }
  return b;
}

const segment = (marke: number, inhalt: Buffer) => {
  const kopf = Buffer.from([0xff, marke, 0, 0]);
  kopf.writeUInt16BE(inhalt.length + 2, 2);
  return Buffer.concat([kopf, inhalt]);
};

const SOF = Buffer.from([8, 0x0b, 0xb8, 0x0f, 0xa0, 3, 1, 0x22, 0, 2, 0x11, 1, 3, 0x11, 1]); // 3000 hoch, 4000 breit
const SCAN_KOPF = Buffer.from([1, 1, 0, 0, 0x3f, 0]);
const BILD = Buffer.from([0x12, 0xff, 0x00, 0x34, 0xff, 0xd0, 0x56, 0x78]);
const ENDE = Buffer.from([0xff, 0xd9]);

function jpeg(...vorBild: Buffer[]) {
  return Buffer.concat([Buffer.from([0xff, 0xd8]), ...vorBild, segment(0xc0, SOF), segment(0xda, SCAN_KOPF), BILD, ENDE]);
}

const exif = (t: Buffer) => segment(0xe1, Buffer.concat([Buffer.from("Exif\0\0", "latin1"), t]));

function pngBlock(art: string, inhalt: Buffer) {
  const kopf = Buffer.alloc(4);
  kopf.writeUInt32BE(inhalt.length);
  const name = Buffer.from(art, "latin1");
  const summe = Buffer.alloc(4);
  summe.writeUInt32BE(crc32(Buffer.concat([name, inhalt])));
  return Buffer.concat([kopf, name, inhalt, summe]);
}

function png(...bloecke: Buffer[]) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(800, 0);
  ihdr.writeUInt32BE(600, 4);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngBlock("IHDR", ihdr),
    ...bloecke,
    pngBlock("IDAT", Buffer.from([1, 2, 3])),
    pngBlock("IEND", Buffer.alloc(0)),
  ]);
}

function fertig(eingang: Buffer) {
  const p = pruefeFoto(eingang);
  if (!p.ok) throw new Error(p.grund);
  return p.foto;
}

describe("JPEG", () => {
  for (const klein of [true, false]) {
    it(`entfernt GPS und behält das Handy-Modell (${klein ? "Intel" : "Motorola"}-Reihenfolge)`, () => {
      const f = fertig(jpeg(exif(tiff(klein))));
      expect(f.typ).toBe("image/jpeg");
      expect(f.daten.toString("latin1")).not.toContain(ORT);
      expect(f.kamera).toBe("Apple iPhone 15");
      expect([f.breite, f.hoehe]).toEqual([4000, 3000]);
    });

    it(`der GPS-Eintrag verschwindet, eine zweite Prüfung liest die Datei sauber (${klein ? "Intel" : "Motorola"})`, () => {
      const einmal = fertig(jpeg(exif(tiff(klein))));
      const zweimal = fertig(einmal.daten);
      expect(zweimal.daten.equals(einmal.daten)).toBe(true);
      const stelle = einmal.daten.indexOf("Exif\0\0", 0, "latin1") + 6;
      const anzahl = klein ? einmal.daten.readUInt16LE(stelle + 8) : einmal.daten.readUInt16BE(stelle + 8);
      expect(anzahl).toBe(2);
    });
  }

  it("die Bilddaten bleiben Byte für Byte gleich", () => {
    expect(fertig(jpeg(exif(tiff(true)))).daten.includes(BILD)).toBe(true);
    const ohneGps = jpeg(exif(tiff(true, false)));
    expect(fertig(ohneGps).daten.equals(ohneGps)).toBe(true);
  });

  it("entfernt XMP mit Standort, behält XMP ohne", () => {
    const mit = segment(0xe1, Buffer.from(`http://ns.adobe.com/xap/1.0/\0<exif:GPSLatitude>${ORT}`, "latin1"));
    const ohne = segment(0xe1, Buffer.from("http://ns.adobe.com/xap/1.0/\0<xmp:Rating>5", "latin1"));
    expect(fertig(jpeg(mit)).daten.toString("latin1")).not.toContain(ORT);
    expect(fertig(jpeg(ohne)).daten.toString("latin1")).toContain("Rating");
  });

  it("schneidet ab, was hinter dem Bild hängt", () => {
    const f = fertig(Buffer.concat([jpeg(), Buffer.from(`Video mit ${ORT}`, "latin1")]));
    expect(f.daten.toString("latin1")).not.toContain(ORT);
    expect(f.daten.subarray(-2).equals(ENDE)).toBe(true);
  });

  it("lehnt abgeschnittene Dateien und kaputte Exif-Daten ab", () => {
    expect(pruefeFoto(jpeg().subarray(0, 30))).toEqual({ ok: false, grund: "kaputt" });
    const verbogen = tiff(true);
    verbogen.writeUInt32LE(99999, 10 + 12 * 2 + 8); // GPS zeigt ins Leere
    expect(pruefeFoto(jpeg(exif(verbogen)))).toEqual({ ok: false, grund: "kaputt" });
  });
});

describe("PNG", () => {
  it("entfernt GPS aus Exif, die Prüfsumme stimmt danach", () => {
    const f = fertig(png(pngBlock("eXIf", tiff(true))));
    expect(f.typ).toBe("image/png");
    expect(f.daten.toString("latin1")).not.toContain(ORT);
    expect(f.kamera).toBe("Apple iPhone 15");
    expect([f.breite, f.hoehe]).toEqual([800, 600]);

    const stelle = f.daten.indexOf("eXIf", 0, "latin1");
    const laenge = f.daten.readUInt32BE(stelle - 4);
    expect(f.daten.readUInt32BE(stelle + 4 + laenge)).toBe(crc32(f.daten.subarray(stelle, stelle + 4 + laenge)));
  });

  it("entfernt Textblöcke und alles hinter dem Bild", () => {
    const f = fertig(Buffer.concat([png(pngBlock("iTXt", Buffer.from(`XML:com.adobe.xmp ${ORT}`, "latin1"))), Buffer.from(ORT, "latin1")]));
    expect(f.daten.toString("latin1")).not.toContain(ORT);
  });

  it("lehnt abgeschnittene Dateien ab", () => {
    expect(pruefeFoto(png().subarray(0, 40))).toEqual({ ok: false, grund: "kaputt" });
  });
});

describe("Format", () => {
  it("lehnt alles ab, was kein JPEG oder PNG ist", () => {
    expect(pruefeFoto(Buffer.from("<html><script>alert(1)</script></html>"))).toEqual({ ok: false, grund: "format" });
    expect(pruefeFoto(Buffer.from([0, 0, 0, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63]))).toEqual({ ok: false, grund: "format" }); // HEIC
    expect(pruefeFoto(Buffer.alloc(0))).toEqual({ ok: false, grund: "format" });
  });
});
