// Einrichtung (Figma H01): Daten und Schritte, ohne Server-Code – darf auch im Browser laufen.
// Laden und Speichern steht in einrichtung.server.ts.

export interface Einrichtung {
  avvBestaetigt: boolean;
  avvBestaetigtAm: string | null;
  avvVersion: string | null;
  positionGeprueft: boolean;
  ausgeblendet: boolean;
  produkteGesamt: number | null;
  produkteVermessen: number;
  produkteVorgemerkt: number;
}

/** Schritte der Einrichtung, rein rechnend (für Fortschritt und Tests). */
export function einrichtungsSchritte(e: Einrichtung, widgetAktiv: boolean | null) {
  const schritte = [
    { id: "avv", erledigt: e.avvBestaetigt },
    { id: "widget", erledigt: widgetAktiv === true },
    { id: "position", erledigt: e.positionGeprueft },
    { id: "artikel", erledigt: e.produkteVorgemerkt + e.produkteVermessen > 0 },
    { id: "muster", erledigt: e.produkteVermessen > 0 },
  ] as const;
  return { schritte, erledigt: schritte.filter((s) => s.erledigt).length, gesamt: schritte.length };
}
