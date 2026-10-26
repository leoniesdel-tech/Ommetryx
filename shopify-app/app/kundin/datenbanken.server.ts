// Datenbank-Zugänge für Kundinnen-Daten – je Bereich ein eigener Benutzer mit eigenen Rechten.
//   identityDb: nur Bereich identity (E-Mail, Login, Einwilligungen, Zuordnung)
//   bodyDb:     nur Bereich body (Körpermaße)
// Shops, Artikel usw. laufen weiter über ../db.server (Benutzer ommetryx_app).

import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var oxIdentityDb: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var oxBodyDb: PrismaClient | undefined;
}

function adresse(name: "DATABASE_URL_IDENTITY" | "DATABASE_URL_BODY"): string {
  if (!process.env[name]) {
    try {
      process.loadEnvFile(".env");
    } catch {
      // Werte kommen aus der Umgebung
    }
  }
  const url = process.env[name];
  if (!url) throw new Error(`${name} fehlt`);
  return url;
}

export const identityDb: PrismaClient = (global.oxIdentityDb ??= new PrismaClient({ datasourceUrl: adresse("DATABASE_URL_IDENTITY") }));
export const bodyDb: PrismaClient = (global.oxBodyDb ??= new PrismaClient({ datasourceUrl: adresse("DATABASE_URL_BODY") }));
