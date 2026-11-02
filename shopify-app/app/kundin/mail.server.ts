// E-Mail-Versand an Kundinnen.
// Entwicklung: Mails landen im Entwicklungs-Postfach (/intern/postfach), nicht im Internet.
// Produktion: Versand über Brevo (EU), API: POST /v3/smtp/email. Vor dem ersten Einsatz AVV mit Brevo abschließen.
// Fehlermeldungen enthalten nie Adresse oder Inhalt.

import { identityDb } from "./datenbanken.server";

const AUFBEWAHRUNG_STUNDEN = 24;
const BREVO_ADRESSE = "https://api.brevo.com/v3/smtp/email";
const ZEITLIMIT_MS = 10_000;

interface Mail {
  an: string;
  betreff: string;
  text: string;
}

async function ueberBrevo({ an, betreff, text }: Mail) {
  const schluessel = process.env.BREVO_API_KEY;
  const absender = process.env.OX_MAIL_ABSENDER;
  if (!schluessel || !absender) throw new Error("E-Mail-Versand (Brevo) ist noch nicht eingerichtet");
  const antwort = await fetch(BREVO_ADRESSE, {
    method: "POST",
    headers: { "api-key": schluessel, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ sender: { name: "Ommetryx", email: absender }, to: [{ email: an }], subject: betreff, textContent: text }),
    signal: AbortSignal.timeout(ZEITLIMIT_MS),
  });
  if (!antwort.ok) throw new Error(`E-Mail-Versand fehlgeschlagen (${antwort.status})`);
}

async function versende(mail: Mail) {
  if (process.env.NODE_ENV === "production") return ueberBrevo(mail);
  await identityDb.entwicklungsMail.deleteMany({
    where: { erstelltAm: { lt: new Date(Date.now() - AUFBEWAHRUNG_STUNDEN * 3600 * 1000) } },
  });
  await identityDb.entwicklungsMail.create({ data: mail });
}

export async function sendeLoginCode(email: string, code: string) {
  await versende({
    an: email,
    betreff: "Ihr Ommetryx-Code",
    text: `Ihr Code lautet ${code}. Er ist 10 Minuten gültig und kann nur einmal verwendet werden. Wenn Sie keinen Code angefordert haben, können Sie diese E-Mail ignorieren.`,
  });
}

/** Erinnerung vor der Löschung nach 24 Monaten ohne Nutzung. */
export async function sendeLoeschErinnerung(email: string, termin: Date) {
  const datum = termin.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
  await versende({
    an: email,
    betreff: "Ihr Ommetryx-Profil wird bald gelöscht",
    text: `Sie haben Ihr Ommetryx-Profil lange nicht genutzt. Deshalb löschen wir es am ${datum} mit allen gespeicherten Maßen. Wenn Sie es behalten möchten, melden Sie sich einfach vorher einmal an. Sonst müssen Sie nichts tun.`,
  });
}

export function postfach() {
  return identityDb.entwicklungsMail.findMany({ orderBy: { erstelltAm: "desc" }, take: 20 });
}
