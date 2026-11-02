// Muster-Versand im Shopify-Admin (Figma H04). MVP: Der Händler schickt eine Anfrage,
// das Ommetryx-Team meldet sich mit dem Etikett und pflegt den Status in /intern.
// Kostenregel und Mindestzahl für den Termin vor Ort sind noch offen (siehe CLAUDE.md).

import { useEffect, useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { MUSTER_ART, MUSTER_STATUS, MUSTER_TEXT, anfrageSchema, istOffen, musterSchritt } from "../haendler/muster";
import type { MusterStatus } from "../haendler/muster";
import { frageMusterAn, ladeSendungen } from "../haendler/muster.server";
import { anzahlVorgemerkt } from "../haendler/produkte.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const [sendungen, vorgemerkt] = await Promise.all([ladeSendungen(session.shop), anzahlVorgemerkt(session.shop)]);
  return { sendungen, vorgemerkt };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const form = await request.formData();
  const eingabe = anfrageSchema.safeParse({ art: form.get("art"), nachricht: form.get("nachricht") ?? "" });
  if (!eingabe.success) return { fehler: eingabe.error.issues[0]?.message ?? "Bitte prüfen Sie Ihre Eingaben." };
  return frageMusterAn(session.shop, eingabe.data);
};

const datum = (iso: string) => new Date(iso).toLocaleDateString("de-DE");

export default function MusterVersand() {
  const { sendungen, vorgemerkt } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const [art, setArt] = useState<"paket" | "termin">("paket");
  const [nachricht, setNachricht] = useState("");
  const offen = sendungen.filter((s) => istOffen(s.status));
  const frueher = sendungen.filter((s) => !istOffen(s.status));
  const sendet = fetcher.state !== "idle";

  useEffect(() => {
    const d = fetcher.data;
    if (fetcher.state !== "idle" || !d) return;
    if ("fehler" in d) shopify.toast.show(d.fehler, { isError: true });
    else {
      shopify.toast.show("Anfrage gesendet");
      setNachricht("");
    }
  }, [fetcher.state, fetcher.data, shopify]);

  return (
    <s-page heading="Muster-Versand">
      <s-paragraph>Hier sehen Sie, wo Ihre Artikel gerade sind. Nach der Vermessung kommen sie zurück.</s-paragraph>

      {offen.map((s) => (
        <s-section key={s.id} heading={`Aktuelle Sendung · ${s.anzahlArtikel} Artikel`}>
          <s-stack gap="small-200">
            <s-text color="subdued">
              {MUSTER_ART[s.art as keyof typeof MUSTER_ART] ?? s.art} · angefragt am {datum(s.erstelltAm)}
              {s.sendungsnummer ? ` · Sendungsnummer ${s.sendungsnummer}` : ""}
            </s-text>
            <s-ordered-list>
              {MUSTER_STATUS.map((st: MusterStatus, i) => (
                <s-list-item key={st}>
                  <s-text type={i + 1 === musterSchritt(s.status) ? "strong" : "generic"} color={i + 1 > musterSchritt(s.status) ? "subdued" : "base"}>
                    {MUSTER_TEXT[st]}
                    {i + 1 === musterSchritt(s.status) ? " (aktuell)" : ""}
                  </s-text>
                </s-list-item>
              ))}
            </s-ordered-list>
          </s-stack>
        </s-section>
      ))}

      <s-section heading="Neue Sendung vorbereiten">
        <s-stack gap="base">
          <s-paragraph>
            {vorgemerkt === 1 ? "1 Artikel ist" : `${vorgemerkt} Artikel sind`} zur Vermessung vorgemerkt. <s-link href="/app/produkte">Ansehen</s-link>
          </s-paragraph>
          <s-choice-list
            label="Wie kommen die Teile zu uns?"
            name="art"
            values={[art]}
            onChange={(ev: Event) => setArt(((ev.currentTarget as unknown as { values?: string[] }).values ?? [])[0] === "termin" ? "termin" : "paket")}
          >
            <s-choice value="paket">
              {MUSTER_ART.paket}
              <s-text slot="details">Sie bekommen das Versandetikett von uns per E-Mail.</s-text>
            </s-choice>
            <s-choice value="termin">
              {MUSTER_ART.termin}
              <s-text slot="details">Wir melden uns, um einen Termin zu vereinbaren.</s-text>
            </s-choice>
          </s-choice-list>
          <s-text-area
            label="Nachricht an uns (freiwillig)"
            name="nachricht"
            rows={3}
            maxLength={500}
            value={nachricht}
            onInput={(ev: Event) => setNachricht((ev.currentTarget as HTMLTextAreaElement).value)}
            details="Bitte keine Daten Ihrer Kundinnen und Kunden eintragen."
          ></s-text-area>
          <s-stack direction="inline" gap="base">
            <s-button
              variant="primary"
              disabled={vorgemerkt === 0 || sendet}
              loading={sendet}
              onClick={() => fetcher.submit({ art, nachricht }, { method: "post" })}
            >
              Anfrage senden
            </s-button>
          </s-stack>
          {vorgemerkt === 0 ? <s-text color="subdued">Merken Sie zuerst unter „Produkte“ Artikel zur Vermessung vor.</s-text> : null}
        </s-stack>
      </s-section>

      <s-section heading="Frühere Sendungen">
        {frueher.length === 0 ? (
          <s-paragraph color="subdued">Noch keine abgeschlossenen Sendungen.</s-paragraph>
        ) : (
          <s-stack gap="small-200">
            {frueher.map((s) => (
              <s-stack key={s.id} direction="inline" gap="base" alignItems="center">
                <s-text>
                  {datum(s.erstelltAm)} · {s.anzahlArtikel} Artikel
                </s-text>
                <s-badge>abgeschlossen</s-badge>
              </s-stack>
            ))}
          </s-stack>
        )}
      </s-section>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
