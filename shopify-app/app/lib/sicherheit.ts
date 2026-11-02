// Zusätzliche Sicherheits-Kopfzeilen für Seiten außerhalb des Shopify-Admins.
// /intern und /mein dürfen nie in fremde Seiten eingebettet werden (Clickjacking). Die eingebetteten
// Admin-Seiten (/app) sind davon ausgenommen, für sie setzt Shopify die passenden Regeln selbst.
// Kein Referrer, damit Einladungs-Links aus /intern/einrichten nicht weitergegeben werden.

export function istEigenstaendigeSeite(pfad: string) {
  return /^\/(intern|mein)(\/|$)/.test(pfad);
}

export function setzeSicherheitsKopfzeilen(pfad: string, kopf: Headers) {
  if (!istEigenstaendigeSeite(pfad)) return;
  kopf.set("Content-Security-Policy", "frame-ancestors 'none'");
  kopf.set("X-Frame-Options", "DENY");
  kopf.set("Referrer-Policy", "no-referrer");
  kopf.set("X-Content-Type-Options", "nosniff");
}
