// Export fürs Vermessungsprogramm: ZIP mit daten.json und den Fotos.
// Enthält nur, was das Programm braucht: keine Produktnamen, keine Shops, Teammitglieder nur als Nummer.

import { existsSync } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import archiver from "archiver";
import db from "../db.server";
import { MASSFELDER } from "./erfassung";
import { fotoPfad } from "./fotoablage.server";
import { bedingung } from "./messbuch.server";
import type { MessFilter } from "./messbuch.server";

export const EXPORT_VERSION = 1;

async function ladeExportTeile(filter: MessFilter) {
  return db.messArtikel.findMany({
    where: bedingung(filter),
    orderBy: { id: "asc" },
    include: { groessen: { orderBy: { reihenfolge: "asc" }, include: { foto: true, programm: { select: { id: true } } } } },
  });
}

type ExportTeil = Awaited<ReturnType<typeof ladeExportTeile>>[number];

/** Baut daten.json und die Liste der Fotos. Eine fehlende Datei zählt wie ein fehlendes Foto. */
export function baueExport(teile: ExportTeil[], filter: MessFilter, jetzt = new Date()) {
  const fotos: { pfad: string; name: string }[] = [];
  const daten = {
    format: "ommetryx-messbuch",
    version: EXPORT_VERSION,
    exportiert_am: jetzt.toISOString(),
    einheit: "cm, Umfänge bereits × 2",
    teile: teile.map((a) => ({
      teil_id: a.id,
      kategorie_id: a.kategorie,
      schnitt: a.schnitt,
      material_zusammensetzung: a.materialZusammensetzung,
      material_dehnung_prozent: a.materialDehnungProzent,
      tailliert: a.tailliert,
      bund_typ: a.bundTyp,
      aermel_typ: a.aermelTyp,
      messhoehe_brust_cm: a.messhoeheBrustCm,
      groessen: a.groessen
        .filter((g) => !filter.offen || (g.foto && !g.programm))
        .map((g) => {
          const masse = Object.fromEntries(MASSFELDER.flatMap(({ feld }) => (g[feld] === null ? [] : [[feld, g[feld]]])));
          const pfad = g.foto ? fotoPfad(g.foto.datei) : null;
          const foto = g.foto && pfad && existsSync(pfad) ? g.foto : null;
          const name = foto ? `fotos/${g.id}${path.extname(foto.datei)}` : null;
          if (pfad && name) fotos.push({ pfad, name });
          return {
            groesse_id: g.id,
            groesse: g.groesse,
            foto: name,
            foto_breite: foto?.breite ?? null,
            foto_hoehe: foto?.hoehe ?? null,
            handy: foto?.kamera ?? null,
            garment_measurements: masse,
            gemessen_von: g.gemessenVonId,
            gemessen_am: g.gemessenVonId === null ? null : g.gemessenAm.toISOString(),
          };
        }),
    })),
  };
  return { daten, fotos };
}

/** ZIP als Datenstrom: Fotos können zusammen sehr groß werden. JPEG und PNG sind schon gepackt, also ohne weitere Kompression. */
export async function messbuchZip(filter: MessFilter): Promise<ReadableStream<Uint8Array>> {
  const { daten, fotos } = baueExport(await ladeExportTeile(filter), filter);
  const zip = archiver("zip", { store: true });
  zip.on("error", (fehler) => zip.destroy(fehler));
  zip.append(JSON.stringify(daten, null, 2), { name: "daten.json" });
  for (const { pfad, name } of fotos) zip.file(pfad, { name });
  void zip.finalize();
  return Readable.toWeb(zip) as unknown as ReadableStream<Uint8Array>;
}
