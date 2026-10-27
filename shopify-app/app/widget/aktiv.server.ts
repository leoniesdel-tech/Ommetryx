// Ist Ommetryx in diesem Shop freigeschaltet? Erst nach bestätigtem Auftragsverarbeitungsvertrag (AVV)
// dürfen wir Körpermaße der Kundinnen dieses Shops verarbeiten (Figma H09, CLAUDE.md Abschnitt 9).
// Gilt für alle App-Proxy-Anfragen des Widgets.

import db from "../db.server";

export async function shopAktiv(shop: string): Promise<boolean> {
  const zeile = await db.shop.findUnique({ where: { domain: shop }, select: { avvBestaetigtAm: true, deinstalliertAm: true } });
  return Boolean(zeile?.avvBestaetigtAm) && !zeile?.deinstalliertAm;
}
