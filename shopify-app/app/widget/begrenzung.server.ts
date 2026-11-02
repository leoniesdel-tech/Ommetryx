// Begrenzt Empfehlungs-Anfragen, damit niemand unsere Kleidungsmaße automatisiert abfragen kann.
// Normale Nutzung bleibt weit darunter: Der Passform-Umschalter löst je Klick eine Anfrage aus.
//
// Datenschutz: Die IP (X-Forwarded-For, von Shopify gesetzt) wird nicht gespeichert, nur ein Hash im
// Arbeitsspeicher für eine Minute. Zählt je Server-Prozess; bei mehreren Instanzen in die Datenbank verlegen.

import { sha256 } from "../lib/krypto.server";

const FENSTER_MS = 60_000;
const JE_BESUCHER = 30;
const JE_SHOP = 1_200;
const MAX_EINTRAEGE = 50_000;

interface Zaehler {
  anzahl: number;
  seit: number;
}

const zaehler = new Map<string, Zaehler>();

function zaehle(schluessel: string, grenze: number, jetzt: number) {
  const z = zaehler.get(schluessel);
  if (!z || jetzt - z.seit >= FENSTER_MS) {
    zaehler.set(schluessel, { anzahl: 1, seit: jetzt });
    return true;
  }
  z.anzahl += 1;
  return z.anzahl <= grenze;
}

function raeumeAuf(jetzt: number) {
  if (zaehler.size < MAX_EINTRAEGE) return;
  for (const [schluessel, z] of zaehler) if (jetzt - z.seit >= FENSTER_MS) zaehler.delete(schluessel);
}

/** true = Anfrage erlaubt. Der Besucher ist die erste Adresse in X-Forwarded-For. */
export function anfrageErlaubt(shop: string, weitergeleitetFuer: string | null, jetzt = Date.now()) {
  raeumeAuf(jetzt);
  const ip = weitergeleitetFuer?.split(",")[0]?.trim() || "unbekannt";
  const besucher = zaehle(`b:${sha256(`${shop}|${ip}`)}`, JE_BESUCHER, jetzt);
  const gesamt = zaehle(`s:${shop}`, JE_SHOP, jetzt);
  return besucher && gesamt;
}

export function setzeBegrenzungZurueck() {
  zaehler.clear();
}
