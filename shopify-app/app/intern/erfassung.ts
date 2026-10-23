// Erfassung von Kleidungsmaßen per Hand: Eingabe prüfen und in das v3-Format bringen.
// Rein rechnend (ohne Datenbank), damit es gut testbar ist.
//
// Das Team misst flach. Umfänge (Brust, Taille, Hüfte, Oberschenkel, Oberarm) werden × 2 gerechnet,
// Breiten und Längen (Schulter, Armlänge, Gesamtlänge) bleiben, wie sie sind.

import type { AermelTyp, Artikel as EmpfehlungsArtikel, BundTyp, Konfiguration, Passform } from "@ommetryx/empfehlung";
import { PASSFORMEN } from "@ommetryx/empfehlung";

export const MASSFELDER = [
  { feld: "brust", beschriftung: "Brust", umfang: true },
  { feld: "taille", beschriftung: "Taille", umfang: true },
  { feld: "huefte", beschriftung: "Hüfte", umfang: true },
  { feld: "oberschenkel", beschriftung: "Oberschenkel", umfang: true },
  { feld: "oberarm", beschriftung: "Oberarm", umfang: true },
  { feld: "schulter", beschriftung: "Schulter", umfang: false },
  { feld: "armlaenge", beschriftung: "Ärmellänge", umfang: false },
  { feld: "gesamtlaenge", beschriftung: "Gesamtlänge", umfang: false },
] as const;

export type Massfeld = (typeof MASSFELDER)[number]["feld"];
export type Masse = Partial<Record<Massfeld, number>>;

/**
 * Plausible Spannen je Maß in cm (nach dem × 2), für Damen- und Herrenmode inkl. Übergrößen.
 * Werte außerhalb ergeben den Fehler „unrealistisches_ergebnis“ (Fehlercode aus v3).
 * Nur Eingabeprüfung, keine Empfehlungslogik.
 */
export const PLAUSIBEL: Record<Massfeld, [number, number]> = {
  brust: [60, 200],
  taille: [40, 200],
  huefte: [60, 220],
  oberschenkel: [30, 120],
  oberarm: [15, 70],
  schulter: [25, 70],
  armlaenge: [10, 100],
  gesamtlaenge: [20, 200],
};

export const BUND_TYPEN: BundTyp[] = ["fest", "stretch", "gummizug"];
export const AERMEL_TYPEN: AermelTyp[] = ["eingesetzt", "ueberschnitten", "ohne"];
export const SCHNITT_QUELLEN = ["manuell", "automatisch", "haendler"] as const;

export interface GroesseEingabe {
  groesse: string;
  shopifyVarianteId: string | null;
  reihenfolge: number;
  /** Eingabe wie gemessen (flach bzw. Länge). */
  flach: Masse;
}

export interface ErfassungEingabe {
  artikelart: string;
  schnitt: string;
  materialDehnungProzent: number | null;
  materialZusammensetzung: string | null;
  tailliert: boolean;
  bundTyp: string | null;
  aermelTyp: string | null;
  messhoeheBrustCm: number | null;
  groessen: GroesseEingabe[];
}

export interface GeprüfterArtikel {
  artikelart: string;
  schnitt: Passform;
  schnittQuelle: "manuell";
  materialDehnungProzent: number;
  materialZusammensetzung: string | null;
  tailliert: boolean;
  bundTyp: BundTyp | null;
  aermelTyp: AermelTyp | null;
  messhoeheBrustCm: number;
  groessen: { groesse: string; shopifyVarianteId: string | null; reihenfolge: number; masse: Masse }[];
}

export type Pruefergebnis =
  | { ok: true; artikel: GeprüfterArtikel; hinweise: string[] }
  | { ok: false; fehler: Record<string, string>; hinweise: string[] };

/** Zahl aus einem Formularfeld, Komma erlaubt. Leer → null, Unsinn → NaN. */
export function zahlAusFeld(wert: FormDataEntryValue | null | undefined): number | null {
  if (wert === null || wert === undefined) return null;
  const text = String(wert).trim().replace(",", ".");
  if (text === "") return null;
  return /^-?\d+(\.\d+)?$/.test(text) ? Number(text) : Number.NaN;
}

export function feldname(index: number, feld: Massfeld) {
  return `g${index}_${feld}`;
}

/** Liest das Formular der Erfassungsmaske. Die Größen kommen aus dem Shopify-Produkt (versteckte Felder). */
export function eingabeAusFormular(form: FormData): ErfassungEingabe {
  const anzahl = Number(form.get("anzahl_groessen") ?? 0);
  const groessen: GroesseEingabe[] = [];
  for (let i = 0; i < anzahl; i++) {
    const flach: Masse = {};
    for (const { feld } of MASSFELDER) {
      const wert = zahlAusFeld(form.get(feldname(i, feld)));
      if (wert !== null) flach[feld] = wert;
    }
    groessen.push({
      groesse: String(form.get(`g${i}_groesse`) ?? ""),
      shopifyVarianteId: (form.get(`g${i}_variante`) as string | null) || null,
      reihenfolge: i,
      flach,
    });
  }
  const text = (name: string) => {
    const wert = String(form.get(name) ?? "").trim();
    return wert === "" ? null : wert;
  };
  return {
    artikelart: String(form.get("artikelart") ?? ""),
    schnitt: String(form.get("schnitt") ?? ""),
    materialDehnungProzent: zahlAusFeld(form.get("material_dehnung_prozent")),
    materialZusammensetzung: text("material_zusammensetzung"),
    tailliert: form.get("tailliert") === "ja",
    bundTyp: text("bund_typ"),
    aermelTyp: text("aermel_typ"),
    messhoeheBrustCm: zahlAusFeld(form.get("messhoehe_brust_cm")),
    groessen,
  };
}

/** Prüft die Eingabe und rechnet Flachmaße in Umfänge um. */
export function pruefeErfassung(eingabe: ErfassungEingabe, k: Konfiguration): Pruefergebnis {
  const fehler: Record<string, string> = {};
  const hinweise: string[] = [];

  if (!k.artikelarten.includes(eingabe.artikelart)) fehler.artikelart = "Bitte eine Artikelart wählen.";
  if (!PASSFORMEN.includes(eingabe.schnitt as Passform)) fehler.schnitt = "Bitte den Schnitt wählen.";

  const dehnung = eingabe.materialDehnungProzent;
  if (dehnung === null || Number.isNaN(dehnung) || dehnung < 0 || dehnung > 200) {
    fehler.material_dehnung_prozent = "Bitte die gemessene Querdehnung in Prozent eintragen (0 bis 200).";
  }
  if (eingabe.bundTyp !== null && !BUND_TYPEN.includes(eingabe.bundTyp as BundTyp)) fehler.bund_typ = "Unbekannter Bund-Typ.";
  if (eingabe.aermelTyp !== null && !AERMEL_TYPEN.includes(eingabe.aermelTyp as AermelTyp)) fehler.aermel_typ = "Unbekannter Ärmel-Typ.";

  const messhoehe = eingabe.messhoeheBrustCm ?? 2.5;
  if (Number.isNaN(messhoehe) || messhoehe < 0 || messhoehe > 10) fehler.messhoehe_brust_cm = "Messhöhe zwischen 0 und 10 cm.";

  if (eingabe.groessen.length === 0) fehler.groessen = "Das Produkt hat keine Größen. Bitte in Shopify eine Größen-Option anlegen.";

  // Pflichtmaße: Primärmaß der Artikelart, bei Röcken und Hosen auch die Taille (außer Gummizug).
  const pflicht: Massfeld[] = [];
  if (!fehler.artikelart) {
    const art = k.artikelart(eingabe.artikelart);
    pflicht.push(art.primaermass);
    if (art.primaermass === "huefte" && art.messpunkte.taille && eingabe.bundTyp !== "gummizug") pflicht.push("taille");
    if (art.messpunkte.taille?.nach_bund && eingabe.bundTyp === null) fehler.bund_typ = "Bitte den Bund-Typ wählen.";
  }

  const groessen = eingabe.groessen.map((g, index) => {
    const masse: Masse = {};
    for (const { feld, umfang, beschriftung } of MASSFELDER) {
      const wert = g.flach[feld];
      const name = feldname(index, feld);
      if (wert === undefined) {
        if (pflicht.includes(feld)) fehler[name] = `${beschriftung} fehlt (Pflicht für diese Artikelart).`;
        continue;
      }
      if (Number.isNaN(wert)) {
        fehler[name] = "Bitte eine Zahl eintragen, z. B. 52 oder 52,5.";
        continue;
      }
      const cm = umfang ? wert * 2 : wert;
      const [min, max] = PLAUSIBEL[feld];
      if (cm < min || cm > max) {
        fehler[name] = `unrealistisches_ergebnis: ${beschriftung} ${umfang ? `(Umfang ${cm} cm) ` : ""}liegt außerhalb ${min}–${max} cm.`;
        continue;
      }
      masse[feld] = cm;
    }
    return { groesse: g.groesse, shopifyVarianteId: g.shopifyVarianteId, reihenfolge: g.reihenfolge, masse };
  });

  // Hinweis (kein Fehler): Maße sollten von Größe zu Größe wachsen.
  for (const { feld, beschriftung } of MASSFELDER) {
    for (let i = 1; i < groessen.length; i++) {
      const vorher = groessen[i - 1]!.masse[feld];
      const jetzt = groessen[i]!.masse[feld];
      if (vorher !== undefined && jetzt !== undefined && jetzt <= vorher) {
        hinweise.push(`${beschriftung}: Größe ${groessen[i]!.groesse} ist nicht größer als ${groessen[i - 1]!.groesse}. Bitte nachmessen.`);
      }
    }
  }

  if (Object.keys(fehler).length > 0) return { ok: false, fehler, hinweise };
  return {
    ok: true,
    hinweise,
    artikel: {
      artikelart: eingabe.artikelart,
      schnitt: eingabe.schnitt as Passform,
      schnittQuelle: "manuell",
      materialDehnungProzent: dehnung!,
      materialZusammensetzung: eingabe.materialZusammensetzung,
      tailliert: eingabe.tailliert,
      bundTyp: eingabe.bundTyp as BundTyp | null,
      aermelTyp: eingabe.aermelTyp as AermelTyp | null,
      messhoeheBrustCm: messhoehe,
      groessen,
    },
  };
}

/** Gespeicherter Artikel → Eingabe für das Empfehlungsmodul. */
export function alsEmpfehlungsArtikel(a: {
  artikelart: string;
  schnitt: string;
  materialDehnungProzent: number;
  tailliert: boolean;
  bundTyp: string | null;
  aermelTyp: string | null;
  groessen: ({ groesse: string; reihenfolge: number } & Partial<Record<Massfeld, number | null>>)[];
}): EmpfehlungsArtikel {
  return {
    artikelart: a.artikelart,
    schnitt: a.schnitt as Passform,
    material_dehnung_prozent: a.materialDehnungProzent,
    tailliert: a.tailliert,
    bund_typ: (a.bundTyp ?? undefined) as BundTyp | undefined,
    aermel_typ: (a.aermelTyp ?? undefined) as AermelTyp | undefined,
    groessen: [...a.groessen]
      .sort((x, y) => x.reihenfolge - y.reihenfolge)
      .map((g) => ({
        groesse: g.groesse,
        masse: Object.fromEntries(
          MASSFELDER.flatMap(({ feld }) => (g[feld] === null || g[feld] === undefined ? [] : [[feld, g[feld]]])),
        ),
      })),
  };
}

/**
 * Größen aus einem Shopify-Produkt: Option „Größe“/„Size“ (oder die einzige Option),
 * in der Reihenfolge der Optionswerte, je Wert die erste passende Variante.
 */
export function groessenAusProdukt(produkt: {
  options: { name: string; optionValues: { name: string }[] }[];
  variants: { nodes: { id: string; selectedOptions: { name: string; value: string }[] }[] };
}): { groesse: string; shopifyVarianteId: string | null }[] {
  const option =
    produkt.options.find((o) => /^(gr(ö|oe)(ß|ss)e|size|konfektionsgr)/i.test(o.name.trim())) ??
    // Einzige Option, aber nicht Shopifys Platzhalter „Title“ bei Produkten ohne Varianten.
    (produkt.options.length === 1 && produkt.options[0]!.name !== "Title" ? produkt.options[0] : undefined);
  if (!option) return [];
  return option.optionValues.map(({ name }) => ({
    groesse: name,
    shopifyVarianteId:
      produkt.variants.nodes.find((v) => v.selectedOptions.some((s) => s.name === option.name && s.value === name))?.id ?? null,
  }));
}
