// Lädt ein Teammitglied in den internen Bereich ein.
// Aufruf: npm run team:einladen -- --email name@beispiel.de --name "Vorname"
// Gibt den Pfad zur Einrichtungsseite aus (24 Stunden gültig, nur einmal nutzbar).
// Eine erneute Einladung derselben E-Mail setzt Passwort und Zwei-Faktor zurück.

import { parseArgs } from "node:util";
import { PrismaClient } from "@prisma/client";
import { EINLADUNG_STUNDEN, ladeEin } from "../app/intern/team.server.ts";

const { values } = parseArgs({ options: { email: { type: "string" }, name: { type: "string" } } });
if (!values.email || !values.name || !values.email.includes("@")) {
  console.error('Bitte so aufrufen: npm run team:einladen -- --email name@beispiel.de --name "Vorname"');
  process.exit(1);
}

const db = new PrismaClient();
const token = await ladeEin(db, values.email, values.name);
await db.$disconnect();

console.log(`Einladung für ${values.name} erstellt (gültig ${EINLADUNG_STUNDEN} Stunden).`);
console.log(`Einrichtungsseite (an die App-Adresse anhängen): /intern/einrichten/${token}`);
