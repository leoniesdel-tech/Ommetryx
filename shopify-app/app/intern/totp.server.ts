// Zwei-Faktor-Codes (TOTP, RFC 6238) für Authenticator-Apps.

import { Secret, TOTP } from "otpauth";
import QRCode from "qrcode";

const PERIODE = 30;

function totp(geheimnisBase32: string, email: string) {
  return new TOTP({
    issuer: "Ommetryx intern",
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: PERIODE,
    secret: Secret.fromBase32(geheimnisBase32),
  });
}

export function neuesTotpGeheimnis(): string {
  return new Secret({ size: 20 }).base32;
}

/** QR-Code als SVG zum Scannen mit der Authenticator-App. */
export async function totpQrSvg(geheimnisBase32: string, email: string): Promise<string> {
  return QRCode.toString(totp(geheimnisBase32, email).toString(), { type: "svg", margin: 1 });
}

/**
 * Prüft einen 6-stelligen Code (±1 Zeitschritt Toleranz).
 * Gibt den verwendeten Zeitschritt zurück oder null. Ein Schritt ≤ letzterSchritt gilt nicht (kein zweites Mal).
 */
export function pruefeTotp(
  geheimnisBase32: string,
  email: string,
  code: string,
  letzterSchritt: number | null,
  jetzt = Date.now(),
): number | null {
  const bereinigt = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(bereinigt)) return null;
  const delta = totp(geheimnisBase32, email).validate({ token: bereinigt, timestamp: jetzt, window: 1 });
  if (delta === null) return null;
  const schritt = Math.floor(jetzt / 1000 / PERIODE) + delta;
  if (letzterSchritt !== null && schritt <= letzterSchritt) return null;
  return schritt;
}

/** Nur für Tests: aktuellen Code erzeugen. */
export function totpCodeFuer(geheimnisBase32: string, email: string, jetzt = Date.now()): string {
  return totp(geheimnisBase32, email).generate({ timestamp: jetzt });
}
