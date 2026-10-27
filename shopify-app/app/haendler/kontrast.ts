// Lesbarkeits-Check für den Button im Shop (Figma H10, CLAUDE.md Abschnitt 6):
// Schrift ≥ 4,5 : 1 (Schwarz oder Weiß wählen wir automatisch), Rahmen/Fläche ≥ 3 : 1 zum Hintergrund,
// Höhe ≥ 44 px, Fokusring nie abschaltbar. Formeln nach WCAG 2.2 (relative Leuchtdichte).
//
// Den echten Seitenhintergrund des Shops kennen wir nicht (dafür bräuchte die App das Recht, das Theme
// zu lesen). Wir prüfen gegen Weiß und gegen Linen und nehmen den schlechteren Wert.

export const HINTERGRUENDE = { weiss: "#FFFFFF", linen: "#F6F4EF" } as const;

export function istHexFarbe(wert: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(wert);
}

function kanal(c: number) {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function leuchtdichte(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * kanal((n >> 16) & 255) + 0.7152 * kanal((n >> 8) & 255) + 0.0722 * kanal(n & 255);
}

export function kontrast(a: string, b: string): number {
  const [hell, dunkel] = [leuchtdichte(a), leuchtdichte(b)].sort((x, y) => y - x) as [number, number];
  return (hell + 0.05) / (dunkel + 0.05);
}

/** Schwarz oder Weiß – was auf der Farbe besser lesbar ist. */
export function schriftfarbe(flaeche: string): "#000000" | "#FFFFFF" {
  return kontrast(flaeche, "#000000") >= kontrast(flaeche, "#FFFFFF") ? "#000000" : "#FFFFFF";
}

/** Schlechtester Kontrast einer Farbe zu den möglichen Seitenhintergründen. */
export function kontrastZumHintergrund(farbe: string): number {
  return Math.min(...Object.values(HINTERGRUENDE).map((h) => kontrast(farbe, h)));
}

export const gerundet = (wert: number) => Math.floor(wert * 10) / 10;
