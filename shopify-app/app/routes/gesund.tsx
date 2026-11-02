// /gesund – Gesundheits-Adresse für den Server (Render prüft sie regelmäßig). Verrät nur „ok“ oder „Fehler“.

import db from "../db.server";

export const loader = async () => {
  try {
    await db.$queryRaw`SELECT 1`;
    return new Response("ok", { headers: { "Cache-Control": "no-store" } });
  } catch {
    return new Response("Fehler", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
};
