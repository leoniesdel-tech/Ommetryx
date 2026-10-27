// Texte für den Händler-Bereich im Shopify-Admin. Händler werden mit „Sie“ angesprochen.
// AVV: Entwurf, noch nicht anwaltlich geprüft (CLAUDE.md Abschnitt 9). Neue Fassung → neue Version,
// dann müssen Händler erneut bestätigen.

export const AVV = {
  version: "entwurf-2026-10-27",
  titel: "Auftragsverarbeitungsvertrag (AVV)",
  kurz:
    "Ommetryx verarbeitet in Ihrem Auftrag die Körpermaße Ihrer Kundinnen und Kunden, um Größen zu empfehlen. " +
    "Die Daten liegen in der EU, getrennt von E-Mail-Adressen und verschlüsselt. Sie sehen keine Körpermaße, nur zusammengefasste Zahlen.",
  zustimmung: "Ich habe den Auftragsverarbeitungsvertrag gelesen und schließe ihn im Namen meines Shops ab.",
} as const;

export const BLOCK_HANDLE = "groessenberater";
export const EXTENSION_HANDLE = "ommetryx-widget";
