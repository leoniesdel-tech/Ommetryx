// Liest docs/ommetryx-konfiguration-v3.xlsx und schreibt konfiguration/konfiguration-v3.json.
// Die Excel-Datei bleibt die Quelle. Nach jeder Änderung dort: `npm run konfig`.
//
// Jedes Blatt wird zu einer Liste von Zeilen. Kopfzeile = Spaltennamen.
// Formelzellen liefern ihr berechnetes Ergebnis, leere Zellen werden weggelassen.
// Berechnete Spalten (z. B. „mitte“) werden nicht übernommen, der Code rechnet sie selbst.

const BERECHNETE_SPALTEN = new Set(["mitte"]);

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ExcelJS from "exceljs";

const excelPfad = fileURLToPath(new URL("../../../docs/ommetryx-konfiguration-v3.xlsx", import.meta.url));
const zielPfad = fileURLToPath(new URL("../konfiguration/konfiguration-v3.json", import.meta.url));

type Wert = string | number | boolean;

function zellwert(roh: ExcelJS.CellValue): Wert | undefined {
  if (roh === null || roh === undefined || roh === "") return undefined;
  if (typeof roh === "number" || typeof roh === "string" || typeof roh === "boolean") return roh;
  if (typeof roh === "object") {
    if ("result" in roh) return zellwert(roh.result as ExcelJS.CellValue);
    if ("richText" in roh) return roh.richText.map((t) => t.text).join("");
  }
  throw new Error(`Unbekannter Zelltyp: ${JSON.stringify(roh)}`);
}

function blattAlsZeilen(mappe: ExcelJS.Workbook, name: string): Record<string, Wert>[] {
  const blatt = mappe.getWorksheet(name);
  if (!blatt) throw new Error(`Blatt "${name}" fehlt in der Excel-Datei`);

  const kopf: string[] = [];
  blatt.getRow(1).eachCell((zelle, spalte) => {
    kopf[spalte] = String(zellwert(zelle.value));
  });

  const zeilen: Record<string, Wert>[] = [];
  blatt.eachRow((zeile, nummer) => {
    if (nummer === 1) return;
    const eintrag: Record<string, Wert> = {};
    zeile.eachCell((zelle, spalte) => {
      const name = kopf[spalte];
      if (!name || BERECHNETE_SPALTEN.has(name)) return;
      const wert = zellwert(zelle.value);
      if (name && wert !== undefined) eintrag[name] = wert;
    });
    // Erläuterungszeilen unter einer Tabelle haben nur Text in Spalte A und keinen Schlüssel.
    const ersteSpalte = kopf[1];
    if (ersteSpalte && Object.keys(eintrag).length > 1) zeilen.push(eintrag);
  });
  return zeilen;
}

const mappe = new ExcelJS.Workbook();
await mappe.xlsx.readFile(excelPfad);

const parameter: Record<string, number> = {};
for (const zeile of blattAlsZeilen(mappe, "Parameter")) {
  parameter[String(zeile.schluessel)] = Number(zeile.wert);
}

const konfiguration = {
  _hinweis: "Automatisch erzeugt aus docs/ommetryx-konfiguration-v3.xlsx mit `npm run konfig`. Nicht von Hand ändern.",
  version: "v3",
  bereiche: blattAlsZeilen(mappe, "Bereiche"),
  mindest: blattAlsZeilen(mappe, "Mindest"),
  dehnungsklassen: blattAlsZeilen(mappe, "Dehnungsklassen"),
  dehnungskorrektur: blattAlsZeilen(mappe, "Dehnungskorrektur"),
  gewichte: blattAlsZeilen(mappe, "Gewichte"),
  parameter,
};

writeFileSync(zielPfad, JSON.stringify(konfiguration, null, 2) + "\n", "utf8");
console.log(`Konfiguration geschrieben: ${zielPfad}`);
console.log(
  `  ${konfiguration.bereiche.length} Bereiche, ${konfiguration.mindest.length} Mindestwerte, ` +
    `${konfiguration.gewichte.length} Gewichtsgruppen, ${Object.keys(parameter).length} Parameter`,
);
