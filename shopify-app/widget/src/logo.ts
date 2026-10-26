// Ommetryx-Bildmarke (Figma „DS Logo-Bildmarke“ 50:52) aus den Original-Ebenen, aufgeteilt
// in die drei Etappen der Lade-Animation (Figma „Spezifikation · Ladebildschirm und Bewegung“):
//   Etappe 1: das O-Band rollt an · Etappe 2: das Band läuft durch das X · Etappe 3: die Apricot-Spitze.
// Positionen, Masken und Maße 1:1 aus Figma (Grundgröße 171 × 119 px). Dateien liegen in assets/.

interface Ebene {
  datei: string;
  /** CSS inset (oben rechts unten links) relativ zur Bildmarke */
  inset: string;
  maske?: { datei: string; position: string; groesse: string; innen: string };
}

const STUFEN: Ebene[][] = [
  [{ datei: "ox-logo-5ebd1.svg", inset: "5.88% 53.98% 6.47% 4.97%" }],
  [
    {
      datei: "ox-logo-a246b.svg",
      inset: "46.47% 33.45% 5.46% 25.15%",
      maske: { datei: "ox-logo-31810.svg", position: "-34.5px -48.3px", groesse: "70.2px 104.3px", innen: "-18.71% -15.82% -19.58% -15.25%" },
    },
    { datei: "ox-logo-6d693.svg", inset: "46.22% 33.8% 6.13% 25.03%" },
    { datei: "ox-logo-6e388.svg", inset: "5.88% 7.02% 47.39% 61.35%" },
    {
      datei: "ox-logo-6f7f0.svg",
      inset: "6.13% 4.97% 5.8% 29.12%",
      maske: { datei: "ox-logo-756dc.svg", position: "-41.3px -0.3px", groesse: "150.5px 104.7px", innen: "-10.21% -9.94% -10.69% -9.58%" },
    },
    { datei: "ox-logo-e35f0.svg", inset: "5.88% 5.32% 6.47% 29.01%" },
  ],
  [
    { datei: "ox-logo-81a93.svg", inset: "6.39% 2.87% 67.31% 80.82%" },
    {
      datei: "ox-logo-8b1d9.svg",
      inset: "-2.52% -1.46% 60.5% 72.22%",
      maske: { datei: "ox-logo-135bd.svg", position: "14.7px 10.6px", groesse: "27.9px 31.3px", innen: "0" },
    },
  ],
];

function ebene(basis: string, e: Ebene) {
  if (!e.maske) {
    return `<div class="ebene" style="inset:${e.inset}"><img alt="" src="${basis}${e.datei}" /></div>`;
  }
  const m = e.maske;
  const maske = `url('${basis}${m.datei}')`;
  return `<div class="ebene" style="inset:${e.inset};mask-image:${maske};-webkit-mask-image:${maske};mask-position:${m.position};-webkit-mask-position:${m.position};mask-size:${m.groesse};-webkit-mask-size:${m.groesse};mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat">
      <div class="ebene" style="inset:${m.innen}"><img alt="" src="${basis}${e.datei}" /></div>
    </div>`;
}

/** Bildmarke in drei Stufen (Klassen stufe-1 … stufe-3), dekorativ (aria-hidden). */
export function logoHtml(basis: string) {
  return `<div class="logo" aria-hidden="true"><div class="logo-innen">
    ${STUFEN.map((ebenen, i) => `<div class="stufe stufe-${i + 1}">${ebenen.map((e) => ebene(basis, e)).join("")}</div>`).join("")}
  </div></div>`;
}
