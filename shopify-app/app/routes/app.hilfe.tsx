// Hilfe im Shopify-Admin (Figma H08). Videos und Kontaktdaten folgen vor dem Start.

import type { HeadersFunction, LoaderFunctionArgs } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { FRAGEN } from "../haendler/texte";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Hilfe() {
  return (
    <s-page heading="Hilfe">
      <s-section heading="Häufige Fragen">
        <s-stack gap="small-200">
          {FRAGEN.map((f, i) => (
            <s-stack key={f.frage} gap="small-200">
              {i > 0 ? <s-divider></s-divider> : null}
              <details>
                <summary style={{ cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center", fontWeight: 600 }}>{f.frage}</summary>
                <s-paragraph>{f.antwort}</s-paragraph>
              </details>
            </s-stack>
          ))}
        </s-stack>
      </s-section>

      <s-section heading="Anleitungen">
        <s-paragraph color="subdued">Kurze Videos zur Einrichtung, zum Platzieren des Widgets und zu den Kennzahlen folgen.</s-paragraph>
      </s-section>

      <s-section heading="Persönlich erreichbar">
        <s-paragraph color="subdued">[Kontakt-E-Mail und Antwortzeit folgen vor dem Start.]</s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
