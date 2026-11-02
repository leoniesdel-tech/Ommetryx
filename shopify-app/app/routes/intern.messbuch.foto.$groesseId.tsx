// /intern/messbuch/foto/:groesseId – liefert das Foto einer Größe, nur für das angemeldete Team.

import type { LoaderFunctionArgs } from "react-router";
import db from "../db.server";
import { leseFoto } from "../intern/fotoablage.server";
import { ladeMessFoto } from "../intern/messbuch.server";
import { verlangeTeam } from "../intern/team.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await verlangeTeam(db, request);
  const id = params.groesseId ?? "";
  if (!/^\d{1,9}$/.test(id)) throw new Response("Nicht gefunden", { status: 404 });
  const foto = await ladeMessFoto(Number(id));
  if (!foto) throw new Response("Nicht gefunden", { status: 404 });
  const inhalt = await leseFoto(foto.datei).catch(() => null);
  if (!inhalt) throw new Response("Nicht gefunden", { status: 404 });
  return new Response(new Uint8Array(inhalt), {
    headers: {
      "Content-Type": foto.typ,
      "Content-Length": String(inhalt.length),
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
