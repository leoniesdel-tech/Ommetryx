// Messbuch-Fotos prüfen und von Standortdaten befreien.
// Die Bildpunkte bleiben Byte für Byte gleich, denn das Vermessungsprogramm braucht das Original.
// Entfernt werden nur GPS-Angaben und was hinter dem Bild hängt (z. B. das Video von Live-Fotos).
// Lässt sich eine Datei nicht sicher lesen, wird sie abgelehnt: Dann wäre auch der Standort nicht sicher entfernt.

import { crc32 } from "node:zlib";

export interface GeprueftesFoto {
  daten: Buffer;
  typ: "image/jpeg" | "image/png";
  endung: "jpg" | "png";
  breite: number;
  hoehe: number;
  kamera: string | null;
}

export type FotoPruefung = { ok: true; foto: GeprueftesFoto } | { ok: false; grund: "format" | "kaputt" };

const TAG_HERSTELLER = 0x010f;
const TAG_MODELL = 0x0110;
const TAG_GPS = 0x8825;
/** Bytes je Wert, nach TIFF-Datentyp. */
const TYP_BYTES: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 };
const MAX_IFDS = 8;

class Kaputt extends Error {}

/** Entfernt die GPS-Angaben aus einem TIFF-Block (Exif) im Puffer und liest Hersteller und Modell. */
function bereinigeTiff(b: Buffer, start: number, ende: number): string | null {
  if (ende - start < 8) throw new Kaputt();
  const reihenfolge = b.toString("latin1", start, start + 2);
  if (reihenfolge !== "II" && reihenfolge !== "MM") throw new Kaputt();
  const klein = reihenfolge === "II";

  const pruefe = (stelle: number, laenge: number) => {
    if (stelle < start || stelle + laenge > ende) throw new Kaputt();
  };
  const u16 = (stelle: number) => {
    pruefe(stelle, 2);
    return klein ? b.readUInt16LE(stelle) : b.readUInt16BE(stelle);
  };
  const u32 = (stelle: number) => {
    pruefe(stelle, 4);
    return klein ? b.readUInt32LE(stelle) : b.readUInt32BE(stelle);
  };
  const setzeU16 = (stelle: number, wert: number) => {
    if (klein) b.writeUInt16LE(wert, stelle);
    else b.writeUInt16BE(wert, stelle);
  };

  /** Stelle und Länge des Werts eines Eintrags: bis 4 Bytes liegt er im Eintrag selbst. */
  const wert = (eintrag: number) => {
    const je = TYP_BYTES[u16(eintrag + 2)];
    if (!je) throw new Kaputt();
    const laenge = je * u32(eintrag + 4);
    const stelle = laenge <= 4 ? eintrag + 8 : start + u32(eintrag + 8);
    pruefe(stelle, laenge);
    return { stelle, laenge };
  };

  const loescheGps = (gps: number) => {
    const anzahl = u16(gps);
    pruefe(gps, 2 + 12 * anzahl + 4);
    for (let i = 0; i < anzahl; i++) {
      const eintrag = gps + 2 + 12 * i;
      const { stelle, laenge } = wert(eintrag);
      if (laenge > 4) b.fill(0, stelle, stelle + laenge);
    }
    b.fill(0, gps, gps + 2 + 12 * anzahl + 4);
  };

  if (u16(start + 2) !== 42) throw new Kaputt();

  const texte: Record<number, string> = {};
  let ifd = u32(start + 4);
  for (let runde = 0; ifd !== 0; runde++) {
    if (runde >= MAX_IFDS) throw new Kaputt();
    const kopf = start + ifd;
    const anzahl = u16(kopf);
    pruefe(kopf, 2 + 12 * anzahl + 4);
    let gpsEintrag = -1;
    for (let i = 0; i < anzahl; i++) {
      const eintrag = kopf + 2 + 12 * i;
      const tag = u16(eintrag);
      if (tag === TAG_GPS) gpsEintrag = i;
      if (runde === 0 && (tag === TAG_HERSTELLER || tag === TAG_MODELL)) {
        const { stelle, laenge } = wert(eintrag);
        texte[tag] = b.toString("latin1", stelle, stelle + laenge).replace(/\0.*$/s, "").trim();
      }
    }
    const naechstes = u32(kopf + 2 + 12 * anzahl);
    if (gpsEintrag >= 0) {
      const eintrag = kopf + 2 + 12 * gpsEintrag;
      const gps = u32(eintrag + 8);
      if (gps !== 0) loescheGps(start + gps);
      // Eintrag aus der Liste nehmen: Der Rest rückt nach, die Daten dahinter bleiben, wo sie sind.
      b.copyWithin(eintrag, eintrag + 12, kopf + 2 + 12 * anzahl + 4);
      b.fill(0, kopf + 2 + 12 * anzahl + 4 - 12, kopf + 2 + 12 * anzahl + 4);
      setzeU16(kopf, anzahl - 1);
    }
    ifd = naechstes;
  }

  const hersteller = texte[TAG_HERSTELLER] ?? "";
  const modell = texte[TAG_MODELL] ?? "";
  // Manche Hersteller wiederholen sich im Modell: „Apple iPhone 15“, aber nicht „samsung samsung SM-S918B“.
  const kamera = modell.toLowerCase().startsWith(hersteller.toLowerCase()) ? modell : `${hersteller} ${modell}`.trim();
  return kamera ? kamera.slice(0, 120) : null;
}

const EXIF_KOPF = Buffer.from("Exif\0\0", "latin1");

function pruefeJpeg(eingang: Buffer): GeprueftesFoto {
  const b = Buffer.from(eingang);
  const entfernen: [number, number][] = [];
  let breite = 0;
  let hoehe = 0;
  let kamera: string | null = null;
  let bildEnde = -1;
  let pos = 2;

  while (bildEnde < 0) {
    if (pos + 2 > b.length || b[pos] !== 0xff) throw new Kaputt();
    const marke = b[pos + 1]!;
    if (marke === 0xff) {
      pos += 1; // Füllbyte
    } else if (marke === 0xd9) {
      bildEnde = pos + 2;
    } else if (marke === 0x01 || (marke >= 0xd0 && marke <= 0xd7)) {
      pos += 2;
    } else {
      if (pos + 4 > b.length) throw new Kaputt();
      const laenge = b.readUInt16BE(pos + 2);
      const inhalt = pos + 4;
      const ende = pos + 2 + laenge;
      if (laenge < 2 || ende > b.length) throw new Kaputt();

      if (marke === 0xe1) {
        if (b.subarray(inhalt, inhalt + 6).equals(EXIF_KOPF)) kamera = bereinigeTiff(b, inhalt + 6, ende) ?? kamera;
        else if (b.toString("latin1", inhalt, ende).includes("GPS")) entfernen.push([pos, ende]); // XMP mit Standort
      } else if (marke >= 0xc0 && marke <= 0xcf && marke !== 0xc4 && marke !== 0xc8 && marke !== 0xcc) {
        if (ende - inhalt < 5) throw new Kaputt();
        hoehe = b.readUInt16BE(inhalt + 1);
        breite = b.readUInt16BE(inhalt + 3);
      }

      pos = ende;
      if (marke === 0xda) {
        // Bilddaten: laufen bis zur nächsten echten Marke.
        for (;;) {
          pos = b.indexOf(0xff, pos);
          if (pos < 0 || pos + 1 >= b.length) throw new Kaputt();
          const folgt = b[pos + 1]!;
          if (folgt === 0x00 || (folgt >= 0xd0 && folgt <= 0xd7)) pos += 2;
          else if (folgt === 0xff) pos += 1;
          else break;
        }
      }
    }
  }
  if (!breite || !hoehe) throw new Kaputt();

  const teile: Buffer[] = [];
  let stelle = 0;
  for (const [von, bis] of entfernen) {
    teile.push(b.subarray(stelle, von));
    stelle = bis;
  }
  teile.push(b.subarray(stelle, bildEnde));
  return { daten: Buffer.concat(teile), typ: "image/jpeg", endung: "jpg", breite, hoehe, kamera };
}

const PNG_KOPF = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function pruefePng(eingang: Buffer): GeprueftesFoto {
  const b = Buffer.from(eingang);
  const teile: Buffer[] = [PNG_KOPF];
  let breite = 0;
  let hoehe = 0;
  let kamera: string | null = null;
  let fertig = false;
  let pos = PNG_KOPF.length;

  while (!fertig) {
    if (pos + 12 > b.length) throw new Kaputt();
    const laenge = b.readUInt32BE(pos);
    const art = b.toString("latin1", pos + 4, pos + 8);
    const inhalt = pos + 8;
    const ende = inhalt + laenge + 4;
    if (ende > b.length) throw new Kaputt();

    if (art === "IHDR") {
      if (laenge < 8) throw new Kaputt();
      breite = b.readUInt32BE(inhalt);
      hoehe = b.readUInt32BE(inhalt + 4);
    } else if (art === "eXIf") {
      kamera = bereinigeTiff(b, inhalt, inhalt + laenge);
      b.writeUInt32BE(crc32(b.subarray(pos + 4, inhalt + laenge)), inhalt + laenge);
    } else if (art === "IEND") {
      fertig = true;
    }
    // Textblöcke können XMP mit Standort enthalten, auch gepackt: Sie fallen ganz weg.
    if (art !== "tEXt" && art !== "zTXt" && art !== "iTXt") teile.push(b.subarray(pos, ende));
    pos = ende;
  }
  if (!breite || !hoehe) throw new Kaputt();
  return { daten: Buffer.concat(teile), typ: "image/png", endung: "png", breite, hoehe, kamera };
}

export function pruefeFoto(eingang: Buffer): FotoPruefung {
  const istJpeg = eingang.length > 3 && eingang[0] === 0xff && eingang[1] === 0xd8 && eingang[2] === 0xff;
  const istPng = eingang.subarray(0, PNG_KOPF.length).equals(PNG_KOPF);
  if (!istJpeg && !istPng) return { ok: false, grund: "format" };
  try {
    return { ok: true, foto: istJpeg ? pruefeJpeg(eingang) : pruefePng(eingang) };
  } catch (fehler) {
    if (fehler instanceof Kaputt || fehler instanceof RangeError) return { ok: false, grund: "kaputt" };
    throw fehler;
  }
}
