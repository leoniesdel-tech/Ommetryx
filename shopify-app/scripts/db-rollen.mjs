// Legt die drei Datenbank-Benutzer an oder setzt ihr Passwort neu, passend zu den Verbindungsadressen.
// Läuft als Besitzer der Datenbank (DIRECT_DATABASE_URL), mehrfach ausführbar. Gibt nie Passwörter aus.
// Aufruf: npm run db:rollen · Nur prüfen ohne Änderung: npm run db:rollen -- --pruefen

import { execFileSync } from "node:child_process";

try {
  process.loadEnvFile(".env");
} catch {
  // Umgebung ist schon gesetzt
}

const pruefen = process.argv.includes("--pruefen");

/** Name und Passwort aus der Adresse, nur erwartete Zeichen. */
export function zugang(adresse, erwartet) {
  const url = new URL(adresse);
  const name = decodeURIComponent(url.username);
  const passwort = decodeURIComponent(url.password);
  if (name !== erwartet) throw new Error(`Benutzer in der Adresse ist nicht ${erwartet}`);
  if (!/^[A-Za-z0-9_-]{16,}$/.test(passwort)) throw new Error(`Passwort für ${erwartet}: mindestens 16 Zeichen, nur Buchstaben, Ziffern, _ und -`);
  return { name, passwort };
}

export function rollenSql({ name, passwort }) {
  return `DO $$ BEGIN
  IF EXISTS (SELECT FROM pg_roles WHERE rolname = '${name}') THEN
    ALTER ROLE ${name} LOGIN PASSWORD '${passwort}';
  ELSE
    CREATE ROLE ${name} LOGIN PASSWORD '${passwort}';
  END IF;
END $$;`;
}

const ROLLEN = [
  ["DATABASE_URL", "ommetryx_app"],
  ["DATABASE_URL_IDENTITY", "ommetryx_identity"],
  ["DATABASE_URL_BODY", "ommetryx_body"],
];

if (process.argv[1]?.endsWith("db-rollen.mjs")) {
  if (!process.env.DIRECT_DATABASE_URL) throw new Error("DIRECT_DATABASE_URL fehlt");
  const fehlend = ROLLEN.filter(([schluessel]) => !process.env[schluessel]).map(([schluessel]) => schluessel);
  if (fehlend.length > 0) throw new Error(`Fehlt: ${fehlend.join(", ")}`);

  const zugaenge = ROLLEN.map(([schluessel, name]) => (pruefen ? { name, passwort: "" } : zugang(process.env[schluessel], name)));
  if (pruefen) {
    for (const [schluessel, name] of ROLLEN) {
      const url = new URL(process.env[schluessel]);
      console.log(`${name}: Benutzer ${decodeURIComponent(url.username) === name ? "passt" : "PASST NICHT"}, Passwort ${decodeURIComponent(url.password).length >= 16 ? "lang genug" : "ZU KURZ"}`);
    }
  } else {
    // Über stdin, damit Passwörter nicht in einer Kommandozeile stehen.
    execFileSync(process.execPath, ["node_modules/prisma/build/index.js", "db", "execute", "--stdin", "--url", process.env.DIRECT_DATABASE_URL], {
      input: zugaenge.map(rollenSql).join("\n"),
      stdio: ["pipe", "ignore", "inherit"],
    });
    console.log("Benutzer eingerichtet.");
  }
}
