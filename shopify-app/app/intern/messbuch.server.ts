// Messbuch: lesen, speichern, löschen.

import type { Prisma } from "@prisma/client";
import db from "../db.server";
import { MASSFELDER } from "./erfassung";
import type { Masse } from "./erfassung";
import type { MessDaten } from "./messbuch";

export interface MessFilter {
  suche?: string | null;
  kategorie?: string | null;
  shop?: string | null;
  groesse?: string | null;
}

const JE_SEITE = 200;

function bedingung(f: MessFilter): Prisma.MessArtikelWhereInput {
  const suche = f.suche?.trim();
  return {
    ...(f.kategorie ? { kategorie: f.kategorie } : {}),
    ...(f.shop ? { onlineShop: f.shop } : {}),
    ...(f.groesse ? { groessen: { some: { groesse: f.groesse } } } : {}),
    ...(suche
      ? {
          OR: [
            { produktname: { contains: suche, mode: "insensitive" as const } },
            { marke: { contains: suche, mode: "insensitive" as const } },
            { onlineShop: { contains: suche, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };
}

export async function ladeMessListe(filter: MessFilter) {
  const [artikel, gesamt, shops, groessen, kategorien] = await Promise.all([
    db.messArtikel.findMany({
      where: bedingung(filter),
      orderBy: { geaendertAm: "desc" },
      take: JE_SEITE,
      include: { groessen: { orderBy: { reihenfolge: "asc" }, select: { groesse: true } } },
    }),
    db.messArtikel.count({ where: bedingung(filter) }),
    db.messArtikel.findMany({ distinct: ["onlineShop"], select: { onlineShop: true }, orderBy: { onlineShop: "asc" } }),
    db.messGroesse.findMany({ distinct: ["groesse"], select: { groesse: true }, orderBy: { groesse: "asc" } }),
    db.messArtikel.findMany({ distinct: ["kategorie"], select: { kategorie: true }, orderBy: { kategorie: "asc" } }),
  ]);
  return {
    artikel,
    gesamt,
    optionen: { shops: shops.map((s) => s.onlineShop), groessen: groessen.map((g) => g.groesse), kategorien: kategorien.map((k) => k.kategorie) },
  };
}

export function ladeMessArtikel(id: number) {
  return db.messArtikel.findUnique({
    where: { id },
    include: {
      groessen: { orderBy: { reihenfolge: "asc" }, include: { gemessenVon: { select: { name: true } } } },
    },
  });
}

const masseSpalten = (masse: Masse) => Object.fromEntries(MASSFELDER.map(({ feld }) => [feld, masse[feld] ?? null]));

const gleicheMasse = (alt: Record<string, unknown>, masse: Masse) => MASSFELDER.every(({ feld }) => (alt[feld] ?? null) === (masse[feld] ?? null));

/**
 * Neu anlegen (id null) oder ändern. Größen bleiben als Einträge bestehen, damit später Fotos daran hängen können.
 * „Gemessen von/am“ ändert sich nur, wenn sich die Maße dieser Größe wirklich geändert haben.
 */
export async function speichereMessArtikel(id: number | null, d: MessDaten, teamId: number): Promise<number> {
  const a = d.artikel;
  const felder = {
    herkunft: d.herkunft,
    onlineShop: d.onlineShop,
    marke: d.marke,
    produktname: d.produktname,
    link: d.link,
    notiz: d.notiz,
    kategorie: a.artikelart,
    schnitt: a.schnitt,
    materialDehnungProzent: a.materialDehnungProzent,
    materialZusammensetzung: a.materialZusammensetzung,
    tailliert: a.tailliert,
    bundTyp: a.bundTyp,
    aermelTyp: a.aermelTyp,
    messhoeheBrustCm: a.messhoeheBrustCm,
  };

  return db.$transaction(async (tx) => {
    const eintrag = id === null ? await tx.messArtikel.create({ data: felder }) : await tx.messArtikel.update({ where: { id }, data: felder });
    const vorhanden = await tx.messGroesse.findMany({ where: { artikelId: eintrag.id } });
    const nachName = new Map(vorhanden.map((g) => [g.groesse, g]));
    const namen = new Set(a.groessen.map((g) => g.groesse));

    await tx.messGroesse.deleteMany({ where: { artikelId: eintrag.id, groesse: { notIn: [...namen] } } });
    for (const g of a.groessen) {
      const alt = nachName.get(g.groesse);
      if (alt) {
        const geaendert = !gleicheMasse(alt, g.masse);
        await tx.messGroesse.update({
          where: { id: alt.id },
          data: { reihenfolge: g.reihenfolge, ...masseSpalten(g.masse), ...(geaendert ? { gemessenVonId: teamId, gemessenAm: new Date() } : {}) },
        });
      } else {
        await tx.messGroesse.create({ data: { artikelId: eintrag.id, groesse: g.groesse, reihenfolge: g.reihenfolge, gemessenVonId: teamId, ...masseSpalten(g.masse) } });
      }
    }
    return eintrag.id;
  });
}

export async function loescheMessArtikel(id: number) {
  await db.messArtikel.deleteMany({ where: { id } });
}
