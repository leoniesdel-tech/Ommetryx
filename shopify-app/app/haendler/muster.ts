// Muster-Versand (Figma H04): Status und Eingabeprüfung, ohne Server-Code.
// MVP: Der Händler schickt eine Anfrage, das Team verschickt das Etikett von Hand und pflegt den Status.

import { z } from "zod";

export const MUSTER_STATUS = ["angemeldet", "unterwegs", "wird_vermessen", "rueckversand", "zurueck"] as const;
export type MusterStatus = (typeof MUSTER_STATUS)[number];

export const MUSTER_TEXT: Record<MusterStatus, string> = {
  angemeldet: "Angemeldet",
  unterwegs: "Unterwegs zu uns",
  wird_vermessen: "Wird vermessen",
  rueckversand: "Rückversand",
  zurueck: "Zurück bei Ihnen",
};

export const MUSTER_ART = { paket: "Per Paket an Ommetryx", termin: "Termin vor Ort" } as const;

export const anfrageSchema = z.object({
  art: z.enum(["paket", "termin"]),
  nachricht: z
    .string()
    .trim()
    .max(500, "Höchstens 500 Zeichen.")
    .transform((v) => v || null),
});

export const statusSchema = z.object({
  id: z.coerce.number().int().positive(),
  status: z.enum(MUSTER_STATUS),
  sendungsnummer: z
    .string()
    .trim()
    .max(60)
    .transform((v) => v || null),
});

export const istOffen = (status: string) => status !== "zurueck";

/** Fortschritt 1–5 für die Anzeige „Aktuelle Sendung“. */
export const musterSchritt = (status: string) => Math.max(0, (MUSTER_STATUS as readonly string[]).indexOf(status)) + 1;
