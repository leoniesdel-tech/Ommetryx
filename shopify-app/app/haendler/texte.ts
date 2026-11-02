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

// Datenschutz & Verträge (Figma H07). Platzhalter in [eckigen Klammern] sind noch nicht festgelegt.
// Alles Entwurf, noch nicht anwaltlich geprüft. Händler sehen nur zusammengefasste Zahlen (CLAUDE.md Abschnitt 9).
export const VERTRAEGE = [
  { titel: "Technische und organisatorische Maßnahmen (TOMs)", hinweis: "Entwurf folgt" },
  { titel: "AGB Ommetryx für Händler", hinweis: "Entwurf folgt, inkl. Haftung beim Muster-Versand" },
  { titel: "Impressum Ommetryx", hinweis: "[Firma, Anschrift, Kontakt]" },
] as const;

export const UNTERAUFTRAGNEHMER = [
  { name: "Render", zweck: "Server und Datenbank", ort: "Rechenzentrum Frankfurt (EU), Anbieter aus den USA" },
  { name: "Brevo", zweck: "E-Mails mit Anmelde-Code", ort: "EU" },
  { name: "[Monitoring-Dienst]", zweck: "Fehlerüberwachung, ohne Körpermaße", ort: "wird noch festgelegt" },
] as const;

export const TEXTBAUSTEINE = {
  datenschutz: {
    titel: "Datenschutzerklärung",
    text:
      "Größenberatung: Wir nutzen den Dienst Ommetryx ([Firma, Anschrift]), um Ihnen passende Größen zu empfehlen. " +
      "Dafür werden Ihre Körpermaße nur mit Ihrer ausdrücklichen Einwilligung verarbeitet und in der EU gespeichert. " +
      "Wir als Shop sehen keine Körpermaße, sondern nur zusammengefasste Zahlen. " +
      "[Rechtsgrundlage, Speicherdauer, Widerruf ergänzen.]",
  },
  barrierefreiheit: {
    titel: "Barrierefreiheit",
    text:
      "Die Größenberatung von Ommetryx in unserem Shop wird nach den Vorgaben der WCAG 2.2 AA entwickelt. " +
      "[Stand der Prüfung und Kontakt für Rückmeldungen ergänzen.]",
  },
} as const;

// Hilfe (Figma H08).
export const FRAGEN = [
  {
    frage: "Wie lange dauert die Vermessung?",
    antwort: "Das hängt von der Zahl der Artikel ab. Sobald die Muster bei uns sind, nennen wir Ihnen einen Termin. Den Stand sehen Sie unter „Muster-Versand“.",
  },
  {
    frage: "Warum sehe ich den Button nicht im Shop?",
    antwort:
      "Der Button erscheint nur bei Artikeln mit Status „Live“. Außerdem muss der Auftragsverarbeitungsvertrag bestätigt und der Ommetryx-Block im Theme-Editor eingefügt und gespeichert sein. Die Startseite zeigt Ihnen, welcher Schritt noch fehlt.",
  },
  {
    frage: "Wie kommen neue Produkte dazu?",
    antwort: "Merken Sie die Produkte unter „Produkte“ zur Vermessung vor und schicken Sie uns unter „Muster-Versand“ eine Anfrage. Nach der Vermessung stehen sie auf „Live“.",
  },
  {
    frage: "Sehe ich die Körpermaße meiner Kundinnen und Kunden?",
    antwort: "Nein. Sie sehen weder Körper- noch Kleidungsmaße, sondern nur zusammengefasste Zahlen, und auch die erst ab einer Mindestgruppe.",
  },
  {
    frage: "Wie werden die Retouren-Zahlen berechnet?",
    antwort: "Geplant ist ein Vergleich von Bestellungen mit und ohne Ommetryx. Diese Auswertung ist noch nicht verfügbar.",
  },
  {
    frage: "Was passiert bei der Deinstallation?",
    antwort: "Der Button verschwindet aus Ihrem Shop, und der Auftragsverarbeitungsvertrag endet. Bei einer neuen Installation bestätigen Sie ihn erneut.",
  },
] as const;
