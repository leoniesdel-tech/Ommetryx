// Körperprofil im Bereich body: verschlüsselt, nur über pseudonym_id, keine Historie.
// Gewicht kommt hier nie vor (CLAUDE.md Abschnitt 9).

import { z } from "zod";
import { entschluessele, verschluessele } from "../lib/krypto.server";
import { bodyDb } from "./datenbanken.server";
import { ALTERSGRUPPEN } from "./texte";

const mass = z.number().finite().min(30).max(250);

export const profilSchema = z
  .object({
    koerpergroesse: z.number().finite().min(100).max(230),
    brust: mass,
    huefte: mass,
    taille: mass.optional(),
    altersgruppe: z.enum(ALTERSGRUPPEN).optional(),
  })
  .strict();

export type Profil = z.infer<typeof profilSchema>;

export async function ladeProfil(pseudonymId: string): Promise<Profil | null> {
  const zeile = await bodyDb.koerperprofil.findUnique({ where: { pseudonymId } });
  if (!zeile) return null;
  const geprueft = profilSchema.safeParse(JSON.parse(entschluessele(zeile.daten, "OX_SCHLUESSEL_BODY")));
  return geprueft.success ? geprueft.data : null;
}

/** Überschreibt das Profil (keine Historie). */
export async function speichereProfil(pseudonymId: string, profil: Profil) {
  const daten = verschluessele(JSON.stringify(profilSchema.parse(profil)), "OX_SCHLUESSEL_BODY");
  await bodyDb.koerperprofil.upsert({ where: { pseudonymId }, create: { pseudonymId, daten }, update: { daten } });
}

export async function loescheProfil(pseudonymId: string) {
  await bodyDb.koerperprofil.deleteMany({ where: { pseudonymId } });
}
