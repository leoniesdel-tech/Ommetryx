// Muster-Versand: Anfragen speichern und lesen (Händler) und Status pflegen (Team).

import db from "../db.server";
import type { MusterStatus } from "./muster";

export async function ladeSendungen(shop: string) {
  const sendungen = await db.musterSendung.findMany({
    where: { shop: { domain: shop } },
    orderBy: { erstelltAm: "desc" },
    take: 50,
    select: { id: true, art: true, anzahlArtikel: true, status: true, sendungsnummer: true, erstelltAm: true },
  });
  return sendungen.map((s) => ({ ...s, erstelltAm: s.erstelltAm.toISOString() }));
}

export type AnfrageErgebnis = { ok: true } | { fehler: string };

/** Neue Anfrage. Braucht vorgemerkte Produkte; eine noch unbearbeitete Anfrage wird nicht verdoppelt. */
export async function frageMusterAn(shop: string, anfrage: { art: "paket" | "termin"; nachricht: string | null }): Promise<AnfrageErgebnis> {
  const zeile = await db.shop.upsert({ where: { domain: shop }, create: { domain: shop }, update: {} });
  const anzahlArtikel = await db.produktWunsch.count({ where: { shopId: zeile.id, wunsch: "vorgemerkt" } });
  if (anzahlArtikel === 0) return { fehler: "Bitte merken Sie zuerst unter „Produkte“ Artikel zur Vermessung vor." };
  const offen = await db.musterSendung.count({ where: { shopId: zeile.id, status: "angemeldet" } });
  if (offen > 0) return { fehler: "Ihre Anfrage liegt uns schon vor. Wir melden uns bei Ihnen." };
  await db.musterSendung.create({ data: { shopId: zeile.id, ...anfrage, anzahlArtikel } });
  return { ok: true };
}

/** Team: Status und Sendungsnummer setzen, nur innerhalb des angegebenen Shops. */
export async function setzeMusterStatus(shop: string, id: number, status: MusterStatus, sendungsnummer: string | null) {
  const { count } = await db.musterSendung.updateMany({ where: { id, shop: { domain: shop } }, data: { status, sendungsnummer } });
  return count === 1;
}

export async function sendungenFuerTeam(shop: string) {
  return db.musterSendung.findMany({ where: { shop: { domain: shop } }, orderBy: { erstelltAm: "desc" }, take: 50 });
}
