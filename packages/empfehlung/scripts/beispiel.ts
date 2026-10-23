// Zeigt eine Empfehlung als Tabelle, wie das Blatt „Rechenbeispiel“ in Excel.
// Aufruf: npm run beispiel            (nimmt beispiele/bluse.json)
//         npm run beispiel -- datei.json
// Nur für erfundene Testwerte gedacht.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { empfehle, standardKonfiguration } from "../src/index.ts";
import type { Anfrage } from "../src/index.ts";

const pfad = process.argv[2]
  ? resolve(process.argv[2])
  : fileURLToPath(new URL("../beispiele/bluse.json", import.meta.url));
const anfrage = JSON.parse(readFileSync(pfad, "utf8")) as Anfrage;
const ergebnis = empfehle(anfrage, standardKonfiguration());

const zahl = (n: number | null) => (n === null ? "–" : n.toFixed(2).replace(".", ","));
const text: Record<string, string> = { passt: "passt", zu_eng: "zu eng", zu_weit: "zu weit" };

console.log(`\nArtikel: ${anfrage.artikel.artikelart} · Schnitt ${anfrage.artikel.schnitt} · Passform ${anfrage.passform}\n`);
console.table(
  ergebnis.groessen.flatMap((g) =>
    g.zonen.map((z) => ({
      Größe: g.groesse,
      Messpunkt: z.messpunkt,
      Mehrweite: zahl(z.mehrweite),
      "Ziel-Mitte": zahl(z.ziel_mitte),
      "Zone ±": zahl(z.zone_halbbreite),
      Strafe: zahl(z.strafe),
      Bewertung: text[z.bewertung],
      "Score Größe": zahl(g.score),
      Ausgeschlossen: g.ausgeschlossen ? "ja" : "",
    })),
  ),
);

const zeilen = [
  `Empfohlene Größe: ${ergebnis.recommended_size ?? "keine"}`,
  `Sicherheit:       ${ergebnis.confidence} (${ergebnis.status})`,
  `Nachbargröße:     ${ergebnis.alternative_size ?? "–"}`,
  `Durch Schnitt begrenzt: ${ergebnis.begrenzt_durch_schnitt ? "ja" : "nein"}`,
];
console.log(zeilen.join("\n") + "\n");
