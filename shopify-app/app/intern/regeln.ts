// Regeln des Team-Logins, die auch die Seiten im Browser kennen dürfen (keine Geheimnisse).

export const MAX_FEHLVERSUCHE = 5;
export const SPERRE_MINUTEN = 15;
export const SITZUNG_STUNDEN = 8;
export const EINLADUNG_STUNDEN = 24;
export const MIN_PASSWORT_LAENGE = 12;

export type EinrichtungsFehler = "einladung_ungueltig" | "passwort_zu_kurz" | "passwoerter_ungleich" | "code_falsch";
