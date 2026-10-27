// Silhouette für „Passform je Zone“ (Figma E09b): schlichtes Kleidungsstück mit Streifen je Zone.
// Nur Bild (aria-hidden); dieselbe Aussage steht als Text neben den Skalen.

import type { GroessenAnsicht, Zone } from "./ergebnis";

const HOEHE: Record<Zone, number> = { brust: 46, taille: 82, huefte: 116, oberschenkel: 146, oberarm: 30 };

export function silhouette(g: GroessenAnsicht, _primaer: Zone): string {
  const streifen = g.zonen
    .map((z) => {
      const klasse = z.bewertung === "passt" ? "passt" : z.bewertung === "zu_eng" ? "eng" : "weit";
      // Oberarm als kurzer Streifen am Ärmel, alle anderen quer über den Körper.
      return z.zone === "oberarm"
        ? `<rect class="${klasse}" x="9" y="${HOEHE.oberarm}" width="14" height="6" rx="3" transform="rotate(33 16 ${HOEHE.oberarm + 3})"/>`
        : `<rect class="${klasse}" x="28" y="${HOEHE[z.zone]}" width="44" height="6" rx="3"/>`;
    })
    .join("");
  return `<svg class="silhouette" viewBox="0 0 100 166" aria-hidden="true" focusable="false">
      <path class="umriss" d="M38 6 Q50 14 62 6 L72 9 L93 24 L84 42 L74 35 L74 160 L26 160 L26 35 L16 42 L7 24 L28 9 Z"/>
      ${streifen}
    </svg>`;
}
