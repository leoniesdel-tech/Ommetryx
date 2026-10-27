// Texte der Mess-Schritte, mit „Sie“ und mit „du“ (stellt der Händler ein). Hier zentral, damit sie leicht zu ändern sind.
// Videos folgen später; bis dahin zeigt das Widget einen Platzhalter mit der Beschreibung.

import type { Feld } from "./eingaben";

export interface SchrittText {
  kurz: string;
  frage: string;
  warum: string;
  tipp: string;
  video: string;
}

export const SCHRITTE: Record<Feld, SchrittText> = {
  koerpergroesse: {
    kurz: "Größe",
    frage: "Ihre Körpergröße",
    warum: "Damit Ärmel und Länge zu Ihnen passen.",
    tipp: "Ohne Schuhe mit dem Rücken an eine Wand stellen, Blick geradeaus. Ein Buch flach auf den Kopf legen, an der Wand markieren und von unten messen.",
    video: "Körpergröße messen · 15 Sek. · mit Untertiteln",
  },
  brust: {
    kurz: "Brust",
    frage: "Ihr Brustumfang",
    warum: "Damit das Teil an der Brust weder spannt noch schlabbert.",
    tipp: "Das Maßband waagerecht über die stärkste Stelle der Brust führen, unter den Armen hindurch. Normal ausatmen, das Band anliegen lassen, nicht straff ziehen. Am besten mit dem BH, den Sie meist tragen.",
    video: "Brustumfang messen · 15 Sek. · mit Untertiteln",
  },
  huefte: {
    kurz: "Hüfte",
    frage: "Ihr Hüftumfang",
    warum: "Die Hüfte entscheidet bei Kleidern, Röcken und Hosen.",
    tipp: "Füße zusammenstellen, das Band waagerecht um die breiteste Stelle des Pos legen. Die Hüfte wird am häufigsten zu klein gemessen: im Spiegel prüfen, dass das Band rundherum gerade liegt.",
    video: "Hüftumfang messen · 15 Sek. · mit Untertiteln",
  },
  taille: {
    kurz: "Taille",
    frage: "Ihr Taillenumfang",
    warum: "Damit taillierte Teile, Röcke und Hosen am Bund gut sitzen.",
    tipp: "An der schmalsten Stelle messen, meist etwas über dem Bauchnabel. Normal ausatmen, den Bauch nicht einziehen.",
    video: "Taillenumfang messen · 15 Sek. · mit Untertiteln",
  },
};

export const SCHRITTE_DU: Record<Feld, SchrittText> = {
  koerpergroesse: {
    ...SCHRITTE.koerpergroesse,
    frage: "Deine Körpergröße",
    warum: "Damit Ärmel und Länge zu dir passen.",
  },
  brust: {
    ...SCHRITTE.brust,
    frage: "Dein Brustumfang",
    tipp: "Das Maßband waagerecht über die stärkste Stelle der Brust führen, unter den Armen hindurch. Normal ausatmen, das Band anliegen lassen, nicht straff ziehen. Am besten mit dem BH, den du meist trägst.",
  },
  huefte: { ...SCHRITTE.huefte, frage: "Dein Hüftumfang" },
  taille: { ...SCHRITTE.taille, frage: "Dein Taillenumfang" },
};

export const schrittTexte = (du: boolean) => (du ? SCHRITTE_DU : SCHRITTE);

export const MESS_HINWEIS = "Zu zweit messen ist genauer. Jedes Maß am besten zweimal messen.";
