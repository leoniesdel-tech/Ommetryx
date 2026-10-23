// Eingaben und Ausgaben der Empfehlungslogik (v3).
// Alle Maße in cm. Kleidungsmaße sind Umfänge (Flachmaß × 2).

export const PASSFORMEN = ["koerpernah", "regulaer", "locker", "oversized"] as const;
export type Passform = (typeof PASSFORMEN)[number];

export const MESSPUNKTE = ["brust", "taille", "huefte", "oberschenkel", "oberarm"] as const;
export type Messpunkt = (typeof MESSPUNKTE)[number];

export type BundTyp = "fest" | "stretch" | "gummizug";
export type AermelTyp = "eingesetzt" | "ueberschnitten" | "ohne";

/** Körpermaße der Kundin. Pflicht: koerpergroesse, brust, huefte. Taille ab Röcken/Hosen Pflicht. */
export interface Koerpermasse {
  koerpergroesse: number;
  brust: number;
  huefte: number;
  taille?: number;
  oberschenkel?: number;
  oberarm?: number;
  armlaenge?: number;
  /** Schulterbreite eines gut sitzenden eigenen Teils (flach, Naht zu Naht). */
  schulterbreite_referenz?: number;
}

/** Figur-Angaben. Werden angenommen, wirken aber noch nicht (offene Frage: Regeln aus v2 fehlen). */
export interface Figur {
  schultern?: "schmaler" | "gleich" | "breiter" | "weiss_nicht";
  bauch?: "flach" | "mittel" | "betont" | "weiss_nicht";
  po?: "flach" | "mittel" | "betont" | "weiss_nicht";
  oberschenkel?: "schmaler" | "gleich" | "kraeftiger" | "weiss_nicht";
}

export interface Kleidungsmasse {
  brust?: number;
  taille?: number;
  huefte?: number;
  oberschenkel?: number;
  oberarm?: number;
  schulter?: number;
  armlaenge?: number;
  gesamtlaenge?: number;
}

export interface ArtikelGroesse {
  groesse: string;
  masse: Kleidungsmasse;
}

export interface Artikel {
  /** Schlüssel aus ergaenzungen-v3.json → artikelarten, z. B. "web_oberteil". */
  artikelart: string;
  schnitt: Passform;
  material_dehnung_prozent: number;
  tailliert: boolean;
  bund_typ?: BundTyp;
  aermel_typ?: AermelTyp;
  /** Größen in ihrer Reihenfolge, von klein nach groß. */
  groessen: ArtikelGroesse[];
}

export interface Anfrage {
  koerper: Koerpermasse;
  artikel: Artikel;
  passform: Passform;
  figur?: Figur;
  /** Persönlicher Offset je Zone in cm (aus Rückmeldungen), wird auf die Ziel-Mitte addiert. */
  offsets?: Partial<Record<Messpunkt, number>>;
  /** Verschiebung der Ziel-Mitte für diesen Artikel in cm (aus Rückmeldungen aller Kundinnen). */
  artikel_verschiebung?: Partial<Record<Messpunkt, number>>;
}

export type Bewertung = "passt" | "zu_eng" | "zu_weit";

export interface ZonenErgebnis {
  messpunkt: Messpunkt | "schulter" | "aermellaenge";
  /** Kleidungsmaß − Körpermaß. */
  mehrweite: number;
  /** Ziel-Mitte nach Begrenzung, Umrechnung, Dehnung und Offsets. null bei reiner Mindestprüfung. */
  ziel_mitte: number | null;
  /** Halbe Breite der straffreien Zone. */
  zone_halbbreite: number;
  mindest: number | null;
  gewicht: number;
  strafe: number;
  bewertung: Bewertung;
  unter_mindest: boolean;
  /** Die Passform-Wahl der Kundin wurde durch den Schnitt des Artikels begrenzt. */
  begrenzt_durch_schnitt: boolean;
}

export type Ausschlussgrund = "unter_mindest" | "schulter_zu_schmal";

export interface GroessenErgebnis {
  groesse: string;
  score: number;
  ausgeschlossen: boolean;
  ausschlussgruende: Ausschlussgrund[];
  zonen: ZonenErgebnis[];
}

export type Status = "empfohlen" | "unsicher" | "keine_passende_groesse";

export interface Ergebnis {
  recommended_size: string | null;
  confidence: number;
  alternative_size: string | null;
  status: Status;
  begrenzt_durch_schnitt: boolean;
  /** Alle Größen mit Zonen, z. B. für „So säße L“ und die Ansicht je Zone. */
  groessen: GroessenErgebnis[];
}

/** Fehler ohne Messwerte in der Nachricht (Datenschutz: keine Maße in Fehlermeldungen). */
export class EmpfehlungsFehler extends Error {
  readonly code: string;
  constructor(code: string, nachricht: string) {
    super(nachricht);
    this.name = "EmpfehlungsFehler";
    this.code = code;
  }
}
