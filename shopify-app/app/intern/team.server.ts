// Team-Login für /intern: Einladung, Einrichtung (Passwort + Authenticator), Anmeldung, Sitzung.
//
// Sicherheitsregeln:
// - Passwörter nur als scrypt-Hash, TOTP-Geheimnisse verschlüsselt, Cookie-Werte nur als SHA-256.
// - Fehlermeldungen verraten nie, ob E-Mail, Passwort oder Code falsch war.
// - Nach MAX_FEHLVERSUCHE ist das Konto SPERRE_MINUTEN gesperrt.
// - Nichts davon wird geloggt.

import type { PrismaClient, TeamMitglied } from "@prisma/client";
import { redirect } from "react-router";
import { entschluessele, hashePasswort, pruefePasswort, pruefePasswortAttrappe, sha256, verschluessele, zufallsToken } from "./krypto.server";
import { neuesTotpGeheimnis, pruefeTotp, totpQrSvg } from "./totp.server";
import type { EinrichtungsFehler } from "./regeln";
import { EINLADUNG_STUNDEN, MAX_FEHLVERSUCHE, MIN_PASSWORT_LAENGE, SITZUNG_STUNDEN, SPERRE_MINUTEN } from "./regeln";

export { EINLADUNG_STUNDEN, MAX_FEHLVERSUCHE } from "./regeln";

const COOKIE = "ox_intern";

export type Team = Pick<TeamMitglied, "id" | "email" | "name">;

const minuten = (n: number) => n * 60 * 1000;
const stunden = (n: number) => minuten(n * 60);

// ---------------------------------------------------------------------------
// Einladung und Einrichtung
// ---------------------------------------------------------------------------

/** Legt ein Teammitglied an (oder erneuert die Einladung) und gibt den Einrichtungs-Token zurück. */
export async function ladeEin(db: PrismaClient, email: string, name: string): Promise<string> {
  const token = zufallsToken();
  const daten = {
    name,
    passwortHash: null,
    totpGeheimnis: null,
    totpAktiv: false,
    letzterTotpSchritt: null,
    fehlversuche: 0,
    gesperrtBis: null,
    einrichtungTokenHash: sha256(token),
    einrichtungGueltigBis: new Date(Date.now() + stunden(EINLADUNG_STUNDEN)),
  };
  const normal = email.trim().toLowerCase();
  await db.teamMitglied.upsert({ where: { email: normal }, create: { email: normal, ...daten }, update: daten });
  await db.teamSitzung.deleteMany({ where: { mitglied: { email: normal } } });
  return token;
}

async function mitgliedZurEinladung(db: PrismaClient, token: string) {
  const mitglied = await db.teamMitglied.findUnique({ where: { einrichtungTokenHash: sha256(token) } });
  if (!mitglied || !mitglied.einrichtungGueltigBis || mitglied.einrichtungGueltigBis < new Date()) return null;
  return mitglied;
}

/** Daten für die Einrichtungsseite: Name und QR-Code. Das TOTP-Geheimnis wird beim ersten Aufruf erzeugt. */
export async function ladeEinrichtung(db: PrismaClient, token: string) {
  let mitglied = await mitgliedZurEinladung(db, token);
  if (!mitglied) return null;
  if (!mitglied.totpGeheimnis) {
    mitglied = await db.teamMitglied.update({
      where: { id: mitglied.id },
      data: { totpGeheimnis: verschluessele(neuesTotpGeheimnis()) },
    });
  }
  const geheimnis = entschluessele(mitglied.totpGeheimnis!);
  return {
    name: mitglied.name,
    email: mitglied.email,
    qrSvg: await totpQrSvg(geheimnis, mitglied.email),
    // Zum Abtippen, falls der QR-Code nicht scannbar ist.
    geheimnisZumAbtippen: geheimnis.replace(/(.{4})/g, "$1 ").trim(),
  };
}

export async function schliesseEinrichtungAb(
  db: PrismaClient,
  token: string,
  eingabe: { passwort: string; wiederholung: string; code: string },
): Promise<{ ok: true; sitzungToken: string } | { ok: false; fehler: EinrichtungsFehler }> {
  const mitglied = await mitgliedZurEinladung(db, token);
  if (!mitglied || !mitglied.totpGeheimnis) return { ok: false, fehler: "einladung_ungueltig" };
  if (eingabe.passwort.length < MIN_PASSWORT_LAENGE) return { ok: false, fehler: "passwort_zu_kurz" };
  if (eingabe.passwort !== eingabe.wiederholung) return { ok: false, fehler: "passwoerter_ungleich" };

  const schritt = pruefeTotp(entschluessele(mitglied.totpGeheimnis), mitglied.email, eingabe.code, null);
  if (schritt === null) return { ok: false, fehler: "code_falsch" };

  await db.teamMitglied.update({
    where: { id: mitglied.id },
    data: {
      passwortHash: await hashePasswort(eingabe.passwort),
      totpAktiv: true,
      letzterTotpSchritt: schritt,
      einrichtungTokenHash: null,
      einrichtungGueltigBis: null,
      letzteAnmeldung: new Date(),
    },
  });
  return { ok: true, sitzungToken: await neueSitzung(db, mitglied.id) };
}

// ---------------------------------------------------------------------------
// Anmeldung
// ---------------------------------------------------------------------------

export async function meldeAn(
  db: PrismaClient,
  eingabe: { email: string; passwort: string; code: string },
): Promise<{ ok: true; sitzungToken: string } | { ok: false }> {
  const mitglied = await db.teamMitglied.findUnique({ where: { email: eingabe.email.trim().toLowerCase() } });
  if (!mitglied || !mitglied.passwortHash || !mitglied.totpAktiv || !mitglied.totpGeheimnis) {
    await pruefePasswortAttrappe(eingabe.passwort);
    return { ok: false };
  }
  if (mitglied.gesperrtBis && mitglied.gesperrtBis > new Date()) {
    await pruefePasswortAttrappe(eingabe.passwort);
    return { ok: false };
  }

  const passwortOk = await pruefePasswort(eingabe.passwort, mitglied.passwortHash);
  const schritt = passwortOk
    ? pruefeTotp(entschluessele(mitglied.totpGeheimnis), mitglied.email, eingabe.code, mitglied.letzterTotpSchritt)
    : null;

  if (!passwortOk || schritt === null) {
    const fehlversuche = mitglied.fehlversuche + 1;
    const sperren = fehlversuche >= MAX_FEHLVERSUCHE;
    await db.teamMitglied.update({
      where: { id: mitglied.id },
      data: {
        fehlversuche: sperren ? 0 : fehlversuche,
        gesperrtBis: sperren ? new Date(Date.now() + minuten(SPERRE_MINUTEN)) : mitglied.gesperrtBis,
      },
    });
    return { ok: false };
  }

  await db.teamMitglied.update({
    where: { id: mitglied.id },
    data: { fehlversuche: 0, gesperrtBis: null, letzterTotpSchritt: schritt, letzteAnmeldung: new Date() },
  });
  return { ok: true, sitzungToken: await neueSitzung(db, mitglied.id) };
}

// ---------------------------------------------------------------------------
// Sitzung (Cookie)
// ---------------------------------------------------------------------------

async function neueSitzung(db: PrismaClient, mitgliedId: number): Promise<string> {
  const token = zufallsToken();
  await db.teamSitzung.deleteMany({ where: { mitgliedId, gueltigBis: { lt: new Date() } } });
  await db.teamSitzung.create({
    data: { tokenHash: sha256(token), mitgliedId, gueltigBis: new Date(Date.now() + stunden(SITZUNG_STUNDEN)) },
  });
  return token;
}

/** Alle Werte des Cookies (der Browser kann mehrere mit gleichem Namen, aber anderem Pfad schicken). */
function cookieWerte(request: Request): string[] {
  const werte: string[] = [];
  for (const teil of (request.headers.get("Cookie") ?? "").split(";")) {
    const [name, ...rest] = teil.trim().split("=");
    if (name === COOKIE && rest.join("=")) werte.push(rest.join("="));
  }
  return werte;
}

export function sitzungsCookie(token: string): string {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SITZUNG_STUNDEN * 3600}`;
}

export function sitzungsCookieLoeschen(): string {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function teamAusAnfrage(db: PrismaClient, request: Request): Promise<Team | null> {
  for (const token of cookieWerte(request)) {
    const sitzung = await db.teamSitzung.findUnique({
      where: { tokenHash: sha256(token) },
      include: { mitglied: { select: { id: true, email: true, name: true } } },
    });
    if (sitzung && sitzung.gueltigBis >= new Date()) return sitzung.mitglied;
  }
  return null;
}

/** Für geschützte Seiten: angemeldetes Teammitglied oder Weiterleitung zur Anmeldung. */
export async function verlangeTeam(db: PrismaClient, request: Request): Promise<Team> {
  const team = await teamAusAnfrage(db, request);
  if (!team) throw redirect("/intern/anmelden");
  return team;
}

export async function meldeAb(db: PrismaClient, request: Request) {
  const tokens = cookieWerte(request);
  if (tokens.length > 0) await db.teamSitzung.deleteMany({ where: { tokenHash: { in: tokens.map(sha256) } } });
}

/**
 * Schutz gegen Formulare von fremden Seiten (CSRF), zusätzlich zu SameSite=Strict:
 * Der Host im Origin-Kopf muss zum angefragten Host passen (auch hinter dem Tunnel).
 */
export function pruefeHerkunft(request: Request) {
  const herkunft = request.headers.get("Origin");
  if (!herkunft) return;
  const eigenerHost = request.headers.get("X-Forwarded-Host") ?? request.headers.get("Host") ?? new URL(request.url).host;
  let fremd = true;
  try {
    fremd = new URL(herkunft).host !== eigenerHost;
  } catch {
    // ungültiger Origin-Kopf
  }
  if (fremd) throw new Response("Nicht erlaubt", { status: 403 });
}
