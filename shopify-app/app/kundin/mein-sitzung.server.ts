// Sitzung auf „Mein Ommetryx“: Cookie 60 Minuten, HttpOnly, Secure, SameSite=Lax
// (Lax, damit der Link aus dem Widget angemeldet ankommt; Formulare schützt zusätzlich pruefeHerkunft).
// Path=/ (nicht /mein): React Router lädt Daten über „/mein.data“, das läge außerhalb von Path=/mein.

import { redirect } from "react-router";
import { kundinAusToken, MEIN_BEREICH, MEIN_SITZUNG_MINUTEN, meldeAb } from "./login.server";

const COOKIE = "ox_mein";

/** Alle Werte des Cookies (der Browser kann mehrere mit gleichem Namen, aber anderem Pfad schicken). */
function cookieWerte(request: Request): string[] {
  const werte: string[] = [];
  for (const teil of (request.headers.get("Cookie") ?? "").split(";")) {
    const [name, ...rest] = teil.trim().split("=");
    if (name === COOKIE && rest.join("=")) werte.push(rest.join("="));
  }
  return werte;
}

export function meinCookie(token: string) {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MEIN_SITZUNG_MINUTEN * 60}`;
}

export function meinCookieLoeschen() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function kundinAusAnfrage(request: Request) {
  for (const wert of cookieWerte(request)) {
    const kundin = await kundinAusToken(wert, MEIN_BEREICH);
    if (kundin) return kundin;
  }
  return null;
}

/** Für geschützte Seiten: angemeldete Kundin oder Weiterleitung zur Anmeldung. */
export async function verlangeKundin(request: Request) {
  const kundin = await kundinAusAnfrage(request);
  if (!kundin) throw redirect("/mein/anmelden");
  return kundin;
}

export async function meinAbmelden(request: Request) {
  for (const wert of cookieWerte(request)) await meldeAb(wert);
}

/** Kein Zwischenspeichern sensibler Seiten im Browser oder in Proxys. */
export const OHNE_CACHE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
