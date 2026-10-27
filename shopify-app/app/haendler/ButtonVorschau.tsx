// Vorschau des Einstiegs-Buttons im Admin (Figma H10). Gleiche Regeln wie im App-Block
// (extensions/ommetryx-widget/blocks/groessenberater.liquid) – bei Änderungen beide anpassen.

import type { CSSProperties } from "react";
import { STUFEN } from "../../widget/src/logo";
import type { Ebene } from "../../widget/src/logo";
import type { Einstellungen } from "./einstellungen";
import { fuerBlock } from "./einstellungen";

const BASIS = "/marke/";

function LogoEbene({ e }: { e: Ebene }) {
  const bild = <img alt="" src={`${BASIS}${e.datei}`} style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%", maxWidth: "none" }} />;
  if (!e.maske) return <div style={{ position: "absolute", inset: e.inset }}>{bild}</div>;
  const m = e.maske;
  const maske = `url('${BASIS}${m.datei}')`;
  return (
    <div
      style={{
        position: "absolute",
        inset: e.inset,
        maskImage: maske,
        WebkitMaskImage: maske,
        maskPosition: m.position,
        WebkitMaskPosition: m.position,
        maskSize: m.groesse,
        WebkitMaskSize: m.groesse,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    >
      <div style={{ position: "absolute", inset: m.innen }}>{bild}</div>
    </div>
  );
}

/** Farbige Bildmarke (Figma 50:52) in beliebiger Höhe. */
export function Bildmarke({ hoehe }: { hoehe: number }) {
  const s = hoehe / 119;
  return (
    <span aria-hidden="true" style={{ display: "inline-block", position: "relative", width: 171 * s, height: hoehe, flex: "none" }}>
      <span style={{ position: "absolute", left: 0, top: 0, width: 171, height: 119, transform: `scale(${s})`, transformOrigin: "top left" }}>
        {STUFEN.flat().map((e) => (
          <LogoEbene key={e.datei} e={e} />
        ))}
      </span>
    </span>
  );
}

/** Einfarbige Bildmarke (Figma 56:483): Farbe = Schriftfarbe des Buttons. */
function BildmarkeEinfarbig({ hoehe }: { hoehe: number }) {
  const maske = `url('${BASIS}ox-zeichen.svg')`;
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: (171 / 119) * hoehe,
        height: hoehe,
        flex: "none",
        background: "currentColor",
        maskImage: maske,
        WebkitMaskImage: maske,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
}

export function Massband() {
  return (
    <svg aria-hidden="true" width="20" height="12" viewBox="0 0 20 12" fill="none" style={{ flex: "none" }}>
      <rect x="0.75" y="0.75" width="18.5" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 1v4M9 1v3M13 1v4M17 1v3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function buttonStil(e: Einstellungen): CSSProperties {
  const b = fuerBlock(e);
  const basis: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    minHeight: 48,
    padding: "0 16px",
    font: "inherit",
    fontWeight: 600,
    cursor: "pointer",
  };
  if (b.modus === "theme") return { ...basis, background: "#fff", color: "#121212", border: "1px solid #121212", borderRadius: 4, fontWeight: 400 };
  if (b.modus === "ommetryx") return { ...basis, background: "#fff", color: "#0C3A4A", border: "1px solid #0C3A4A", borderRadius: 12 };
  if (b.darstellung === "gefuellt") return { ...basis, background: b.farbe, color: b.schrift, border: `1px solid ${b.farbe}`, borderRadius: b.radius };
  if (b.darstellung === "umrandet") return { ...basis, background: "transparent", color: b.farbe, border: `2px solid ${b.farbe}`, borderRadius: b.radius };
  return { ...basis, minHeight: 44, background: "transparent", color: b.farbe, border: "none", textDecoration: "underline", justifyContent: "flex-start", padding: 0 };
}

export function ButtonVorschau({ e }: { e: Einstellungen }) {
  const symbol = e.modus === "theme" ? "keins" : e.modus === "ommetryx" ? "logo" : e.symbol;
  return (
    <button type="button" tabIndex={-1} style={buttonStil(e)}>
      {symbol === "logo" ? <Bildmarke hoehe={16} /> : null}
      {symbol === "logo_einfarbig" ? <BildmarkeEinfarbig hoehe={16} /> : null}
      {symbol === "massband" ? <Massband /> : null}
      <span>{e.buttonText || "Meine Größe finden"}</span>
    </button>
  );
}
