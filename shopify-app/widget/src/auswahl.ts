// „Größe übernehmen“ (Figma E39): Größe in der Größenauswahl des Themes auswählen.
//
// Themes bauen ihre Größenauswahl unterschiedlich. Deshalb drei Wege, vom sanftesten zum sichersten:
// 1. Knopf/Radio oder Auswahlliste mit dem Größen-Namen im Produktbereich anklicken bzw. setzen
//    (so, als hätte die Kundin selbst geklickt; das Theme aktualisiert Preis, Bild und Warenkorb-Knopf).
// 2. Prüfen, ob das Formular jetzt die richtige Variante trägt (input[name="id"]).
// 3. Sonst die Seite mit ?variant=<ID> neu laden. Diese Adresse muss laut Shopify jedes
//    Online-Store-2.0-Theme verstehen (shopify.dev → Themes → Support product variants → Variant deep link).

const gleich = (a: string, b: string) => a.trim().toLocaleLowerCase("de-DE") === b.trim().toLocaleLowerCase("de-DE");
const warte = (ms: number) => new Promise((fertig) => window.setTimeout(fertig, ms));

/** Bereich der Produktseite, in dem unser Block steht (Abschnitt), sonst die ganze Seite. */
function bereich(einstieg?: HTMLElement): ParentNode {
  return einstieg?.closest("section, .shopify-section, [id^='shopify-section']") ?? document;
}

function formular(wo: ParentNode): HTMLFormElement | null {
  return wo.querySelector<HTMLFormElement>("form[action*='/cart/add']") ?? document.querySelector<HTMLFormElement>("form[action*='/cart/add']");
}

function aktuelleVariante(wo: ParentNode): string | null {
  return formular(wo)?.querySelector<HTMLInputElement | HTMLSelectElement>("[name='id']")?.value ?? null;
}

/** Klickt die passende Größe in der Auswahl des Themes an. true, wenn ein passendes Element gefunden wurde. */
function klickeGroesse(wo: ParentNode, groesse: string): boolean {
  const radio = [...wo.querySelectorAll<HTMLInputElement>("input[type='radio']")].find((r) => gleich(r.value, groesse));
  if (radio) {
    if (!radio.checked) radio.click();
    return true;
  }
  for (const liste of wo.querySelectorAll<HTMLSelectElement>("select")) {
    if (liste.name === "id") continue;
    const option = [...liste.options].find((o) => gleich(o.value, groesse) || gleich(o.text, groesse));
    if (option) {
      if (liste.value !== option.value) {
        liste.value = option.value;
        liste.dispatchEvent(new Event("change", { bubbles: true }));
      }
      return true;
    }
  }
  return false;
}

export type AuswahlErgebnis = "ausgewaehlt" | "neu_laden" | "nicht_moeglich";

export async function waehleGroesse(groesse: string, variante: string | null, einstieg?: HTMLElement): Promise<AuswahlErgebnis> {
  const wo = bereich(einstieg);
  if (variante && aktuelleVariante(wo) === variante) return "ausgewaehlt";

  const gefunden = klickeGroesse(wo, groesse);
  if (gefunden) {
    if (!variante) return "ausgewaehlt";
    // Themes aktualisieren das Formular oft erst nach einem kurzen Moment.
    for (let i = 0; i < 15; i++) {
      await warte(100);
      if (aktuelleVariante(wo) === variante) return "ausgewaehlt";
    }
  }
  if (!variante) return "nicht_moeglich";

  const adresse = new URL(window.location.href);
  adresse.searchParams.set("variant", variante);
  window.location.assign(adresse.toString());
  return "neu_laden";
}
