// Einwilligungstexte mit Version. Der Server speichert, welche Version bestätigt wurde.
// ENTWURF: noch nicht anwaltlich geprüft (CLAUDE.md Abschnitt 9). Bei jeder Textänderung die Version erhöhen.
// Wird auch ins Widget gebündelt – keine Geheimnisse hier.

export const EINWILLIGUNGEN = {
  verarbeitung: {
    version: "entwurf-1",
    text: "Ich willige ein, dass Ommetryx meine Körpermaße verarbeitet, um mir eine Größe zu empfehlen. Körpermaße können Rückschlüsse auf meine Gesundheit zulassen. Ohne Profil werden die Maße nicht gespeichert. Ich kann die Einwilligung jederzeit widerrufen.",
  },
  profil: {
    version: "entwurf-1",
    text: "Ich willige ein, dass Ommetryx meine Körpermaße und meine E-Mail-Adresse speichert, um mir in allen Shops mit Ommetryx Größen zu empfehlen. Die Maße werden verschlüsselt und getrennt von meiner E-Mail-Adresse gespeichert. Neue Maße überschreiben die alten. Ich kann die Einwilligung jederzeit unter „Mein Ommetryx“ widerrufen; dann wird mein Profil sofort gelöscht. Nach 24 Monaten ohne Nutzung wird es automatisch gelöscht.",
  },
  alter16: {
    version: "entwurf-1",
    text: "Ich bin mindestens 16 Jahre alt.",
  },
} as const;

export type Zweck = "verarbeitung" | "profil";

export const ALTERSGRUPPEN = ["16-29", "30-44", "45-59", "60+"] as const;
export type Altersgruppe = (typeof ALTERSGRUPPEN)[number];
