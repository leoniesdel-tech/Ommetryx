// Lädt die aktive Konfiguration der Empfehlungslogik aus der Datenbank.
// Die Tabellen haben dieselbe Form wie die Excel-Blätter, deshalb prüft und baut
// ladeKonfiguration aus dem Empfehlungsmodul sie genauso wie die JSON-Dateien.

import type { PrismaClient } from "@prisma/client";
import { ladeKonfiguration, type Konfiguration } from "@ommetryx/empfehlung";

/** Leere Felder (null aus der Datenbank) weglassen, wie in der Excel-Datei. */
function ohneLeere<T extends object>(zeile: T) {
  return Object.fromEntries(Object.entries(zeile).filter(([, wert]) => wert !== null));
}

export async function ladeAktiveKonfiguration(db: PrismaClient): Promise<Konfiguration> {
  const version = await db.konfigVersion.findFirst({
    where: { aktiv: true },
    include: {
      bereiche: true,
      mindest: true,
      dehnungsklassen: true,
      dehnungskorrektur: true,
      gewichte: true,
      parameter: true,
      ergaenzung: true,
    },
  });
  if (!version || !version.ergaenzung) {
    throw new Error("Keine aktive Konfiguration in der Datenbank. Bitte `npm run db:startwerte` ausführen.");
  }

  const excelForm = {
    version: version.name,
    bereiche: version.bereiche.map((b) =>
      ohneLeere({
        kategorie_id: b.kategorieId,
        kategorie: b.kategorie,
        messpunkt: b.messpunkt,
        passform: b.passform,
        unter: b.unter,
        ober: b.ober,
        einheit: b.einheit,
        referenz_dehnungsklasse: b.referenzDehnungsklasse,
      }),
    ),
    mindest: version.mindest.map((m) =>
      ohneLeere({ kategorie_id: m.kategorieId, messpunkt: m.messpunkt, mindest_cm_klasse0: m.mindestCmKlasse0 }),
    ),
    dehnungsklassen: version.dehnungsklassen.map((d) =>
      ohneLeere({ klasse: d.klasse, name: d.name, dehnung_von: d.dehnungVon, dehnung_bis: d.dehnungBis }),
    ),
    dehnungskorrektur: version.dehnungskorrektur.map((d) =>
      ohneLeere({ klasse: d.klasse, koerpernah: d.koerpernah, regulaer: d.regulaer, locker: d.locker, oversized: d.oversized }),
    ),
    gewichte: version.gewichte.map((g) =>
      ohneLeere({
        kategorie: g.kategorie,
        brust: g.brust,
        taille: g.taille,
        huefte: g.huefte,
        oberschenkel: g.oberschenkel,
        oberarm: g.oberarm,
      }),
    ),
    parameter: Object.fromEntries(version.parameter.map((p) => [p.schluessel, p.wert])),
  };

  return ladeKonfiguration(excelForm, version.ergaenzung.daten);
}
