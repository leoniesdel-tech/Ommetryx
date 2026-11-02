// Nutzungszahlen für die Startseite (Figma H02). Ohne Server-Code.
// Nur Tageszähler je Shop: keine Kennung, keine Cookies, keine Maße (CLAUDE.md Abschnitt 9).
// Zahlen unter der Mindestgruppe zeigen wir Händlern nicht.

export const NUTZUNG_ARTEN = ["widget_geoeffnet", "empfehlung_berechnet", "groesse_uebernommen"] as const;
export type NutzungArt = (typeof NUTZUNG_ARTEN)[number];

export const NUTZUNG_TEXT: Record<NutzungArt, string> = {
  widget_geoeffnet: "Größenberater geöffnet",
  empfehlung_berechnet: "Größe berechnet",
  groesse_uebernommen: "Größe übernommen",
};

export const MINDESTGRUPPE = 20;
export const ZEITRAUM_TAGE = 30;

/** null = unter der Mindestgruppe, wird nicht angezeigt. */
export function fuerAnzeige(summen: Partial<Record<NutzungArt, number>>): Record<NutzungArt, number | null> {
  const wert = (art: NutzungArt) => {
    const zahl = summen[art] ?? 0;
    return zahl >= MINDESTGRUPPE ? zahl : null;
  };
  return { widget_geoeffnet: wert("widget_geoeffnet"), empfehlung_berechnet: wert("empfehlung_berechnet"), groesse_uebernommen: wert("groesse_uebernommen") };
}
