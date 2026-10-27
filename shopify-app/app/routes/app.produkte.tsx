// Produkte im Shopify-Admin (Figma H03): Status je Produkt, vormerken, „keine Beratung nötig“.
// Händler sehen nie Kleidungsmaße. „In Vermessung“ und „Live“ setzt das Ommetryx-Team mit der Erfassung.
// Muster „Index table“: Suche und Filter in der Adresse, Auswahl im Zustand, Sammel-Aktionen statt Filter.

import { useEffect, useMemo, useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData, useNavigate, useNavigation, useSearchParams } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { PRODUKT_STATUS, STATUS_TEXT, WUENSCHE, haendlerDarfAendern } from "../haendler/produkte";
import type { ProduktStatus, Wunsch } from "../haendler/produkte";
import { ladeProdukte, setzeWunsch } from "../haendler/produkte.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const seite = await ladeProdukte(admin, session.shop, {
    suche: url.searchParams.get("suche"),
    nach: url.searchParams.get("nach"),
    vor: url.searchParams.get("vor"),
  });
  return seite;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const wunschRoh = String(form.get("wunsch") ?? "");
  const wunsch = (WUENSCHE as readonly string[]).includes(wunschRoh) ? (wunschRoh as Wunsch) : null;
  if (wunschRoh !== "" && !wunsch) return { fehler: "Unbekannte Aktion" };
  let ids: unknown;
  try {
    ids = JSON.parse(String(form.get("ids") ?? "[]"));
  } catch {
    return { fehler: "Ungültige Auswahl" };
  }
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string")) return { fehler: "Ungültige Auswahl" };
  const geaendert = await setzeWunsch(session.shop, ids, wunsch);
  return { geaendert, wunsch };
};

const TON: Record<ProduktStatus, "success" | "info" | "caution" | "neutral" | "auto"> = {
  live: "success",
  in_vermessung: "info",
  vorgemerkt: "caution",
  keine_beratung: "neutral",
  nicht_vermessen: "auto",
};

const FILTER: ("alle" | ProduktStatus)[] = ["alle", ...PRODUKT_STATUS];

export default function Produkte() {
  const { produkte, weiter, zurueck } = useLoaderData<typeof loader>();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const laedt = useNavigation().state === "loading";
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const [auswahl, setAuswahl] = useState<Set<string>>(new Set());
  const [suche, setSuche] = useState(params.get("suche") ?? "");
  const filter = (params.get("status") ?? "alle") as "alle" | ProduktStatus;

  const sichtbar = useMemo(() => (filter === "alle" ? produkte : produkte.filter((p) => p.status === filter)), [produkte, filter]);
  const waehlbar = sichtbar.filter((p) => haendlerDarfAendern(p.status));

  // Neue Daten (Seite, Suche, Filter, nach einer Aktion): Auswahl leeren.
  useEffect(() => setAuswahl(new Set()), [produkte, filter]);

  // Rückmeldung nach einer Sammel-Aktion.
  useEffect(() => {
    const d = fetcher.data;
    if (fetcher.state !== "idle" || !d) return;
    if ("fehler" in d) shopify.toast.show(d.fehler ?? "Das hat nicht geklappt.", { isError: true });
    else shopify.toast.show(d.wunsch ? `${d.geaendert} ${d.geaendert === 1 ? "Produkt" : "Produkte"}: ${STATUS_TEXT[d.wunsch]}` : `${d.geaendert} zurückgesetzt`);
  }, [fetcher.state, fetcher.data, shopify]);

  const geheZu = (aenderung: Record<string, string | null>) => {
    const neu = new URLSearchParams(params);
    for (const [k, v] of Object.entries(aenderung)) {
      if (v === null || v === "") neu.delete(k);
      else neu.set(k, v);
    }
    navigate(`?${neu.toString()}`);
  };

  const sende = (wunsch: Wunsch | "") =>
    fetcher.submit({ wunsch, ids: JSON.stringify([...auswahl]) }, { method: "post" });

  const umschalten = (id: string, an: boolean) =>
    setAuswahl((alt) => {
      const neu = new Set(alt);
      if (an) neu.add(id);
      else neu.delete(id);
      return neu;
    });

  const alleGewaehlt = waehlbar.length > 0 && waehlbar.every((p) => auswahl.has(p.id));
  const sendet = fetcher.state !== "idle";

  return (
    <s-page heading="Produkte">
      <s-paragraph>
        Nur Produkte mit Status „Live“ zeigen den Größenberater. Alle anderen zeigen Ihre Größentabelle. Wählen Sie aus, welche Produkte wir
        vermessen sollen.
      </s-paragraph>

      <s-section padding="none">
        <s-table paginate hasNextPage={Boolean(weiter)} hasPreviousPage={Boolean(zurueck)} loading={laedt}
          onNextPage={() => weiter && geheZu({ nach: weiter, vor: null })}
          onPreviousPage={() => zurueck && geheZu({ vor: zurueck, nach: null })}
        >
          <s-grid slot="filters" gap="small-200">
            {auswahl.size > 0 ? (
              <s-stack direction="inline" gap="small-200" alignItems="center">
                <s-text type="strong">{auswahl.size} ausgewählt</s-text>
                <s-button variant="primary" disabled={sendet} loading={sendet} onClick={() => sende("vorgemerkt")}>
                  Zur Vermessung vormerken
                </s-button>
                <s-button disabled={sendet} onClick={() => sende("keine_beratung")}>
                  Keine Beratung nötig
                </s-button>
                <s-button variant="tertiary" disabled={sendet} onClick={() => sende("")}>
                  Zurücksetzen
                </s-button>
                <s-button variant="tertiary" onClick={() => setAuswahl(new Set())}>
                  Auswahl aufheben
                </s-button>
              </s-stack>
            ) : (
              <>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    geheZu({ suche, nach: null, vor: null });
                  }}
                >
                  <s-grid gridTemplateColumns="1fr auto" gap="small-200" alignItems="end">
                    <s-search-field
                      label="Produkte suchen"
                      labelAccessibilityVisibility="exclusive"
                      placeholder="Produkt suchen"
                      value={suche}
                      onInput={(e: Event) => setSuche((e.currentTarget as HTMLInputElement).value)}
                    ></s-search-field>
                    <s-button type="submit">Suchen</s-button>
                  </s-grid>
                </form>
                <s-stack direction="inline" gap="small-200">
                  {FILTER.map((f) => (
                    <s-clickable-chip
                      key={f}
                      color={filter === f ? "strong" : "base"}
                      accessibilityLabel={`Filter: ${f === "alle" ? "Alle" : STATUS_TEXT[f]}`}
                      onClick={() => geheZu({ status: f === "alle" ? null : f })}
                    >
                      {f === "alle" ? "Alle" : STATUS_TEXT[f]}
                    </s-clickable-chip>
                  ))}
                </s-stack>
                {filter !== "alle" && (weiter || zurueck) ? (
                  <s-text color="subdued">Der Filter gilt für die aktuelle Seite mit bis zu 50 Produkten.</s-text>
                ) : null}
              </>
            )}
          </s-grid>

          <s-table-header-row>
            <s-table-header>
              <s-checkbox
                accessibilityLabel="Alle änderbaren Produkte dieser Seite auswählen"
                checked={alleGewaehlt}
                disabled={waehlbar.length === 0}
                onChange={(e: Event) => setAuswahl((e.currentTarget as HTMLInputElement).checked ? new Set(waehlbar.map((p) => p.id)) : new Set())}
              ></s-checkbox>
            </s-table-header>
            <s-table-header listSlot="primary">Produkt</s-table-header>
            <s-table-header listSlot="labeled">Größen</s-table-header>
            <s-table-header listSlot="labeled">Kategorie</s-table-header>
            <s-table-header listSlot="secondary">Status</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {sichtbar.map((p) => (
              <s-table-row key={p.id}>
                <s-table-cell>
                  <s-checkbox
                    accessibilityLabel={`${p.titel} auswählen`}
                    checked={auswahl.has(p.id)}
                    disabled={!haendlerDarfAendern(p.status)}
                    onChange={(e: Event) => umschalten(p.id, (e.currentTarget as HTMLInputElement).checked)}
                  ></s-checkbox>
                </s-table-cell>
                <s-table-cell>
                  <s-stack direction="inline" gap="small-200" alignItems="center">
                    <s-thumbnail src={p.bild ?? undefined} alt="" size="small"></s-thumbnail>
                    <s-text>{p.titel}</s-text>
                  </s-stack>
                </s-table-cell>
                <s-table-cell>{p.groessen}</s-table-cell>
                <s-table-cell>{p.kategorie}</s-table-cell>
                <s-table-cell>
                  <s-badge tone={TON[p.status]}>{STATUS_TEXT[p.status]}</s-badge>
                </s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
        {sichtbar.length === 0 ? (
          <s-box padding="base">
            <s-paragraph color="subdued">Keine Produkte gefunden.</s-paragraph>
          </s-box>
        ) : null}
      </s-section>

      <s-section heading="So geht es weiter">
        <s-paragraph>
          Vorgemerkte Produkte vermessen wir, sobald die Muster bei uns sind. Danach steht dort „In Vermessung“ und nach unserer Prüfung „Live“. Ab
          dann zeigt der Größenberater bei diesem Produkt eine Empfehlung.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
