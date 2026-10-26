// Kryptografie für den Team-Login. Nur Bausteine aus node:crypto.

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { entschluessele as entschluesseleMit, verschluessele as verschluesseleMit } from "../lib/krypto.server";

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

// Gemeinsame Bausteine; der Team-Bereich verschlüsselt mit INTERN_SCHLUESSEL.
export { sha256, zufallsToken } from "../lib/krypto.server";

export function verschluessele(klartext: string): string {
  return verschluesseleMit(klartext, "INTERN_SCHLUESSEL");
}

export function entschluessele(verschluesselt: string): string {
  return entschluesseleMit(verschluesselt, "INTERN_SCHLUESSEL");
}
