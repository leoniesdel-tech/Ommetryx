// Einstellungen des Händlers laden und speichern (Figma H05, H10).
// Datenbank = Quelle; der Block im Shop liest eine Kopie der Button-Werte aus dem App-Metafeld ommetryx.button,
// damit die Produktseite keine zusätzliche Anfrage braucht.

import db from "../db.server";
import { setzeAppMetafeld } from "./admin.server";
import type { AdminGraphql } from "./admin.server";
import { fuerBlock, mitStandard, pruefeButton } from "./einstellungen";
import type { Einstellungen } from "./einstellungen";

export async function ladeEinstellungen(shop: string): Promise<Einstellungen> {
  const zeile = await db.shop.findUnique({ where: { domain: shop }, select: { einstellungen: true } });
  return mitStandard(zeile?.einstellungen);
}

export async function speichereEinstellungen(admin: AdminGraphql, shop: string, e: Einstellungen) {
  // Nicht lesbare Buttons werden nicht gespeichert (CLAUDE.md Abschnitt 6, Leitplanken).
  if (!pruefeButton(e).ok) throw new Error("Button nicht ausreichend lesbar");
  await db.shop.upsert({ where: { domain: shop }, create: { domain: shop, einstellungen: e }, update: { einstellungen: e } });
  await setzeAppMetafeld(admin, "button", "json", JSON.stringify(fuerBlock(e)));
}
