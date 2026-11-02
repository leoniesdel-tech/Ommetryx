// Messbuch: eigene Sammlung vermessener Teile, unabhängig von installierten Shops.
// Gedacht für Händler-Muster und selbst gekaufte Teile; Grundlage für die Weiterentwicklung des Vermessungsprogramms.
// Maße prüft dieselbe Logik wie die Erfassung (erfassung.ts): flach eingeben, Umfänge × 2 speichern.

import type { Konfiguration } from "@ommetryx/empfehlung";
import { eingabeAusFormular, pruefeErfassung } from "./erfassung";
import type { GeprüfterArtikel } from "./erfassung";

export const HERKUNFT = { eigen: "Selbst gekauft", haendler: "Händler-Muster" } as const;
export type Herkunft = keyof typeof HERKUNFT;

export const MAX_FOTO_MB = 25;

export interface MessDaten {
  herkunft: Herkunft;
  onlineShop: string;
  marke: string | null;
  produktname: string;
  link: string | null;
  notiz: string | null;
  /** Querdehnung in %, im Messbuch freiwillig. */
  dehnung: number | null;
  material: string;
  artikel: GeprüfterArtikel;
}

export type MessPruefung = { ok: true; daten: MessDaten; hinweise: string[] } | { ok: false; fehler: Record<string, string>; hinweise: string[] };

const text = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

export function pruefeMessArtikel(form: FormData, k: Konfiguration): MessPruefung {
  const eingabe = eingabeAusFormular(form);
  // Der Dehnungstest entfällt vorerst: Leer ist erlaubt, die Prüfung der Erfassung bekommt dann einen Platzhalter.
  const dehnung = eingabe.materialDehnungProzent;
  if (dehnung === null) eingabe.materialDehnungProzent = 0;
  // Für das Messbuch ist die Herkunft egal: Die Meldung der Erfassung nennt Shopify, hier zählt nur „mindestens eine Größe“.
  const pruefung = pruefeErfassung(eingabe, k);
  const fehler: Record<string, string> = pruefung.ok ? {} : { ...pruefung.fehler };
  if (fehler.groessen) fehler.groessen = "Bitte mindestens eine Größe hinzufügen.";

  const herkunft = text(form, "herkunft");
  if (!(herkunft in HERKUNFT)) fehler.herkunft = "Bitte die Herkunft wählen.";

  const onlineShop = text(form, "online_shop");
  if (!onlineShop) fehler.online_shop = "Bitte den Online-Shop eintragen.";
  else if (onlineShop.length > 120) fehler.online_shop = "Höchstens 120 Zeichen.";

  const produktname = text(form, "produktname");
  if (!produktname) fehler.produktname = "Bitte den Produktnamen eintragen.";
  else if (produktname.length > 200) fehler.produktname = "Höchstens 200 Zeichen.";

  const marke = text(form, "marke");
  if (marke.length > 120) fehler.marke = "Höchstens 120 Zeichen.";

  const link = text(form, "link");
  if (link && (!/^https?:\/\/[^\s"'<>]+$/.test(link) || link.length > 500)) fehler.link = "Bitte eine vollständige Adresse mit https:// eintragen.";

  const material = text(form, "material_zusammensetzung");
  if (!material) fehler.material_zusammensetzung = "Bitte das Material vom Pflegeetikett eintragen.";
  else if (material.length > 200) fehler.material_zusammensetzung = "Höchstens 200 Zeichen.";

  const notiz = text(form, "notiz");
  if (notiz.length > 1000) fehler.notiz = "Höchstens 1000 Zeichen.";

  const gesehen = new Set<string>();
  eingabe.groessen.forEach((g, i) => {
    const name = g.groesse.trim();
    if (!name) fehler[`g${i}_groesse`] = "Bitte die Größe eintragen.";
    else if (name.length > 30) fehler[`g${i}_groesse`] = "Höchstens 30 Zeichen.";
    else if (gesehen.has(name.toLowerCase())) fehler[`g${i}_groesse`] = "Diese Größe gibt es schon.";
    gesehen.add(name.toLowerCase());
  });

  if (!pruefung.ok || Object.keys(fehler).length > 0) return { ok: false, fehler, hinweise: pruefung.hinweise };
  return {
    ok: true,
    hinweise: pruefung.hinweise,
    daten: {
      herkunft: herkunft as Herkunft,
      onlineShop,
      marke: marke || null,
      produktname,
      link: link || null,
      notiz: notiz || null,
      dehnung,
      material,
      artikel: { ...pruefung.artikel, groessen: pruefung.artikel.groessen.map((g) => ({ ...g, groesse: g.groesse.trim() })) },
    },
  };
}
