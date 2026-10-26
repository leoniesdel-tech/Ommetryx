// E-Mail-Versand an Kundinnen.
// Entwicklung: Mails landen im Entwicklungs-Postfach (/intern/postfach), nicht im Internet.
// Vor dem Pilot: Brevo (EU) anbinden – dann hier den Versand ergänzen (AVV mit Brevo nötig).

import { identityDb } from "./datenbanken.server";

const AUFBEWAHRUNG_STUNDEN = 24;

export async function sendeLoginCode(email: string, code: string) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("E-Mail-Versand (Brevo) ist noch nicht eingerichtet");
  }
  await identityDb.entwicklungsMail.deleteMany({
    where: { erstelltAm: { lt: new Date(Date.now() - AUFBEWAHRUNG_STUNDEN * 3600 * 1000) } },
  });
  await identityDb.entwicklungsMail.create({
    data: {
      an: email,
      betreff: "Ihr Ommetryx-Code",
      text: `Ihr Code lautet ${code}. Er ist 10 Minuten gültig und kann nur einmal verwendet werden. Wenn Sie keinen Code angefordert haben, können Sie diese E-Mail ignorieren.`,
    },
  });
}

export function postfach() {
  return identityDb.entwicklungsMail.findMany({ orderBy: { erstelltAm: "desc" }, take: 20 });
}
