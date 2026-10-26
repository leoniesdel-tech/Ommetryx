// /mein/daten – alle gespeicherten Daten als JSON-Datei (Auskunft, Datenübertragbarkeit).

import type { LoaderFunctionArgs } from "react-router";
import { OHNE_CACHE, verlangeKundin } from "../kundin/mein-sitzung.server";
import { datenExport } from "../kundin/verwaltung.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const kundin = await verlangeKundin(request);
  const daten = await datenExport(kundin.kundinId);
  const tag = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(daten, null, 2), {
    headers: {
      ...OHNE_CACHE,
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="ommetryx-daten-${tag}.json"`,
    },
  });
};
