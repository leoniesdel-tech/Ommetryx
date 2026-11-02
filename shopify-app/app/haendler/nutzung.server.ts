// Tageszähler zählen und lesen. Ein Fehler beim Zählen darf die Größenberatung nie stören.

import db from "../db.server";
import { ZEITRAUM_TAGE } from "./nutzung";
import type { NutzungArt } from "./nutzung";

const tagBeginn = (d: Date) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

export async function zaehleNutzung(shop: string, art: NutzungArt, jetzt = new Date()) {
  try {
    const zeile = await db.shop.findUnique({ where: { domain: shop }, select: { id: true } });
    if (!zeile) return;
    const tag = tagBeginn(jetzt);
    await db.nutzungTag.upsert({
      where: { shopId_tag_art: { shopId: zeile.id, tag, art } },
      create: { shopId: zeile.id, tag, art, anzahl: 1 },
      update: { anzahl: { increment: 1 } },
    });
  } catch {
    // Zählen ist Nebensache.
  }
}

export async function ladeNutzung(shop: string, jetzt = new Date()) {
  const seit = new Date(tagBeginn(jetzt).getTime() - (ZEITRAUM_TAGE - 1) * 24 * 3600 * 1000);
  const zeilen = await db.nutzungTag.groupBy({
    by: ["art"],
    where: { shop: { domain: shop }, tag: { gte: seit } },
    _sum: { anzahl: true },
  });
  return Object.fromEntries(zeilen.map((z) => [z.art, z._sum.anzahl ?? 0])) as Partial<Record<NutzungArt, number>>;
}
