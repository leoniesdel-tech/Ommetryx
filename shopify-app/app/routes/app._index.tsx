// Startseite im Shopify-Admin (Figma H01, H09, H02 leer):
// Einrichtung in 5 Schritten, AVV-Bestätigung, Status des Widgets, Abdeckung.
// Kennzahlen (Nutzung, Umfrage, Retouren) folgen, sobald sie erfasst werden – bis dahin leerer Zustand.

import { useEffect, useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
// Wichtig: Was die Seiten-Komponente braucht, darf nicht aus einer .server-Datei kommen.
import { einrichtungsSchritte } from "../haendler/einrichtung";
import { bestaetigeAvv, ladeEinrichtung, setzeAusgeblendet, setzePositionGeprueft } from "../haendler/einrichtung.server";
import { AVV, BLOCK_HANDLE, EXTENSION_HANDLE } from "../haendler/texte";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const einrichtung = await ladeEinrichtung(admin, session.shop);
  const apiKey = process.env.SHOPIFY_API_KEY ?? "";
  // Offizieller Direktlink: öffnet den Theme-Editor auf der Produktseite und setzt unseren Block in den Hauptbereich.
  const themeEditor = `shopify://admin/themes/current/editor?template=product&addAppBlockId=${apiKey}/${BLOCK_HANDLE}&target=mainSection`;
  return { einrichtung, themeEditor, shopUrl: `https://${session.shop}` };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const form = await request.formData();
  switch (form.get("aktion")) {
    case "avv":
      if (form.get("zustimmung") !== "ja") return { fehler: "Bitte bestätigen Sie den Vertrag mit dem Häkchen." };
      await bestaetigeAvv(admin, session.shop);
      return { ok: true };
    case "position":
      await setzePositionGeprueft(session.shop, form.get("geprueft") === "ja");
      return { ok: true };
    case "ausblenden":
      await setzeAusgeblendet(session.shop, true);
      return { ok: true };
    case "einblenden":
      await setzeAusgeblendet(session.shop, false);
      return { ok: true };
  }
  return { fehler: "Unbekannte Aktion" };
};

interface ErweiterungsInfo {
  handle: string;
  activations?: { handle: string; status: string }[];
}

/** Ist unser Block im veröffentlichten Theme aktiv? null = unbekannt (z. B. außerhalb des Admins). */
function useWidgetAktiv() {
  const shopify = useAppBridge();
  const [aktiv, setAktiv] = useState<boolean | null>(null);
  const [runde, setRunde] = useState(0);
  useEffect(() => {
    const app = (shopify as unknown as { app?: { extensions?: () => Promise<ErweiterungsInfo[]> } }).app;
    if (!app?.extensions) return;
    let vorbei = false;
    app
      .extensions()
      .then((liste) => {
        const block = liste.find((e) => e.handle === EXTENSION_HANDLE)?.activations?.find((a) => a.handle === BLOCK_HANDLE);
        if (!vorbei) setAktiv(block?.status === "active");
      })
      .catch(() => {
        if (!vorbei) setAktiv(null);
      });
    return () => {
      vorbei = true;
    };
  }, [shopify, runde]);
  return { aktiv, neuPruefen: () => setRunde((r) => r + 1) };
}

type SchrittId = ReturnType<typeof einrichtungsSchritte>["schritte"][number]["id"];

const TITEL: Record<SchrittId, string> = {
  avv: "Auftragsverarbeitungsvertrag bestätigen",
  widget: "Widget im Shop aktivieren",
  position: "Position des Buttons prüfen",
  artikel: "Artikel für die Vermessung auswählen",
  muster: "Muster zu uns bringen",
};

export default function Startseite() {
  const { einrichtung: e, themeEditor, shopUrl } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const { aktiv: widgetAktiv, neuPruefen } = useWidgetAktiv();
  const [zustimmung, setZustimmung] = useState(false);
  const { schritte, erledigt, gesamt } = einrichtungsSchritte(e, widgetAktiv);
  const offen = schritte.find((s) => !s.erledigt)?.id;
  const sendet = fetcher.state !== "idle";
  const sende = (daten: Record<string, string>) => fetcher.submit(daten, { method: "post" });

  const details = (id: SchrittId) => {
    switch (id) {
      case "avv":
        return (
          <s-stack gap="base">
            <s-stack direction="inline" gap="small-200" alignItems="center">
              <s-badge tone="caution">Entwurf · wird noch rechtlich geprüft</s-badge>
              <s-text color="subdued">Version {AVV.version}</s-text>
            </s-stack>
            <s-paragraph>{AVV.kurz}</s-paragraph>
            <s-checkbox
              label={AVV.zustimmung}
              checked={zustimmung}
              onChange={(ev: Event) => setZustimmung((ev.currentTarget as HTMLInputElement).checked)}
            ></s-checkbox>
            {fetcher.data && "fehler" in fetcher.data ? <s-text tone="critical">{fetcher.data.fehler}</s-text> : null}
            <s-stack direction="inline" gap="base">
              <s-button
                variant="primary"
                disabled={!zustimmung || sendet}
                loading={sendet}
                onClick={() => sende({ aktion: "avv", zustimmung: zustimmung ? "ja" : "nein" })}
              >
                AVV bestätigen
              </s-button>
            </s-stack>
          </s-stack>
        );
      case "widget":
        return (
          <s-stack gap="base">
            <s-paragraph>
              Wir öffnen den Theme-Editor mit dem Ommetryx-Block auf der Produktseite. Sie müssen nur noch auf „Speichern“ klicken.
            </s-paragraph>
            <s-stack direction="inline" gap="base" alignItems="center">
              <s-button variant="primary" href={themeEditor} target="_top">
                Im Theme-Editor aktivieren
              </s-button>
              <s-button variant="tertiary" onClick={neuPruefen}>
                Erneut prüfen
              </s-button>
            </s-stack>
            {widgetAktiv === null ? (
              <s-text color="subdued">Den Status können wir hier gerade nicht abfragen. Prüfen Sie ihn im Theme-Editor.</s-text>
            ) : null}
          </s-stack>
        );
      case "position":
        return (
          <s-stack gap="base">
            <s-paragraph>
              Der Button gehört direkt über die Größenauswahl. Sehen Sie sich eine Produktseite an, die Ommetryx bereits vermessen hat.
            </s-paragraph>
            <s-stack direction="inline" gap="base" alignItems="center">
              <s-button href={shopUrl} target="_blank">
                Shop ansehen
              </s-button>
              <s-button variant="primary" disabled={sendet} onClick={() => sende({ aktion: "position", geprueft: "ja" })}>
                Der Button sitzt gut
              </s-button>
            </s-stack>
          </s-stack>
        );
      case "artikel":
        return (
          <s-stack gap="base">
            <s-paragraph>Wählen Sie die Produkte aus, die wir vermessen sollen. Produkte ohne Größen (z. B. Taschen) können Sie ausnehmen.</s-paragraph>
            <s-stack direction="inline" gap="base">
              <s-button variant="primary" href="/app/produkte">
                Produkte auswählen
              </s-button>
            </s-stack>
          </s-stack>
        );
      case "muster":
        return (
          <s-paragraph>
            Wir vermessen jedes Kleidungsstück in jeder Größe selbst. Schicken Sie uns je Größe ein Muster oder vereinbaren Sie einen Termin vor
            Ort. Die Seite „Muster-Versand“ dafür folgt in Kürze.
          </s-paragraph>
        );
    }
  };

  return (
    <s-page heading="Startseite">
      {!e.avvBestaetigt ? (
        <s-banner tone="warning" heading="Das Widget ist noch nicht live">
          Bitte bestätigen Sie zuerst den Auftragsverarbeitungsvertrag (AVV) in Schritt 1. Ohne ihn dürfen wir keine Körpermaße Ihrer
          Kundinnen und Kunden verarbeiten.
        </s-banner>
      ) : widgetAktiv ? (
        <s-banner tone="success" heading="Widget ist aktiv">
          Der Ommetryx-Button ist im veröffentlichten Theme eingebaut.{" "}
          <s-link href={themeEditor} target="_top">
            Im Theme-Editor ansehen
          </s-link>
        </s-banner>
      ) : null}

      {e.ausgeblendet ? (
        <s-section>
          <s-stack direction="inline" gap="base" alignItems="center">
            <s-text>
              Einrichtung: {erledigt} von {gesamt} Schritten erledigt.
            </s-text>
            <s-button variant="tertiary" onClick={() => sende({ aktion: "einblenden" })}>
              Einrichtung anzeigen
            </s-button>
          </s-stack>
        </s-section>
      ) : (
        <s-section>
          <s-grid gap="base">
            <s-grid gridTemplateColumns="1fr auto" gap="small-300" alignItems="center">
              <s-heading>Ommetryx einrichten</s-heading>
              <s-button variant="tertiary" onClick={() => sende({ aktion: "ausblenden" })}>
                Später erinnern
              </s-button>
            </s-grid>
            <s-paragraph>In 5 Schritten zur ersten Größenempfehlung in Ihrem Shop.</s-paragraph>
            <s-paragraph color="subdued">
              {erledigt} von {gesamt} erledigt
            </s-paragraph>
            <s-box borderRadius="base" border="base" background="base">
              {schritte.map((s, i) => (
                <s-box key={s.id}>
                  {i > 0 ? <s-divider></s-divider> : null}
                  <s-box padding="small">
                    <s-stack direction="inline" gap="small-200" alignItems="center">
                      <s-icon type={s.erledigt ? "check-circle" : "circle"} tone={s.erledigt ? "success" : "auto"}></s-icon>
                      <s-text type={s.id === offen ? "strong" : "generic"}>{TITEL[s.id]}</s-text>
                      {s.erledigt ? <s-text color="subdued">erledigt</s-text> : null}
                    </s-stack>
                  </s-box>
                  {s.id === offen ? (
                    <s-box padding="small" paddingBlockStart="none">
                      <s-box padding="base" background="subdued" borderRadius="base">
                        {details(s.id)}
                      </s-box>
                    </s-box>
                  ) : null}
                </s-box>
              ))}
            </s-box>
          </s-grid>
        </s-section>
      )}

      <s-section heading="Abdeckung">
        <s-paragraph>
          {e.produkteGesamt === null
            ? `${e.produkteVermessen} Produkte vermessen`
            : `${e.produkteVermessen} von ${e.produkteGesamt} Produkten vermessen`}
          {e.produkteVorgemerkt > 0 ? `, ${e.produkteVorgemerkt} zur Vermessung vorgemerkt` : ""}
        </s-paragraph>
        <s-link href="/app/produkte">Zu den Produkten</s-link>
        <s-paragraph color="subdued">
          Ohne Maße zeigt das Widget bei einem Produkt nichts an. Ihre Kundinnen und Kunden sehen dann Ihre Größentabelle.
        </s-paragraph>
      </s-section>

      <s-section heading="Nutzung und Retouren">
        <s-paragraph color="subdued">
          Noch keine Daten. Sobald genug Kundinnen und Kunden das Widget genutzt haben, sehen Sie hier Nutzung, übernommene Empfehlungen und
          Retouren mit und ohne Ommetryx – immer zusammengefasst, nie einzelne Personen.
        </s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
