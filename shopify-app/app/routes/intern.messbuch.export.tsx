// /intern/messbuch/export – lädt die ZIP-Datei fürs Vermessungsprogramm herunter, nur für das angemeldete Team.

import type { LoaderFunctionArgs } from "react-router";
import db from "../db.server";
import { messbuchZip } from "../intern/messbuch-export.server";
import { verlangeTeam } from "../intern/team.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await verlangeTeam(db, request);
  const url = new URL(request.url);
  const stream = await messbuchZip({ offen: url.searchParams.get("offen") === "1" });
  const tag = new Date().toISOString().slice(0, 10);
  return new Response(stream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="ommetryx-messbuch-${tag}.zip"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
