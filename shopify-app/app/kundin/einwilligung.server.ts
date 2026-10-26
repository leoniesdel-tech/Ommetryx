// Nachweis von Einwilligungen: Zweck, Textversion, Shop, Zeitpunkt, „mindestens 16“.

import { identityDb } from "./datenbanken.server";
import { EINWILLIGUNGEN } from "./texte";
import type { Zweck } from "./texte";

/** Nur die aktuelle Textversion wird angenommen (der Nachweis muss zum gezeigten Text passen). */
export function versionAktuell(zweck: Zweck, version: unknown) {
  return version === EINWILLIGUNGEN[zweck].version;
}

export async function speichereEinwilligung(daten: { kundinId: string | null; zweck: Zweck; shop: string; mindestens16: boolean }) {
  await identityDb.einwilligung.create({
    data: { ...daten, textversion: EINWILLIGUNGEN[daten.zweck].version },
  });
}

export async function hatEinwilligung(kundinId: string, zweck: Zweck) {
  const eintrag = await identityDb.einwilligung.findFirst({ where: { kundinId, zweck, widerrufenAm: null } });
  return Boolean(eintrag);
}
