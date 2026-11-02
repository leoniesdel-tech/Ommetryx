// Täglicher Pflege-Lauf: npm run pflege. Gibt nur Anzahlen aus.

export {};

try {
  process.loadEnvFile(".env");
} catch {
  // Werte kommen aus der Umgebung
}

const { erinnereUndLoesche, raeumeAuf } = await import("../app/kundin/pflege.server");

console.log(JSON.stringify({ profile: await erinnereUndLoesche(), aufgeraeumt: await raeumeAuf() }));
process.exit(0);
