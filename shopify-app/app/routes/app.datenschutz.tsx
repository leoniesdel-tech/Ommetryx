// Datenschutz & Verträge im Shopify-Admin (Figma H07). Alles Entwurf, noch nicht anwaltlich geprüft.

import { useState } from "react";
import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { ladeAvvStand } from "../haendler/einrichtung.server";
import { AVV, TEXTBAUSTEINE, UNTERAUFTRAGNEHMER, VERTRAEGE } from "../haendler/texte";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { avv: await ladeAvvStand(session.shop) };
};

type Baustein = keyof typeof TEXTBAUSTEINE;

export default function Datenschutz() {
  const { avv } = useLoaderData<typeof loader>();
  const shopify = useAppBridge();
  const [baustein, setBaustein] = useState<Baustein>("datenschutz");
  const text = TEXTBAUSTEINE[baustein].text;

  const kopieren = async () => {
    try {
      await navigator.clipboard.writeText(text);
      shopify.toast.show("Text kopiert");
    } catch {
      // In manchen Browsern ist die Zwischenablage im eingebetteten Fenster gesperrt.
      shopify.toast.show("Kopieren geht hier nicht. Bitte den Text markieren und kopieren.", { isError: true });
    }
  };

  return (
    <s-page heading="Datenschutz & Verträge">
      <s-paragraph>Alles, was Ihre Rechtsabteilung oder Ihr Datenschutzbeauftragter braucht.</s-paragraph>

      <s-banner tone="info" heading="Entwürfe">
        Alle Texte auf dieser Seite sind Entwürfe und werden vor dem Start rechtlich geprüft.
      </s-banner>

      <s-section heading="Ihre Verträge">
        <s-stack gap="base">
          <s-stack gap="small-200">
            <s-text type="strong">{AVV.titel}</s-text>
            <s-text color="subdued">
              {avv.aktuell && avv.bestaetigtAm
                ? `Version ${avv.version} · bestätigt am ${new Date(avv.bestaetigtAm).toLocaleDateString("de-DE")}`
                : `Version ${AVV.version} · noch nicht bestätigt`}
            </s-text>
          </s-stack>
          {VERTRAEGE.map((v) => (
            <s-stack key={v.titel} gap="small-200">
              <s-divider></s-divider>
              <s-text type="strong">{v.titel}</s-text>
              <s-text color="subdued">{v.hinweis}</s-text>
            </s-stack>
          ))}
        </s-stack>
      </s-section>

      <s-section heading="Unterauftragsverarbeiter">
        <s-table>
          <s-table-header-row>
            <s-table-header listSlot="primary">Dienst</s-table-header>
            <s-table-header listSlot="labeled">Zweck</s-table-header>
            <s-table-header listSlot="labeled">Ort</s-table-header>
          </s-table-header-row>
          <s-table-body>
            {UNTERAUFTRAGNEHMER.map((u) => (
              <s-table-row key={u.name}>
                <s-table-cell>{u.name}</s-table-cell>
                <s-table-cell>{u.zweck}</s-table-cell>
                <s-table-cell>{u.ort}</s-table-cell>
              </s-table-row>
            ))}
          </s-table-body>
        </s-table>
        <s-paragraph color="subdued">Bei Änderungen informieren wir Sie vorher per E-Mail. [Frist festlegen]</s-paragraph>
      </s-section>

      <s-section heading="Textbausteine für Ihre Website">
        <s-stack gap="base">
          <s-stack direction="inline" gap="small-200">
            {(Object.keys(TEXTBAUSTEINE) as Baustein[]).map((b) => (
              <s-button key={b} variant={b === baustein ? "primary" : "secondary"} onClick={() => setBaustein(b)}>
                {TEXTBAUSTEINE[b].titel}
              </s-button>
            ))}
          </s-stack>
          <s-box padding="base" background="subdued" borderRadius="base">
            <s-paragraph>{text}</s-paragraph>
          </s-box>
          <s-stack direction="inline" gap="base">
            <s-button onClick={() => void kopieren()}>Text kopieren</s-button>
          </s-stack>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
