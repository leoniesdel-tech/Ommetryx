// Lädt und prüft die Konfiguration (Excel-Export + Ergänzungen).
// Alle Zahlen der Logik kommen von hier, nichts steht fest im Code.

import { z } from "zod";
import { EmpfehlungsFehler, MESSPUNKTE, PASSFORMEN } from "./typen.ts";
import type { BundTyp, Messpunkt, Passform } from "./typen.ts";

const passform = z.enum(PASSFORMEN);
const messpunkt = z.enum(MESSPUNKTE);

const bereichSchema = z.object({
  kategorie_id: z.string(),
  messpunkt,
  passform,
  unter: z.number(),
  ober: z.number(),
  einheit: z.string(),
  referenz_dehnungsklasse: z.number().int(),
});

const mindestSchema = z.object({
  kategorie_id: z.string(),
  messpunkt,
  mindest_cm_klasse0: z.number(),
});

const dehnungsklasseSchema = z.object({
  klasse: z.number().int(),
  dehnung_von: z.number(),
  dehnung_bis: z.number().optional(),
});

const dehnungskorrekturSchema = z.object({
  klasse: z.number().int(),
  koerpernah: z.number().optional(),
  regulaer: z.number().optional(),
  locker: z.number().optional(),
  oversized: z.number().optional(),
});

const gewichtSchema = z.object({
  kategorie: z.string(),
  brust: z.number().optional(),
  taille: z.number().optional(),
  huefte: z.number().optional(),
  oberschenkel: z.number().optional(),
  oberarm: z.number().optional(),
});

const PARAMETER = [
  "faktor_zu_eng",
  "faktor_zu_weit",
  "faktor_unter_mindest",
  "faktor_ueber_obergrenze",
  "zone_halbbreite_in_G",
  "schnitt_begrenzung_in_G",
  "ausschluss_unter_mindest_cm",
  "schulter_ausschluss_schmaler_cm",
  "schulter_toleranz_cm",
  "aermellaenge_toleranz_cm",
  "nutzbarer_dehnungsanteil",
  "skalierung_anteil_proportional",
  "start",
  "knapp_schwelle_score_diff",
  "abzug_schnitt_begrenzt",
  "abzug_unter_mindest",
  "schwelle_unsicher",
] as const;

const excelSchema = z.object({
  version: z.string(),
  bereiche: z.array(bereichSchema.passthrough()),
  mindest: z.array(mindestSchema.passthrough()),
  dehnungsklassen: z.array(dehnungsklasseSchema.passthrough()),
  dehnungskorrektur: z.array(dehnungskorrekturSchema.passthrough()),
  gewichte: z.array(gewichtSchema.passthrough()),
  parameter: z.record(z.string(), z.number()).superRefine((p, ctx) => {
    for (const name of PARAMETER) {
      if (p[name] === undefined) ctx.addIssue({ code: "custom", message: `Parameter "${name}" fehlt` });
    }
  }),
});

const zeilenwahlSchema = z.object({
  zeile: z.string().nullable(),
  mindest_zeile: z.string().nullable(),
  mindest_aus_zeile: z.boolean().optional(),
});

const messpunktRegelSchema = zeilenwahlSchema.extend({
  wenn_tailliert: zeilenwahlSchema.optional(),
  wenn_aermellos: zeilenwahlSchema.optional(),
  nach_bund: z
    .object({ fest: zeilenwahlSchema.nullable(), stretch: zeilenwahlSchema.nullable(), gummizug: zeilenwahlSchema.nullable() })
    .optional(),
});

const artikelartSchema = z.object({
  name: z.string(),
  primaermass: messpunkt,
  gewichtsgruppe: z.string(),
  gewichtsgruppe_tailliert: z.string().optional(),
  schulter_werten: z.boolean(),
  aermellaenge_werten: z.boolean(),
  messpunkte: z.partialRecord(messpunkt, messpunktRegelSchema),
});

const ergaenzungenSchema = z.object({
  version: z.string(),
  gewichtsgruppen: z.record(z.string(), z.string()),
  zusatzgewichte: z.object({ schulter: z.number(), aermellaenge: z.number() }),
  mindest_klasse1: z.record(messpunkt, z.number()),
  groessensprung_standard_cm: z.number().positive(),
  artikelarten: z.record(z.string(), artikelartSchema),
});

export type Zeilenwahl = z.infer<typeof zeilenwahlSchema>;
export type Artikelart = z.infer<typeof artikelartSchema>;
export type Parametername = (typeof PARAMETER)[number];

export interface Bereich {
  unter: number;
  ober: number;
  mitte: number;
  /** "cm" oder Prozent des Körpermaßes (Leggings). */
  prozentual: boolean;
  referenz_dehnungsklasse: number;
}

export interface Konfiguration {
  version: string;
  parameter(name: Parametername): number;
  /** Bereich je Tabellenzeile, Messpunkt und Passform, oder undefined („nicht werten“). */
  bereich(zeile: string, messpunkt: Messpunkt, passform: Passform): Bereich | undefined;
  /** Obergrenze von oversized (für die Zusatzstrafe), oder undefined. */
  oversizedObergrenze(zeile: string, messpunkt: Messpunkt): number | undefined;
  mindestKlasse0(zeile: string, messpunkt: Messpunkt): number | undefined;
  mindestKlasse1(messpunkt: Messpunkt): number;
  dehnungsklasse(dehnungProzent: number): number;
  /** Korrekturwert der Ziel-Mitte für eine Klasse und Passform (vor Abzug der Referenzklasse). */
  dehnungskorrekturWert(klasse: number, passform: Passform): number | undefined;
  gewicht(gruppe: string, messpunkt: Messpunkt): number;
  zusatzgewicht(art: "schulter" | "aermellaenge"): number;
  /** Referenz-Körpermaß für die Umrechnung, oder undefined, wenn der Messpunkt nicht umgerechnet wird. */
  kRef(messpunkt: Messpunkt): number | undefined;
  groessensprungStandard: number;
  artikelart(name: string): Artikelart;
  artikelarten: string[];
  bundRegel(regel: z.infer<typeof messpunktRegelSchema>, bund: BundTyp): Zeilenwahl | null | undefined;
}

export function ladeKonfiguration(excelRoh: unknown, ergaenzungenRoh: unknown): Konfiguration {
  const excel = pruefe(excelSchema, excelRoh, "konfiguration-v3.json");
  const erg = pruefe(ergaenzungenSchema, ergaenzungenRoh, "ergaenzungen-v3.json");

  const bereiche = new Map<string, Bereich>();
  for (const b of excel.bereiche) {
    bereiche.set(`${b.kategorie_id}|${b.messpunkt}|${b.passform}`, {
      unter: b.unter,
      ober: b.ober,
      mitte: (b.unter + b.ober) / 2,
      prozentual: b.einheit !== "cm",
      referenz_dehnungsklasse: b.referenz_dehnungsklasse,
    });
  }
  const mindest = new Map(excel.mindest.map((m) => [`${m.kategorie_id}|${m.messpunkt}`, m.mindest_cm_klasse0]));
  const klassen = [...excel.dehnungsklassen].sort((a, b) => a.dehnung_von - b.dehnung_von);
  const korrektur = new Map(excel.dehnungskorrektur.map((k) => [k.klasse, k]));
  const gewichte = new Map(excel.gewichte.map((g) => [g.kategorie, g]));

  for (const [gruppe, text] of Object.entries(erg.gewichtsgruppen)) {
    if (!gewichte.has(text)) fehler("konfiguration", `Gewichtsgruppe "${gruppe}" verweist auf unbekannte Zeile "${text}"`);
  }

  const konfiguration: Konfiguration = {
    version: excel.version,
    parameter: (name) => excel.parameter[name]!,
    bereich: (zeile, mp, pf) => bereiche.get(`${zeile}|${mp}|${pf}`),
    oversizedObergrenze: (zeile, mp) => bereiche.get(`${zeile}|${mp}|oversized`)?.ober,
    mindestKlasse0: (zeile, mp) => mindest.get(`${zeile}|${mp}`),
    mindestKlasse1: (mp) => erg.mindest_klasse1[mp],
    dehnungsklasse(prozent) {
      const anteil = prozent / 100;
      let gefunden = klassen[0]!.klasse;
      for (const k of klassen) if (anteil >= k.dehnung_von) gefunden = k.klasse;
      return gefunden;
    },
    dehnungskorrekturWert: (klasse, pf) => korrektur.get(klasse)?.[pf],
    gewicht(gruppe, mp) {
      const text = erg.gewichtsgruppen[gruppe];
      if (!text) fehler("konfiguration", `Unbekannte Gewichtsgruppe "${gruppe}"`);
      return gewichte.get(text)?.[mp] ?? 0;
    },
    zusatzgewicht: (art) => erg.zusatzgewichte[art],
    kRef: (mp) => excel.parameter[`k_ref_${mp}_cm`],
    groessensprungStandard: erg.groessensprung_standard_cm,
    artikelart(name) {
      const art = erg.artikelarten[name];
      if (!art) fehler("unbekannte_artikelart", `Unbekannte Artikelart "${name}"`);
      return art;
    },
    artikelarten: Object.keys(erg.artikelarten).sort(),
    bundRegel: (regel, bund) => regel.nach_bund?.[bund],
  };

  pruefeVerweise(konfiguration, erg.artikelarten, mindest);
  return konfiguration;
}

/** Jede Zeile, auf die eine Artikelart verweist, muss es in den Excel-Blättern geben. */
function pruefeVerweise(k: Konfiguration, arten: Record<string, Artikelart>, mindest: Map<string, number>) {
  for (const [name, art] of Object.entries(arten)) {
    for (const [mp, regel] of Object.entries(art.messpunkte) as [Messpunkt, z.infer<typeof messpunktRegelSchema>][]) {
      const varianten: (Zeilenwahl | null | undefined)[] = [
        regel,
        regel.wenn_tailliert,
        regel.wenn_aermellos,
        regel.nach_bund?.fest,
        regel.nach_bund?.stretch,
        regel.nach_bund?.gummizug,
      ];
      for (const v of varianten) {
        if (!v) continue;
        if (v.zeile && !PASSFORMEN.some((pf) => k.bereich(v.zeile!, mp, pf))) {
          fehler("konfiguration", `Artikelart "${name}", ${mp}: Bereichszeile "${v.zeile}" fehlt`);
        }
        if (v.mindest_zeile && !mindest.has(`${v.mindest_zeile}|${mp}`)) {
          fehler("konfiguration", `Artikelart "${name}", ${mp}: Mindestzeile "${v.mindest_zeile}" fehlt`);
        }
      }
    }
  }
}

function pruefe<T>(schema: z.ZodType<T>, roh: unknown, datei: string): T {
  const ergebnis = schema.safeParse(roh);
  if (!ergebnis.success) {
    fehler("konfiguration", `${datei} ist ungültig: ${z.prettifyError(ergebnis.error)}`);
  }
  return ergebnis.data;
}

function fehler(code: string, nachricht: string): never {
  throw new EmpfehlungsFehler(code, nachricht);
}
