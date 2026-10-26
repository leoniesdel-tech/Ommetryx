// Wendet prisma/rechte.sql als Besitzer der Datenbank an (DIRECT_DATABASE_URL aus .env).
// Aufruf: npm run db:rechte

import { execFileSync } from "node:child_process";

try {
  process.loadEnvFile(".env");
} catch {
  // Umgebung ist schon gesetzt
}
if (!process.env.DIRECT_DATABASE_URL) {
  console.error("DIRECT_DATABASE_URL fehlt in .env");
  process.exit(1);
}
// Prisma direkt mit Node starten (ohne Shell), damit die Adresse nicht durch eine Kommandozeile läuft.
execFileSync(process.execPath, ["node_modules/prisma/build/index.js", "db", "execute", "--file", "prisma/rechte.sql", "--url", process.env.DIRECT_DATABASE_URL], {
  stdio: ["ignore", "ignore", "inherit"],
});
console.log("Rechte gesetzt.");
