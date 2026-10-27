// Texte und Skalen für das Ergebnis-Fenster (Figma E09, E09b, E10, E38).
// Rein rechnend, gut testbar. Das Wort „Mehrweite“ kommt gegenüber Kundinnen nie vor, nur „Spielraum“.
// Die Daten kommen gekürzt vom Server (app/widget/ansicht.ts).

export type Passform = "koerpernah" | "regulaer" | "locker" | "oversized";
export type Zone = "brust" | "taille" | "huefte" | "oberschenkel" | "oberarm";
export type Bewertung = "passt" | "zu_eng" | "zu_weit";

export interface ZonenAnsicht {
  zone: Zone;
  spielraum: number;
  lage: number;
  bewertung: Bewertung;
}

export interface GroessenAnsicht {
  groesse: string;
  variante: string | null;
  zonen: ZonenAnsicht[];
}

export interface WidgetErgebnis {
  status: "empfohlen" | "unsicher" | "keine_passende_groesse";
  recommended_size: string | null;
  alternative_size: string | null;
  confidence: number;
  begrenzt_durch_schnitt: boolean;
  passform: Passform;
  schnitt: Passform;
  primaer: Zone;
  haupt: GroessenAnsicht | null;
  vergleich: GroessenAnsicht | null;
}

const ZONEN: Record<Zone, { name: string; an: string }> = {
  brust: { name: "Brust", an: "an der Brust" },
  taille: { name: "Taille", an: "an der Taille" },
  huefte: { name: "Hüfte", an: "an der Hüfte" },
  oberschenkel: { name: "Oberschenkel", an: "am Oberschenkel" },
  oberarm: { name: "Oberarm", an: "am Oberarm" },
};

const PASSFORM: Record<Passform, { wort: string; eine: string }> = {
  koerpernah: { wort: "körpernah", eine: "eine körpernahe Passform" },
  regulaer: { wort: "regulär", eine: "eine reguläre Passform" },
  locker: { wort: "locker", eine: "eine lockere Passform" },
  oversized: { wort: "oversized", eine: "eine Oversized-Passform" },
};

const BEWERTUNG: Record<Bewertung, string> = {
  passt: "sitzt wie gewünscht",
  zu_eng: "enger als gewünscht",
  zu_weit: "weiter als gewünscht",
};

const gross = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
export const cm = (wert: number) => `${Math.abs(wert).toLocaleString("de-DE", { maximumFractionDigits: 1 })} cm`;

export const zonenName = (zone: Zone) => ZONEN[zone].name;
export const passformWort = (p: Passform) => PASSFORM[p].wort;
export const bewertungText = (b: Bewertung) => BEWERTUNG[b];

/** „8 cm Spielraum“; bei dehnbaren Teilen kann das Teil schmaler sein als der Körper. */
export function spielraumText(z: ZonenAnsicht): string {
  if (z.spielraum < 0) return `${cm(z.spielraum)} schmaler, dehnt sich`;
  if (z.spielraum === 0) return "liegt genau an";
  return `${cm(z.spielraum)} Spielraum`;
}

/** Position der Markierung auf der Skala in Prozent (0 = eng, 100 = weit). */
export function skalaProzent(lage: number): number {
  return Math.round((50 + Math.max(-1, Math.min(1, lage)) * 50) * 10) / 10;
}

export function sicherheitText(konfidenz: number): string {
  return konfidenz >= 80 ? "sehr sicher" : "recht sicher";
}

const wichtigste = (g: GroessenAnsicht, primaer: Zone) => g.zonen.find((z) => z.zone === primaer) ?? g.zonen[0] ?? null;

/** Kurzer Satz unter der Größe, z. B. „Sitzt regulär, an der Taille etwas weiter.“ */
export function kurzSatz(g: GroessenAnsicht, passform: Passform): string {
  const abweichung = g.zonen.find((z) => z.bewertung !== "passt");
  const basis = `Sitzt ${PASSFORM[passform].wort}`;
  if (!abweichung) return `${basis}.`;
  return `${basis}, ${ZONEN[abweichung.zone].an} etwas ${abweichung.bewertung === "zu_eng" ? "enger" : "weiter"}.`;
}

/** „Warum 40?“ – aus der wichtigsten Zone des Artikels. */
export function warumSatz(g: GroessenAnsicht, primaer: Zone, passform: Passform): string {
  const z = wichtigste(g, primaer);
  if (!z) return `Diese Größe passt am besten zu Ihren Maßen und ${PASSFORM[passform].eine}.`;
  const an = gross(ZONEN[z.zone].an);
  const raum =
    z.spielraum < 0
      ? `${an} ist das Teil ${cm(z.spielraum)} schmaler als Ihr Maß, das Material gibt nach`
      : z.spielraum === 0
        ? `${an} liegt das Teil genau an`
        : `${an} bleiben ${cm(z.spielraum)} Spielraum`;
  if (z.bewertung === "passt") return `${raum}, ideal für ${PASSFORM[passform].eine}.`;
  const richtung = z.bewertung === "zu_eng" ? "etwas enger" : "etwas weiter";
  return `${raum}. Das ist ${richtung} als ideal für ${PASSFORM[passform].eine}, passt insgesamt aber am besten.`;
}

/** „So säße 42“: Unterschied zur empfohlenen Größe an der wichtigsten Zone. */
export function vergleichSatz(haupt: GroessenAnsicht, vergleich: GroessenAnsicht, primaer: Zone): string {
  const h = wichtigste(haupt, primaer);
  const v = vergleich.zonen.find((z) => z.zone === h?.zone);
  if (!h || !v) return "Zum Vergleich.";
  const d = v.spielraum - h.spielraum;
  if (d === 0) return `${gross(ZONEN[h.zone].an)} gleich viel Spielraum.`;
  return `Insgesamt ${d > 0 ? "weiter" : "enger"}, ${ZONEN[h.zone].an} ${cm(d)} ${d > 0 ? "mehr" : "weniger"} Spielraum.`;
}

/** Entscheidungshilfe zwischen zwei Größen (E38). */
export function entscheidungshilfe(a: GroessenAnsicht, b: GroessenAnsicht, primaer: Zone): string {
  const ra = wichtigste(a, primaer)?.spielraum ?? 0;
  const rb = b.zonen.find((z) => z.zone === wichtigste(a, primaer)?.zone)?.spielraum ?? 0;
  const [enger, weiter] = ra <= rb ? [a, b] : [b, a];
  return `Lieber etwas enger: ${enger.groesse}. Lieber etwas weiter: ${weiter.groesse}.`;
}

/** Kurzbeschreibung einer Größe in der Zwei-Größen-Karte, z. B. „Brust 8 cm Spielraum, sitzt wie gewünscht.“ */
export function groessenKurz(g: GroessenAnsicht, primaer: Zone): string {
  const z = wichtigste(g, primaer);
  if (!z) return "";
  return `${ZONEN[z.zone].name} ${spielraumText(z)}, ${BEWERTUNG[z.bewertung]}.`;
}

/** Hinweis, wenn der Schnitt des Artikels die Passform-Wahl begrenzt hat. */
export function begrenztSatz(schnitt: Passform, passform: Passform): string {
  return `Dieses Teil ist ${PASSFORM[schnitt].wort} geschnitten. ${gross(PASSFORM[passform].wort)} sitzt es deshalb nur begrenzt – wir haben die Empfehlung an den Schnitt angepasst.`;
}
