// Prüft beim Start in Produktion, ob alle Einstellungen da sind. Lieber sofort abbrechen als später
// mit halb funktionierender Verschlüsselung laufen. Meldungen nennen nur Namen, nie Werte.

const PFLICHT = [
  "SHOPIFY_API_KEY",
  "SHOPIFY_API_SECRET",
  "SHOPIFY_APP_URL",
  "SCOPES",
  "DATABASE_URL",
  "DATABASE_URL_IDENTITY",
  "DATABASE_URL_BODY",
  "DIRECT_DATABASE_URL",
  "BREVO_API_KEY",
  "OX_MAIL_ABSENDER",
] as const;

const SCHLUESSEL = ["INTERN_SCHLUESSEL", "OX_SCHLUESSEL_IDENTITY", "OX_SCHLUESSEL_BODY", "OX_HASH_SCHLUESSEL"] as const;

export function umgebungsFehler(env: Record<string, string | undefined>): string[] {
  const fehler = PFLICHT.filter((name) => !env[name]).map((name) => `${name} fehlt`);
  for (const name of SCHLUESSEL) {
    const wert = env[name];
    if (!wert) fehler.push(`${name} fehlt`);
    else if (Buffer.from(wert, "base64").length !== 32) fehler.push(`${name} muss 32 Byte lang sein`);
  }
  if (new Set(SCHLUESSEL.map((name) => env[name]).filter(Boolean)).size < SCHLUESSEL.filter((name) => env[name]).length) {
    fehler.push("Die Schlüssel müssen sich unterscheiden");
  }
  if (env.SHOPIFY_APP_URL && !env.SHOPIFY_APP_URL.startsWith("https://")) fehler.push("SHOPIFY_APP_URL muss mit https:// beginnen");
  return fehler;
}

export function pruefeUmgebung(env: Record<string, string | undefined> = process.env) {
  if (env.NODE_ENV !== "production") return;
  const fehler = umgebungsFehler(env);
  if (fehler.length > 0) throw new Error(`Einstellungen unvollständig: ${fehler.join("; ")}`);
}
