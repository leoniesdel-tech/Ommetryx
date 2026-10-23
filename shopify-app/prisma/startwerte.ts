// Schreibt die Konfiguration aus packages/empfehlung/konfiguration/ in die Datenbank.
// Aufruf: npm run db:startwerte
//
// Die Excel-Datei bleibt die Quelle: erst `npm run konfig` im Empfehlungsmodul, dann dieses Skript.
// Eine vorhandene Version gleichen Namens wird komplett ersetzt und als aktiv markiert.

import { PrismaClient } from "@prisma/client";
import excel from "@ommetryx/empfehlung/konfiguration/konfiguration-v3.json" with { type: "json" };
import ergaenzungen from "@ommetryx/empfehlung/konfiguration/ergaenzungen-v3.json" with { type: "json" };
import { ladeKonfiguration } from "@ommetryx/empfehlung";

type Zeile = Record<string, string | number | undefined>;

const text = (z: Zeile, feld: string) => (z[feld] === undefined ? null : String(z[feld]));
const zahl = (z: Zeile, feld: string) => (z[feld] === undefined ? null : Number(z[feld]));

// Erst prüfen, ob die Dateien gültig sind – sonst nichts schreiben.
ladeKonfiguration(excel, ergaenzungen);

const prisma = new PrismaClient();

await prisma.$transaction(async (tx) => {
  await tx.konfigVersion.deleteMany({ where: { name: excel.version } });
  await tx.konfigVersion.updateMany({ data: { aktiv: false } });

  const version = await tx.konfigVersion.create({
    data: { name: excel.version, aktiv: true, quelle: "docs/ommetryx-konfiguration-v3.xlsx + ergaenzungen-v3.json" },
  });
  const versionId = version.id;

  await tx.konfigBereich.createMany({
    data: (excel.bereiche as Zeile[]).map((z) => ({
      versionId,
      kategorieId: String(z.kategorie_id),
      kategorie: String(z.kategorie),
      messpunkt: String(z.messpunkt),
      passform: String(z.passform),
      unter: Number(z.unter),
      ober: Number(z.ober),
      einheit: String(z.einheit),
      referenzDehnungsklasse: Number(z.referenz_dehnungsklasse),
      vertrauen: text(z, "vertrauen"),
      quelle: text(z, "quelle"),
    })),
  });

  await tx.konfigMindest.createMany({
    data: (excel.mindest as Zeile[]).map((z) => ({
      versionId,
      kategorieId: String(z.kategorie_id),
      messpunkt: String(z.messpunkt),
      mindestCmKlasse0: Number(z.mindest_cm_klasse0),
      hinweis: text(z, "hinweis"),
      quelle: text(z, "quelle"),
      vertrauen: text(z, "vertrauen"),
    })),
  });

  await tx.konfigDehnungsklasse.createMany({
    data: (excel.dehnungsklassen as Zeile[]).map((z) => ({
      versionId,
      klasse: Number(z.klasse),
      name: String(z.name),
      dehnungVon: Number(z.dehnung_von),
      dehnungBis: zahl(z, "dehnung_bis"),
      beispiele: text(z, "beispiele"),
    })),
  });

  await tx.konfigDehnungskorrektur.createMany({
    data: (excel.dehnungskorrektur as Zeile[]).map((z) => ({
      versionId,
      klasse: Number(z.klasse),
      koerpernah: zahl(z, "koerpernah"),
      regulaer: zahl(z, "regulaer"),
      locker: zahl(z, "locker"),
      oversized: zahl(z, "oversized"),
    })),
  });

  await tx.konfigGewicht.createMany({
    data: (excel.gewichte as Zeile[]).map((z) => ({
      versionId,
      kategorie: String(z.kategorie),
      brust: zahl(z, "brust"),
      taille: zahl(z, "taille"),
      huefte: zahl(z, "huefte"),
      oberschenkel: zahl(z, "oberschenkel"),
      oberarm: zahl(z, "oberarm"),
    })),
  });

  await tx.konfigParameter.createMany({
    data: Object.entries(excel.parameter).map(([schluessel, wert]) => ({ versionId, schluessel, wert })),
  });

  await tx.konfigErgaenzung.create({ data: { versionId, daten: ergaenzungen } });
});

const anzahl = await prisma.konfigBereich.count({ where: { version: { name: excel.version } } });
console.log(`Konfiguration ${excel.version} gespeichert und aktiv (${anzahl} Bereiche).`);
await prisma.$disconnect();
