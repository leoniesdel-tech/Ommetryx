// Kryptografie für den Team-Login. Nur Bausteine aus node:crypto.

import { createCipheriv, createDecipheriv, createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (passwort: string, salz: Buffer, laenge: number, optionen: object) => Promise<Buffer>;

// scrypt-Parameter (OWASP-Empfehlung: N = 2^17, r = 8, p = 1).
const SCRYPT = { N: 2 ** 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };
const HASH_LAENGE = 64;

/** Passwort-Hash im Format scrypt$N$r$p$salz$hash (base64). */
export async function hashePasswort(passwort: string): Promise<string> {
  const salz = randomBytes(16);
  const hash = await scryptAsync(passwort.normalize("NFKC"), salz, HASH_LAENGE, SCRYPT);
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, salz.toString("base64"), hash.toString("base64")].join("$");
}

export async function pruefePasswort(passwort: string, gespeichert: string): Promise<boolean> {
  const [verfahren, N, r, p, salz, hash] = gespeichert.split("$");
  if (verfahren !== "scrypt" || !N || !r || !p || !salz || !hash) return false;
  const erwartet = Buffer.from(hash, "base64");
  const berechnet = await scryptAsync(passwort.normalize("NFKC"), Buffer.from(salz, "base64"), erwartet.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
    maxmem: SCRYPT.maxmem,
  });
  return timingSafeEqual(berechnet, erwartet);
}

/** Gleich teure Rechnung wie pruefePasswort, wenn es das Konto nicht gibt (verrät nichts über die Laufzeit). */
let attrappe: string | undefined;
export async function pruefePasswortAttrappe(passwort: string): Promise<false> {
  attrappe ??= await hashePasswort(randomBytes(16).toString("hex"));
  await pruefePasswort(passwort, attrappe);
  return false;
}

export function zufallsToken(): string {
  return randomBytes(32).toString("base64url");
}

export function sha256(wert: string): string {
  return createHash("sha256").update(wert).digest("base64url");
}

function schluessel(): Buffer {
  if (!process.env.INTERN_SCHLUESSEL) {
    // Lokale Entwicklung: .env nachladen, falls die Umgebung sie nicht schon gesetzt hat.
    try {
      process.loadEnvFile(".env");
    } catch {
      // keine .env vorhanden
    }
  }
  const roh = process.env.INTERN_SCHLUESSEL;
  const key = roh ? Buffer.from(roh, "base64") : undefined;
  if (!key || key.length !== 32) throw new Error("INTERN_SCHLUESSEL fehlt oder hat nicht 32 Byte");
  return key;
}

/** AES-256-GCM, Ergebnis: iv.tag.daten (base64url). */
export function verschluessele(klartext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", schluessel(), iv);
  const daten = Buffer.concat([cipher.update(klartext, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), daten].map((b) => b.toString("base64url")).join(".");
}

export function entschluessele(verschluesselt: string): string {
  const [iv, tag, daten] = verschluesselt.split(".").map((t) => Buffer.from(t, "base64url"));
  if (!iv || !tag || !daten) throw new Error("Verschlüsselter Wert hat ein falsches Format");
  const decipher = createDecipheriv("aes-256-gcm", schluessel(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(daten), decipher.final()]).toString("utf8");
}
