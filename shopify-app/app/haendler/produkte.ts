// Produkte im Admin (Figma H03): Status, Größen-Spanne, erlaubte Aktionen.
// Ohne Server-Code – wird auch von der Seiten-Komponente benutzt.
// Händler sehen nie Kleidungsmaße, nur den Status.

export const PRODUKT_STATUS = ["nicht_vermessen", "vorgemerkt", "in_vermessung", "live", "keine_beratung"] as const;
export type ProduktStatus = (typeof PRODUKT_STATUS)[number];

export const STATUS_TEXT: Record<ProduktStatus, string> = {
  nicht_vermessen: "Nicht vermessen",
  vorgemerkt: "Vorgemerkt",
  in_vermessung: "In Vermessung",
  live: "Live",
  keine_beratung: "Keine Beratung nötig",
};

export type Wunsch = "vorgemerkt" | "keine_beratung";
export const WUENSCHE: readonly Wunsch[] = ["vorgemerkt", "keine_beratung"];

/** Status aus der Erfassung des Teams (Vorrang) und dem Wunsch des Händlers. */
export function produktStatus(artikelStatus: string | null, wunsch: string | null): ProduktStatus {
  if (artikelStatus === "vermessen") return "live";
  if (artikelStatus === "entwurf") return "in_vermessung";
  if (wunsch === "vorgemerkt" || wunsch === "keine_beratung") return wunsch;
  return "nicht_vermessen";
}

/** Darf der Händler den Status selbst ändern? Nicht mehr, sobald das Team das Produkt erfasst. */
export function haendlerDarfAendern(status: ProduktStatus): boolean {
  return status === "nicht_vermessen" || status === "vorgemerkt" || status === "keine_beratung";
}

const GROESSEN_OPTION = /^(größe|groesse|grösse|size|taille|konfektionsgröße|weite|kleidergröße)$/i;

/** „38–44“ aus der Größen-Option des Produkts, „One Size“ ohne Größen-Option. */
export function groessenSpanne(optionen: { name: string; werte: string[] }[]): string {
  const option = optionen.find((o) => GROESSEN_OPTION.test(o.name.trim()));
  if (!option || option.werte.length === 0) return "One Size";
  if (option.werte.length === 1) return option.werte[0]!;
  return `${option.werte[0]}–${option.werte[option.werte.length - 1]}`;
}
