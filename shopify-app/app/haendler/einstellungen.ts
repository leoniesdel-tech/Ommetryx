// Einstellungen des Händlers (Figma H05 „Allgemein“, H10 „Button-Design“). Ohne Server-Code.
// Das Größen-Fenster selbst bleibt immer im Ommetryx-Design; anpassbar ist nur der Einstiegs-Button.

import { z } from "zod";
import { gerundet, istHexFarbe, kontrastZumHintergrund, kontrast, schriftfarbe } from "./kontrast";

export const MODI = ["theme", "ommetryx", "eigen"] as const;
export const DARSTELLUNGEN = ["gefuellt", "umrandet", "link"] as const;
export const ECKEN = ["eckig", "leicht", "rund", "pille"] as const;
export const SYMBOLE = ["logo", "logo_einfarbig", "massband", "keins"] as const;

export const RADIUS: Record<(typeof ECKEN)[number], number> = { eckig: 0, leicht: 8, rund: 12, pille: 999 };

export const einstellungenSchema = z.object({
  buttonText: z.string().trim().min(1, "Bitte geben Sie einen Text ein.").max(40, "Höchstens 40 Zeichen."),
  ansprache: z.enum(["sie", "du"]),
  datenschutzLink: z
    .string()
    .trim()
    .max(300)
    .refine((v) => v === "" || /^https:\/\/[^\s"'<>]+$/.test(v), "Bitte eine vollständige Adresse mit https:// eingeben."),
  modus: z.enum(MODI),
  darstellung: z.enum(DARSTELLUNGEN),
  farbe: z.string().refine(istHexFarbe, "Bitte eine Farbe im Format #RRGGBB wählen."),
  ecken: z.enum(ECKEN),
  symbol: z.enum(SYMBOLE),
});

export type Einstellungen = z.infer<typeof einstellungenSchema>;

export const STANDARD: Einstellungen = {
  buttonText: "Meine Größe finden",
  ansprache: "sie",
  datenschutzLink: "",
  modus: "theme",
  darstellung: "umrandet",
  farbe: "#0C3A4A",
  ecken: "rund",
  symbol: "logo",
};

/** Gespeicherte Werte (evtl. alt oder unvollständig) mit Standardwerten auffüllen. */
export function mitStandard(roh: unknown): Einstellungen {
  const werte = roh && typeof roh === "object" ? (roh as Record<string, unknown>) : {};
  const ergebnis: Record<string, unknown> = { ...STANDARD };
  // Jedes Feld einzeln: ein kaputter Wert setzt nicht alle anderen zurück.
  for (const [feld, schema] of Object.entries(einstellungenSchema.shape)) {
    const teil = schema.safeParse(werte[feld]);
    if (teil.success) ergebnis[feld] = teil.data;
  }
  return ergebnis as Einstellungen;
}

export interface Pruefung {
  text: number;
  rahmen: number;
  hoehe: number;
  ok: boolean;
}

/**
 * Lesbarkeit des Buttons. Nur bei „Eigene Gestaltung“ wählt der Händler die Farbe;
 * „Wie mein Theme“ und „Ommetryx Standard“ sind vorgegeben und gelten als geprüft.
 */
export function pruefeButton(e: Einstellungen): Pruefung {
  const hoehe = 48;
  if (e.modus !== "eigen") return { text: 21, rahmen: 21, hoehe, ok: true };
  const rahmen = kontrastZumHintergrund(e.farbe);
  // Gefüllt: Schrift (Schwarz/Weiß) auf der Farbe. Umrandet/Link: Schrift in der Farbe auf dem Hintergrund.
  const text = e.darstellung === "gefuellt" ? kontrast(e.farbe, schriftfarbe(e.farbe)) : rahmen;
  return { text: gerundet(text), rahmen: gerundet(rahmen), hoehe, ok: text >= 4.5 && rahmen >= 3 };
}

/** Was der Block im Shop braucht (als App-Metafeld gespeichert, ohne Datenschutz-Link und Ansprache). */
export function fuerBlock(e: Einstellungen) {
  return {
    text: e.buttonText,
    modus: e.modus,
    darstellung: e.darstellung,
    farbe: e.farbe,
    schrift: e.darstellung === "gefuellt" ? schriftfarbe(e.farbe) : e.farbe,
    radius: RADIUS[e.ecken],
    symbol: e.symbol,
  };
}
