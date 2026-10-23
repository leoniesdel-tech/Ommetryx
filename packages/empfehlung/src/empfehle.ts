// Größenempfehlung nach Schnittstellen-Dokumentation v3, Abschnitte 3–7.
//
// Datenschutz: Diese Datei schreibt nichts in Logs und nimmt keine Messwerte in Fehlermeldungen auf.

import { dehnungskorrektur, mindestMehrweite } from "./dehnung.ts";
import type { Artikelart, Konfiguration, Zeilenwahl } from "./konfiguration.ts";
import { groessensprung } from "./sprung.ts";
import { strafe, strafeVergleich } from "./strafe.ts";
import { EmpfehlungsFehler } from "./typen.ts";
import type { Anfrage, Artikel, Ausschlussgrund, Ergebnis, GroessenErgebnis, Messpunkt, Status, ZonenErgebnis } from "./typen.ts";

export function empfehle(anfrage: Anfrage, k: Konfiguration): Ergebnis {
  const { artikel, koerper } = anfrage;
  const art = k.artikelart(artikel.artikelart);
  if (artikel.groessen.length === 0) {
    throw new EmpfehlungsFehler("keine_groessen", "Der Artikel hat keine vermessenen Größen");
  }
  pruefePflichtmasse(anfrage, art);

  const klasse = k.dehnungsklasse(artikel.material_dehnung_prozent);
  const gruppe = artikel.tailliert && art.gewichtsgruppe_tailliert ? art.gewichtsgruppe_tailliert : art.gewichtsgruppe;
  const regeln = waehleZeilen(art, artikel);

  const groessen: GroessenErgebnis[] = artikel.groessen.map((groesse, index) => {
    const zonen: ZonenErgebnis[] = [];
    const ausschlussgruende: Ausschlussgrund[] = [];

    for (const [messpunkt, wahl] of regeln) {
      const koerpermass = koerper[messpunkt];
      const kleidungsmass = groesse.masse[messpunkt];
      // Nicht gemessen oder nicht im Profil: Messpunkt wird nicht gewertet.
      if (koerpermass === undefined || kleidungsmass === undefined) continue;

      const G = groessensprung(artikel.groessen, index, messpunkt, k.groessensprungStandard);
      const mehrweite = kleidungsmass - koerpermass;
      const ziel = zielMitte(k, anfrage, art, wahl, messpunkt, koerpermass, klasse, G);
      const mindest = mindestMehrweite(k, wahl, messpunkt, klasse, artikel.material_dehnung_prozent, koerpermass);
      const zoneHalbbreite = k.parameter("zone_halbbreite_in_G") * G;
      const s = strafe(k, { mehrweite, zielMitte: ziel.mitte, zoneHalbbreite, mindest, obergrenze: ziel.obergrenze });
      const gewicht = ziel.mitte === null ? 0 : k.gewicht(gruppe, messpunkt);

      if (klasse === 0 && mindest !== null && mehrweite < mindest - k.parameter("ausschluss_unter_mindest_cm")) {
        ausschlussgruende.push("unter_mindest");
      }

      zonen.push({
        messpunkt,
        mehrweite,
        ziel_mitte: ziel.mitte,
        zone_halbbreite: zoneHalbbreite,
        mindest,
        gewicht,
        strafe: s.strafe,
        bewertung: s.bewertung,
        unter_mindest: s.unterMindest,
        begrenzt_durch_schnitt: ziel.begrenzt,
      });
    }

    const schulter = schulterZone(k, anfrage, art, klasse, groesse.masse.schulter);
    if (schulter) {
      zonen.push(schulter.zone);
      if (schulter.ausschluss) ausschlussgruende.push("schulter_zu_schmal");
    }
    const aermel = aermellaengeZone(k, anfrage, art, groesse.masse.armlaenge);
    if (aermel) zonen.push(aermel);

    const score = zonen.reduce((summe, z) => summe + z.gewicht * z.strafe, 0);
    return {
      groesse: groesse.groesse,
      score,
      ausgeschlossen: ausschlussgruende.length > 0,
      ausschlussgruende: [...new Set(ausschlussgruende)],
      zonen,
    };
  });

  return bewerteGesamt(k, groessen);
}

/** Pflichtmaße: das Primärmaß der Artikelart, bei Röcken und Hosen zusätzlich die Taille. */
function pruefePflichtmasse(anfrage: Anfrage, art: Artikelart) {
  const pflicht: Messpunkt[] = [art.primaermass];
  if (art.primaermass === "huefte" && art.messpunkte.taille) pflicht.push("taille");
  for (const mp of pflicht) {
    if (anfrage.koerper[mp] === undefined) {
      throw new EmpfehlungsFehler("fehlendes_koerpermass", `Körpermaß fehlt: ${mp}`);
    }
  }
}

/** Tabellenzeilen je Messpunkt, nach Varianten (tailliert, ärmellos, Bund) aufgelöst. */
function waehleZeilen(art: Artikelart, artikel: Artikel): [Messpunkt, Zeilenwahl][] {
  const ergebnis: [Messpunkt, Zeilenwahl][] = [];
  for (const [mp, regel] of Object.entries(art.messpunkte) as [Messpunkt, NonNullable<Artikelart["messpunkte"][Messpunkt]>][]) {
    let wahl: Zeilenwahl | null = regel;
    if (artikel.tailliert && regel.wenn_tailliert) wahl = regel.wenn_tailliert;
    if (artikel.aermel_typ === "ohne" && regel.wenn_aermellos) wahl = regel.wenn_aermellos;
    if (regel.nach_bund && artikel.bund_typ) wahl = regel.nach_bund[artikel.bund_typ];
    // null: Messpunkt wird bei dieser Variante nicht gewertet (z. B. Gummizugbund).
    if (wahl) ergebnis.push([mp, wahl]);
  }
  return ergebnis;
}

interface Ziel {
  mitte: number | null;
  obergrenze: number | null;
  begrenzt: boolean;
}

/**
 * Ziel-Mitte in dieser Reihenfolge (v3 Abschnitt 6):
 * Bereich der gewählten Passform → Begrenzung durch den Schnitt (± G) → Umrechnung auf die Kundin
 * → Dehnungskorrektur → persönlicher Offset und Artikel-Verschiebung.
 * Figur-Korrektur fehlt noch (offene Frage, Regeln aus v2 liegen nicht vor).
 */
function zielMitte(
  k: Konfiguration,
  anfrage: Anfrage,
  art: Artikelart,
  wahl: Zeilenwahl,
  messpunkt: Messpunkt,
  koerpermass: number,
  klasse: number,
  G: number,
): Ziel {
  const ohneZiel: Ziel = { mitte: null, obergrenze: null, begrenzt: false };
  if (!wahl.zeile) return ohneZiel;

  const { artikel, passform } = anfrage;
  const schnittBereich = k.bereich(wahl.zeile, messpunkt, artikel.schnitt);
  let bereich = k.bereich(wahl.zeile, messpunkt, passform);
  let begrenzt = false;

  if (!bereich) {
    // „Nicht werten“ – außer beim Primärmaß: dort gilt der Bereich des Schnitts.
    if (messpunkt !== art.primaermass || !schnittBereich) return ohneZiel;
    bereich = schnittBereich;
    begrenzt = passform !== artikel.schnitt;
  }

  let mitte = bereich.mitte;
  if (schnittBereich) {
    const grenze = k.parameter("schnitt_begrenzung_in_G") * G;
    const begrenzteMitte = Math.min(Math.max(mitte, schnittBereich.mitte - grenze), schnittBereich.mitte + grenze);
    if (begrenzteMitte !== mitte) begrenzt = true;
    mitte = begrenzteMitte;
  }

  let obergrenze: number | null = null;
  if (bereich.prozentual) {
    mitte = (mitte / 100) * koerpermass;
  } else {
    const faktor = umrechnungsfaktor(k, messpunkt, koerpermass);
    mitte = mitte * faktor;
    const ober = k.oversizedObergrenze(wahl.zeile, messpunkt);
    if (ober !== undefined) obergrenze = ober * faktor;
    mitte += dehnungskorrektur(k, messpunkt, klasse, bereich.referenz_dehnungsklasse, passform);
  }

  mitte += anfrage.offsets?.[messpunkt] ?? 0;
  mitte += anfrage.artikel_verschiebung?.[messpunkt] ?? 0;
  return { mitte, obergrenze, begrenzt };
}

/** Wert(K) = Wert_ref × ((1 − a) + a × K / K_ref), nur für Messpunkte mit K_ref (Brust, Hüfte). */
function umrechnungsfaktor(k: Konfiguration, messpunkt: Messpunkt, koerpermass: number): number {
  const kRef = k.kRef(messpunkt);
  if (kRef === undefined) return 1;
  const a = k.parameter("skalierung_anteil_proportional");
  return 1 - a + (a * koerpermass) / kRef;
}

/** Schulter: nur Webware mit eingesetztem Ärmel und wenn das Profil ein Referenzteil hat. */
function schulterZone(
  k: Konfiguration,
  anfrage: Anfrage,
  art: Artikelart,
  klasse: number,
  kleidungsmass: number | undefined,
): { zone: ZonenErgebnis; ausschluss: boolean } | null {
  const referenz = anfrage.koerper.schulterbreite_referenz;
  if (!art.schulter_werten || anfrage.artikel.aermel_typ !== "eingesetzt" || klasse !== 0) return null;
  if (referenz === undefined || kleidungsmass === undefined) return null;

  const differenz = kleidungsmass - referenz;
  const toleranz = k.parameter("schulter_toleranz_cm");
  const s = strafeVergleich(k, differenz, toleranz);
  return {
    zone: vergleichsZone("schulter", differenz, toleranz, k.zusatzgewicht("schulter"), s),
    ausschluss: differenz < -k.parameter("schulter_ausschluss_schmaler_cm"),
  };
}

/** Ärmellänge: nur wenn das Profil die Armlänge hat. Zu kurz zählt doppelt. */
function aermellaengeZone(
  k: Konfiguration,
  anfrage: Anfrage,
  art: Artikelart,
  kleidungsmass: number | undefined,
): ZonenErgebnis | null {
  const armlaenge = anfrage.koerper.armlaenge;
  if (!art.aermellaenge_werten || anfrage.artikel.aermel_typ === "ohne") return null;
  if (armlaenge === undefined || kleidungsmass === undefined) return null;

  const differenz = kleidungsmass - armlaenge;
  const toleranz = k.parameter("aermellaenge_toleranz_cm");
  return vergleichsZone("aermellaenge", differenz, toleranz, k.zusatzgewicht("aermellaenge"), strafeVergleich(k, differenz, toleranz));
}

function vergleichsZone(
  messpunkt: "schulter" | "aermellaenge",
  differenz: number,
  toleranz: number,
  gewicht: number,
  s: ReturnType<typeof strafeVergleich>,
): ZonenErgebnis {
  return {
    messpunkt,
    mehrweite: differenz,
    ziel_mitte: 0,
    zone_halbbreite: toleranz,
    mindest: null,
    gewicht,
    strafe: s.strafe,
    bewertung: s.bewertung,
    unter_mindest: false,
    begrenzt_durch_schnitt: false,
  };
}

/** Beste Größe, Nachbargröße, Konfidenz und Status (v3 Abschnitt 7). */
function bewerteGesamt(k: Konfiguration, groessen: GroessenErgebnis[]): Ergebnis {
  const kandidaten = groessen.filter((g) => !g.ausgeschlossen).sort((a, b) => a.score - b.score);
  const beste = kandidaten[0];
  if (!beste) {
    return {
      recommended_size: null,
      confidence: 0,
      alternative_size: null,
      status: "keine_passende_groesse",
      begrenzt_durch_schnitt: false,
      groessen,
    };
  }

  let konfidenz = k.parameter("start");
  let alternative: string | null = null;

  const zweite = kandidaten[1];
  if (zweite) {
    const differenz = zweite.score === 0 ? 0 : (zweite.score - beste.score) / zweite.score;
    if (differenz < k.parameter("knapp_schwelle_score_diff")) {
      alternative = zweite.groesse;
      konfidenz -= abzugKnapp(differenz);
    }
  }

  const begrenzt = beste.zonen.some((z) => z.begrenzt_durch_schnitt);
  if (begrenzt) konfidenz -= k.parameter("abzug_schnitt_begrenzt");
  // Zählt auch bei Messpunkten mit Gewicht 0, denn dort ist die Mindestprüfung die einzige Prüfung.
  if (beste.zonen.some((z) => z.unter_mindest)) konfidenz -= k.parameter("abzug_unter_mindest");

  konfidenz = Math.max(0, Math.min(100, konfidenz));
  const status = bestimmeStatus(k, konfidenz);
  const sicher = status === "empfohlen";

  return {
    recommended_size: sicher ? beste.groesse : null,
    confidence: konfidenz,
    alternative_size: sicher ? alternative : null,
    status,
    begrenzt_durch_schnitt: begrenzt,
    groessen,
  };
}

/**
 * OFFEN (Frage an den Mitgründer): Wie wird der Abzug zwischen abzug_knapp_min und abzug_knapp_max abgestuft?
 * Bis zur Antwort gibt es keinen Abzug, nur die Nachbargröße wird gefüllt.
 */
function abzugKnapp(_differenz: number): number {
  return 0;
}

export function bestimmeStatus(k: Konfiguration, konfidenz: number): Status {
  return konfidenz < k.parameter("schwelle_unsicher") ? "unsicher" : "empfohlen";
}
