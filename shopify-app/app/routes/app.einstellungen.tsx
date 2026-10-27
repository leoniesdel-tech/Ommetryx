// Einstellungen im Shopify-Admin (Figma H05 „Allgemein“ teilweise, H10 „Button-Design“).
// Speichern über Shopifys Leiste „Nicht gespeicherte Änderungen“ (SaveBar, offen solange sich die Werte
// vom gespeicherten Stand unterscheiden – selbst gesteuert, weil React die Felder steuert).
// Umfrage, Vergleichsgruppe und Retourengründe folgen in einer späteren Etappe.

import { useEffect, useState } from "react";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useFetcher, useLoaderData } from "react-router";
import { SaveBar, useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { ButtonVorschau } from "../haendler/ButtonVorschau";
import { STANDARD, einstellungenSchema, pruefeButton } from "../haendler/einstellungen";
import type { Einstellungen } from "../haendler/einstellungen";
import { ladeEinstellungen, speichereEinstellungen } from "../haendler/einstellungen.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  return { einstellungen: await ladeEinstellungen(session.shop) };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  let roh: unknown;
  try {
    roh = JSON.parse(String((await request.formData()).get("einstellungen") ?? ""));
  } catch {
    return { fehler: "Ungültige Eingabe" };
  }
  const geprueft = einstellungenSchema.safeParse(roh);
  if (!geprueft.success) return { fehler: geprueft.error.issues[0]?.message ?? "Bitte prüfen Sie Ihre Eingaben." };
  if (!pruefeButton(geprueft.data).ok) return { fehler: "Diese Farbe ist zu schlecht lesbar. Bitte wählen Sie eine dunklere oder kräftigere Farbe." };
  await speichereEinstellungen(admin, session.shop, geprueft.data);
  return { ok: true };
};

const wert = (ev: Event) => (ev.currentTarget as HTMLInputElement).value;
const auswahl = (ev: Event) => ((ev.currentTarget as unknown as { values?: string[] }).values ?? [])[0] ?? "";

function Check({ ok, text }: { ok: boolean; text: string }) {
  return (
    <s-stack direction="inline" gap="small-200" alignItems="center">
      <s-icon type={ok ? "check-circle" : "alert-circle"} tone={ok ? "success" : "critical"}></s-icon>
      <s-text>{text}</s-text>
    </s-stack>
  );
}

export default function EinstellungenSeite() {
  const { einstellungen } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const [e, setE] = useState<Einstellungen>(einstellungen);
  const setze = <K extends keyof Einstellungen>(feld: K, neu: Einstellungen[K]) => setE((alt) => ({ ...alt, [feld]: neu }));
  const pruefung = pruefeButton(e);
  const eigen = e.modus === "eigen";
  const sendet = fetcher.state !== "idle";
  const geaendert = JSON.stringify(e) !== JSON.stringify(einstellungen);

  const speichern = () => {
    const geprueft = einstellungenSchema.safeParse(e);
    if (!geprueft.success) return shopify.toast.show(geprueft.error.issues[0]?.message ?? "Bitte prüfen Sie Ihre Eingaben.", { isError: true });
    if (!pruefung.ok) return shopify.toast.show("Diese Farbe ist zu schlecht lesbar.", { isError: true });
    fetcher.submit({ einstellungen: JSON.stringify(geprueft.data) }, { method: "post" });
  };

  useEffect(() => setE(einstellungen), [einstellungen]);
  useEffect(() => {
    const d = fetcher.data;
    if (fetcher.state !== "idle" || !d) return;
    if ("fehler" in d) shopify.toast.show(d.fehler ?? "Das hat nicht geklappt.", { isError: true });
    else shopify.toast.show("Einstellungen gespeichert");
  }, [fetcher.state, fetcher.data, shopify]);

  return (
    <s-page heading="Einstellungen">
      <SaveBar id="ox-einstellungen" open={geaendert}>
        <button variant="primary" onClick={speichern} disabled={sendet}>
          Speichern
        </button>
        <button onClick={() => setE(einstellungen)} disabled={sendet}>
          Verwerfen
        </button>
      </SaveBar>
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          if (geaendert) speichern();
        }}
      >
        <s-grid gridTemplateColumns="@container (inline-size > 760px) 3fr 2fr, 1fr" gap="base">
          <s-stack gap="base">
            <s-section heading="Widget im Shop">
              <s-stack gap="base">
                <s-text-field
                  label="Button-Text"
                  name="buttonText"
                  value={e.buttonText}
                  maxLength={40}
                  onInput={(ev: Event) => setze("buttonText", wert(ev))}
                ></s-text-field>
                <s-choice-list
                  label="Ansprache im Widget"
                  name="ansprache"
                  values={[e.ansprache]}
                  onChange={(ev: Event) => setze("ansprache", auswahl(ev) === "du" ? "du" : "sie")}
                  details="Passend zur Tonalität Ihres Shops. Die Du-Texte im Widget folgen in Kürze, bis dahin spricht das Widget mit „Sie“ an."
                >
                  <s-choice value="sie">Sie</s-choice>
                  <s-choice value="du">du</s-choice>
                </s-choice-list>
                <s-url-field
                  label="Link zu Ihrer Datenschutzerklärung"
                  name="datenschutzLink"
                  placeholder="https://ihr-shop.de/datenschutz"
                  value={e.datenschutzLink}
                  onInput={(ev: Event) => setze("datenschutzLink", wert(ev))}
                  details="Wir verlinken ihn im Widget neben unserer eigenen Datenschutz-Information."
                ></s-url-field>
              </s-stack>
            </s-section>

            <s-section heading="Button auf der Produktseite">
              <s-stack gap="base">
                <s-paragraph>
                  Der Button „{e.buttonText || STANDARD.buttonText}“ sitzt direkt über Ihrer Größenauswahl. Das Größen-Fenster nach dem Klick bleibt
                  immer im schlichten Ommetryx-Design.
                </s-paragraph>
                <s-choice-list
                  label="Gestaltung"
                  name="modus"
                  values={[e.modus]}
                  onChange={(ev: Event) => setze("modus", (auswahl(ev) || "theme") as Einstellungen["modus"])}
                >
                  <s-choice value="theme">
                    Wie die Buttons meines Themes (empfohlen)
                    <s-text slot="details">Farbe, Ecken und Schrift kommen aus Ihrem Theme. Der Button sieht aus wie Ihre anderen Zweit-Buttons.</s-text>
                  </s-choice>
                  <s-choice value="ommetryx">
                    Ommetryx Standard
                    <s-text slot="details">Schlichter Rahmen in Ink mit Ommetryx-Logo.</s-text>
                  </s-choice>
                  <s-choice value="eigen">
                    Eigene Gestaltung
                    <s-text slot="details">Darstellung, Farbe, Ecken und Symbol selbst festlegen.</s-text>
                  </s-choice>
                </s-choice-list>
              </s-stack>
            </s-section>

            {eigen ? (
              <s-section heading="Eigene Gestaltung">
                <s-stack gap="base">
                  <s-choice-list
                    label="Darstellung"
                    name="darstellung"
                    values={[e.darstellung]}
                    onChange={(ev: Event) => setze("darstellung", (auswahl(ev) || "umrandet") as Einstellungen["darstellung"])}
                  >
                    <s-choice value="gefuellt">Gefüllt</s-choice>
                    <s-choice value="umrandet">Umrandet</s-choice>
                    <s-choice value="link">Dezenter Link</s-choice>
                  </s-choice-list>
                  <s-color-field
                    label="Button-Farbe"
                    name="farbe"
                    value={e.farbe}
                    onChange={(ev: Event) => setze("farbe", wert(ev).toUpperCase())}
                    details="Die Schriftfarbe im Button wählen wir automatisch (Weiß oder Schwarz). Farben mit zu wenig Kontrast (unter 3 : 1) lassen sich nicht speichern."
                  ></s-color-field>
                  <s-choice-list
                    label="Ecken"
                    name="ecken"
                    values={[e.ecken]}
                    onChange={(ev: Event) => setze("ecken", (auswahl(ev) || "rund") as Einstellungen["ecken"])}
                  >
                    <s-choice value="eckig">Eckig</s-choice>
                    <s-choice value="leicht">Leicht abgerundet</s-choice>
                    <s-choice value="rund">Rund</s-choice>
                    <s-choice value="pille">Pille</s-choice>
                  </s-choice-list>
                  <s-choice-list
                    label="Symbol im Button"
                    name="symbol"
                    values={[e.symbol]}
                    onChange={(ev: Event) => setze("symbol", (auswahl(ev) || "logo") as Einstellungen["symbol"])}
                    details="„Logo einfarbig“ übernimmt die Schriftfarbe des Buttons und passt zu jedem Theme. Das farbige Logo eignet sich für umrandete Buttons auf hellem Grund."
                  >
                    <s-choice value="logo">Logo</s-choice>
                    <s-choice value="logo_einfarbig">Logo einfarbig</s-choice>
                    <s-choice value="massband">Maßband</s-choice>
                    <s-choice value="keins">Keins</s-choice>
                  </s-choice-list>
                  <s-button variant="tertiary" onClick={() => setE((alt) => ({ ...alt, darstellung: STANDARD.darstellung, farbe: STANDARD.farbe, ecken: STANDARD.ecken, symbol: STANDARD.symbol }))}>
                    Auf Standard zurücksetzen
                  </s-button>
                </s-stack>
              </s-section>
            ) : null}
          </s-stack>

          <s-stack gap="base">
            <s-section heading="Vorschau">
              <s-box padding="base" border="base" borderRadius="base" background="base">
                <s-stack gap="small-200">
                  <s-text type="strong">Leinenhemd</s-text>
                  <s-text color="subdued">59,90 €</s-text>
                  <ButtonVorschau e={e} />
                  <s-text color="subdued">Größe wählen</s-text>
                  <s-stack direction="inline" gap="small-200">
                    {["S", "M", "L", "XL"].map((g) => (
                      <s-box key={g} padding="small-200" border="base" borderRadius="small">
                        <s-text>{g}</s-text>
                      </s-box>
                    ))}
                  </s-stack>
                </s-stack>
              </s-box>
              <s-paragraph color="subdued">Beispiel auf weißem Grund. Prüfen Sie den Button bitte auch in Ihrem Shop.</s-paragraph>
            </s-section>
            <s-section heading="Lesbarkeits-Check">
              <s-stack gap="small-200">
                {eigen ? (
                  <>
                    <Check ok={pruefung.text >= 4.5} text={`Text auf dem Button · ${pruefung.text.toLocaleString("de-DE")} : 1 (mind. 4,5 : 1)`} />
                    <Check ok={pruefung.rahmen >= 3} text={`Button zum Hintergrund · ${pruefung.rahmen.toLocaleString("de-DE")} : 1 (mind. 3 : 1)`} />
                  </>
                ) : (
                  <Check ok text="Farben vorgegeben und geprüft" />
                )}
                <Check ok text={`Klickfläche ${pruefung.hoehe} px hoch (mind. 44 px)`} />
                <Check ok text="Fokusrahmen für die Tastatur immer sichtbar" />
              </s-stack>
            </s-section>
          </s-stack>
        </s-grid>
      </form>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
