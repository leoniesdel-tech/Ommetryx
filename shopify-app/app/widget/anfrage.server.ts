// Anfragen des Widgets prüfen und beantworten.
//
// Datenschutz: Körpermaße kommen nur im Anfrage-Inhalt (POST), nie in der Adresse.
// Sie werden nicht gespeichert und nicht geloggt; Fehlerantworten enthalten keine Messwerte.

import { z } from "zod";
import { empfehle, EmpfehlungsFehler, PASSFORMEN } from "@ommetryx/empfehlung";
import type { Ergebnis } from "@ommetryx/empfehlung";
import { alsEmpfehlungsArtikel } from "../intern/erfassung";
import { kundinAusToken } from "../kundin/login.server";
import { ladeProfil } from "../kundin/profil.server";
import { ladeArtikel } from "../models/artikel.server";
import { aktiveKonfiguration } from "../models/konfiguration.server";

const mass = z.number().finite().min(30).max(250);

/** Entweder Maße direkt (ohne Profil) oder ein Token (angemeldet, Maße kommen aus dem gespeicherten Profil). */
export const empfehlungsAnfrage = z
  .object({
    produkt: z.string().regex(/^\d{1,20}$/),
    passform: z.enum(PASSFORMEN),
    koerper: z
      .object({
        koerpergroesse: z.number().finite().min(100).max(230),
        brust: mass,
        huefte: mass,
        taille: mass.optional(),
      })
      .optional(),
    token: z.string().optional(),
  })
  .refine((a) => a.koerper || a.token);

const OHNE_CACHE = { "Cache-Control": "no-store" };

export function antwort(daten: unknown, status = 200) {
  return Response.json(daten, { status, headers: OHNE_CACHE });
}

const produktGid = (nummer: string) => `gid://shopify/Product/${nummer}`;

/** Ist das Produkt vermessen, und braucht es die Taille? */
export async function artikelInfo(shop: string, produkt: string | null) {
  if (!produkt || !/^\d{1,20}$/.test(produkt)) return antwort({ fehler: "ungueltige_anfrage" }, 400);
  const artikel = await ladeArtikel(shop, produktGid(produkt));
  if (!artikel || artikel.status !== "vermessen") return antwort({ vermessen: false });
  const k = await aktiveKonfiguration();
  const art = k.artikelart(artikel.artikelart);
  const taillePflicht = art.primaermass === "huefte" && Boolean(art.messpunkte.taille) && artikel.bundTyp !== "gummizug";
  return antwort({ vermessen: true, taillePflicht, tailleGewertet: Boolean(art.messpunkte.taille) });
}

/** Rechnet die Empfehlung. Ergebnis ohne Körpermaße zurück (nur Mehrweiten je Zone für die Ansicht). */
export async function empfehlung(shop: string, roh: unknown) {
  const anfrage = empfehlungsAnfrage.safeParse(roh);
  if (!anfrage.success) return antwort({ fehler: "ungueltige_eingabe" }, 400);

  const { produkt, passform, token } = anfrage.data;
  let koerper = anfrage.data.koerper;
  if (!koerper) {
    const kundin = await kundinAusToken(token, shop);
    const profil = kundin && (await ladeProfil(kundin.pseudonymId));
    if (!profil) return antwort({ fehler: "nicht_angemeldet" }, 401);
    koerper = { koerpergroesse: profil.koerpergroesse, brust: profil.brust, huefte: profil.huefte, ...(profil.taille ? { taille: profil.taille } : {}) };
  }

  const artikel = await ladeArtikel(shop, produktGid(produkt));
  if (!artikel || artikel.status !== "vermessen") return antwort({ fehler: "nicht_vermessen" }, 404);

  let ergebnis: Ergebnis;
  try {
    ergebnis = empfehle({ koerper, passform, artikel: alsEmpfehlungsArtikel(artikel) }, await aktiveKonfiguration());
  } catch (fehler) {
    if (fehler instanceof EmpfehlungsFehler) return antwort({ fehler: fehler.code }, 422);
    throw fehler;
  }
  return antwort(ergebnis);
}
