// Konto-Aktionen des Widgets (über den App Proxy, Signatur vorher geprüft).
// Tokens und Maße kommen nur im JSON-Inhalt, nie in der Adresse. Nichts davon wird geloggt.

import { z } from "zod";
import { speichereEinwilligung, versionAktuell } from "../kundin/einwilligung.server";
import { fordereCodeAn, kundinAusToken, meldeAb, pruefeCode } from "../kundin/login.server";
import { ladeProfil, profilSchema, speichereProfil } from "../kundin/profil.server";
import { antwort } from "./anfrage.server";

const email = z.string().trim().email().max(254);

const aktionen = z.discriminatedUnion("aktion", [
  z.object({ aktion: z.literal("code_anfordern"), email }),
  z.object({
    aktion: z.literal("code_pruefen"),
    email,
    code: z.string().max(10),
    einwilligung: z.object({ version: z.string(), mindestens16: z.literal(true) }),
    profil: profilSchema.optional(),
  }),
  z.object({ aktion: z.literal("profil_laden"), token: z.string() }),
  z.object({ aktion: z.literal("profil_speichern"), token: z.string(), profil: profilSchema }),
  z.object({ aktion: z.literal("abmelden"), token: z.string() }),
]);

const verarbeitung = z.object({ version: z.string(), mindestens16: z.literal(true) });

/** Einwilligung vor der Maßeingabe, ohne Profil: Nachweis ohne Personenbezug. */
export async function einwilligungVerarbeitung(shop: string, roh: unknown) {
  const e = verarbeitung.safeParse(roh);
  if (!e.success || !versionAktuell("verarbeitung", e.data.version)) return antwort({ fehler: "ungueltige_einwilligung" }, 400);
  await speichereEinwilligung({ kundinId: null, zweck: "verarbeitung", shop, mindestens16: true });
  return antwort({ ok: true });
}

export async function konto(shop: string, roh: unknown) {
  const a = aktionen.safeParse(roh);
  if (!a.success) return antwort({ fehler: "ungueltige_eingabe" }, 400);
  const d = a.data;

  switch (d.aktion) {
    case "code_anfordern":
      await fordereCodeAn(d.email);
      // Immer dieselbe Antwort, egal ob die E-Mail bekannt, gesperrt oder neu ist.
      return antwort({ ok: true });

    case "code_pruefen": {
      if (!versionAktuell("profil", d.einwilligung.version)) return antwort({ fehler: "ungueltige_einwilligung" }, 400);
      const anmeldung = await pruefeCode(d.email, d.code, shop);
      if (!anmeldung.ok) return antwort({ fehler: "code_ungueltig" }, 401);
      await speichereEinwilligung({ kundinId: anmeldung.kundinId, zweck: "profil", shop, mindestens16: true });
      if (d.profil) await speichereProfil(anmeldung.pseudonymId, d.profil);
      const profil = await ladeProfil(anmeldung.pseudonymId);
      return antwort({ ok: true, token: anmeldung.token, hatProfil: Boolean(profil) });
    }

    case "profil_laden": {
      const kundin = await kundinAusToken(d.token, shop);
      if (!kundin) return antwort({ angemeldet: false });
      return antwort({ angemeldet: true, profil: await ladeProfil(kundin.pseudonymId) });
    }

    case "profil_speichern": {
      const kundin = await kundinAusToken(d.token, shop);
      if (!kundin) return antwort({ fehler: "nicht_angemeldet" }, 401);
      await speichereProfil(kundin.pseudonymId, d.profil);
      return antwort({ ok: true });
    }

    case "abmelden":
      await meldeAb(d.token);
      return antwort({ ok: true });
  }
}
