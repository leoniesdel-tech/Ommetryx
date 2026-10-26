// Gemeinsame Kryptografie: AES-256-GCM mit benannten Schlüsseln aus .env, HMAC, Zufallstoken.
// Schlüssel (je 32 Byte, base64): INTERN_SCHLUESSEL, OX_SCHLUESSEL_IDENTITY, OX_SCHLUESSEL_BODY, OX_HASH_SCHLUESSEL.

import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt } from "node:crypto";

export type SchluesselName = "INTERN_SCHLUESSEL" | "OX_SCHLUESSEL_IDENTITY" | "OX_SCHLUESSEL_BODY" | "OX_HASH_SCHLUESSEL";

let envGeladen = false;

function schluessel(name: SchluesselName): Buffer {
  if (!process.env[name] && !envGeladen) {
    envGeladen = true;
    try {
      process.loadEnvFile(".env");
    } catch {
      // keine .env vorhanden (z. B. auf dem Server, dort kommen die Werte aus der Umgebung)
    }
  }
  const roh = process.env[name];
  const key = roh ? Buffer.from(roh, "base64") : undefined;
  if (!key || key.length !== 32) throw new Error(`${name} fehlt oder hat nicht 32 Byte`);
  return key;
}

/** AES-256-GCM, Ergebnis: iv.tag.daten (base64url). */
export function verschluessele(klartext: string, name: SchluesselName): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", schluessel(name), iv);
  const daten = Buffer.concat([cipher.update(klartext, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), daten].map((b) => b.toString("base64url")).join(".");
}

export function entschluessele(verschluesselt: string, name: SchluesselName): string {
  const [iv, tag, daten] = verschluesselt.split(".").map((t) => Buffer.from(t, "base64url"));
  if (!iv || !tag || !daten) throw new Error("Verschlüsselter Wert hat ein falsches Format");
  const decipher = createDecipheriv("aes-256-gcm", schluessel(name), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(daten), decipher.final()]).toString("utf8");
}

/** HMAC-SHA256 mit geheimem Schlüssel: zum Suchen (E-Mail) und für Codes, nicht rückrechenbar ohne Schlüssel. */
export function hmac(wert: string): string {
  return createHmac("sha256", schluessel("OX_HASH_SCHLUESSEL")).update(wert).digest("base64url");
}

export function zufallsToken(): string {
  return randomBytes(32).toString("base64url");
}

export function sha256(wert: string): string {
  return createHash("sha256").update(wert).digest("base64url");
}

/** 6-stelliger Code, gleichverteilt. */
export function sechsstelligerCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}
