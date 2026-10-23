// Erfassung der Kleidungsmaße: Umrechnung, Prüfungen, Größen aus Shopify.

import { describe, expect, it } from "vitest";
import { empfehle, standardKonfiguration } from "@ommetryx/empfehlung";
import type { ErfassungEingabe } from "../app/intern/erfassung";
import { alsEmpfehlungsArtikel, eingabeAusFormular, groessenAusProdukt, pruefeErfassung, zahlAusFeld } from "../app/intern/erfassung";

const k = standardKonfiguration();

const bluse = (flach: ErfassungEingabe["groessen"][number]["flach"][]): ErfassungEingabe => ({
  artikelart: "web_oberteil",
  schnitt: "regulaer",
  materialDehnungProzent: 15,
  materialZusammensetzung: null,
  tailliert: false,
  bundTyp: null,
  aermelTyp: "eingesetzt",
  messhoeheBrustCm: null,
  groessen: flach.map((f, i) => ({ groesse: String(38 + 2 * i), shopifyVarianteId: null, reihenfolge: i, flach: f })),
});

describe("Zahlen aus Formularfeldern", () => {
  it("erlaubt Komma und Punkt", () => {
    expect(zahlAusFeld("52,5")).toBe(52.5);
    expect(zahlAusFeld("52.5")).toBe(52.5);
    expect(zahlAusFeld(" ")).toBeNull();
    expect(zahlAusFeld("5o")).toBeNaN();
  });
});

describe("Prüfung der Erfassung", () => {
  it("rechnet Umfänge × 2, Breiten und Längen bleiben", () => {
    const e = pruefeErfassung(bluse([{ brust: 50, schulter: 38, gesamtlaenge: 68 }, { brust: 52 }]), k);
    expect(e.ok).toBe(true);
    if (!e.ok) return;
    expect(e.artikel.groessen[0]!.masse).toEqual({ brust: 100, schulter: 38, gesamtlaenge: 68 });
    expect(e.artikel.messhoeheBrustCm).toBe(2.5);
    expect(e.artikel.schnittQuelle).toBe("manuell");
  });

  it("meldet unrealistische Werte mit dem Fehlercode aus v3", () => {
    const e = pruefeErfassung(bluse([{ brust: 50 }, { brust: 7 }]), k);
    expect(e.ok).toBe(false);
    if (e.ok) return;
    expect(e.fehler.g1_brust).toMatch(/^unrealistisches_ergebnis/);
  });

  it("verlangt das Primärmaß der Artikelart", () => {
    const e = pruefeErfassung(bluse([{ brust: 50 }, { schulter: 39 }]), k);
    expect(e.ok).toBe(false);
    if (e.ok) return;
    expect(e.fehler.g1_brust).toMatch(/fehlt/);
  });

  it("verlangt bei Hosen Taille und Bund-Typ", () => {
    const hose: ErfassungEingabe = { ...bluse([{ huefte: 50 }]), artikelart: "hose_web", aermelTyp: null };
    const e = pruefeErfassung(hose, k);
    expect(e.ok).toBe(false);
    if (e.ok) return;
    expect(e.fehler.g0_taille).toMatch(/fehlt/);
    expect(e.fehler.bund_typ).toBeDefined();
  });

  it("gibt einen Hinweis, wenn ein Maß von Größe zu Größe nicht wächst", () => {
    const e = pruefeErfassung(bluse([{ brust: 52 }, { brust: 51 }]), k);
    expect(e.ok).toBe(true);
    expect(e.hinweise[0]).toMatch(/Brust: Größe 40 ist nicht größer als 38/);
  });

  it("liest das Formular der Maske", () => {
    const form = new FormData();
    form.set("artikelart", "web_oberteil");
    form.set("schnitt", "regulaer");
    form.set("material_dehnung_prozent", "15");
    form.set("tailliert", "ja");
    form.set("anzahl_groessen", "1");
    form.set("g0_groesse", "40");
    form.set("g0_variante", "gid://shopify/ProductVariant/1");
    form.set("g0_brust", "52,5");
    const eingabe = eingabeAusFormular(form);
    expect(eingabe.tailliert).toBe(true);
    expect(eingabe.groessen[0]).toEqual({ groesse: "40", shopifyVarianteId: "gid://shopify/ProductVariant/1", reihenfolge: 0, flach: { brust: 52.5 } });
  });
});

describe("Größen aus dem Shopify-Produkt", () => {
  const variante = (id: string, groesse: string) => ({ id, selectedOptions: [{ name: "Farbe", value: "Blau" }, { name: "Größe", value: groesse }] });

  it("nimmt die Option „Größe“ in ihrer Reihenfolge", () => {
    const groessen = groessenAusProdukt({
      options: [
        { name: "Farbe", optionValues: [{ name: "Blau" }] },
        { name: "Größe", optionValues: [{ name: "S" }, { name: "M" }] },
      ],
      variants: { nodes: [variante("v2", "M"), variante("v1", "S")] },
    });
    expect(groessen).toEqual([
      { groesse: "S", shopifyVarianteId: "v1" },
      { groesse: "M", shopifyVarianteId: "v2" },
    ]);
  });

  it("ignoriert Shopifys Platzhalter „Title“ bei Produkten ohne Größen", () => {
    expect(groessenAusProdukt({ options: [{ name: "Title", optionValues: [{ name: "Default Title" }] }], variants: { nodes: [] } })).toEqual([]);
  });
});

describe("Durchstich: Erfassung → Empfehlung", () => {
  it("die erfasste Testbluse (flach 50/52/54/56) ergibt bei Brust 96 Größe 40", () => {
    const e = pruefeErfassung(bluse([{ brust: 50 }, { brust: 52 }, { brust: 54 }, { brust: 56 }]), k);
    if (!e.ok) throw new Error("Erfassung sollte gültig sein");
    const artikel = alsEmpfehlungsArtikel({ ...e.artikel, groessen: e.artikel.groessen.map((g) => ({ ...g, ...g.masse })) });
    const ergebnis = empfehle({ koerper: { koerpergroesse: 168, brust: 96, huefte: 102 }, artikel, passform: "regulaer" }, k);
    expect(ergebnis.recommended_size).toBe("40");
  });
});
