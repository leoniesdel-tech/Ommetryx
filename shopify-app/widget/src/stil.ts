// Stil des Widgets im Shadow DOM – Design „Warm Minimal“ (CLAUDE.md Abschnitt 10). Größen in px.

export const STIL = `
:host { all: initial; }
* { box-sizing: border-box; }

.ox {
  --linen: #F6F4EF; --graphit: #1E2326; --sekundaer: #4F575C; --ink: #0C3A4A;
  --petrol-tief: #15788C; --petrol-mittel: #238397; --apricot: #DC5E2E; --terracotta: #B8492A;
  --linie-stark: #7D868A; --linie: #D9D4CB; --fehler: #B3261E; --hinweis-flaeche: #E8F2F4; --zone-passt: #9CCAD4;
  /* Bewegungs-Tokens (Figma „Spezifikation · Ladebildschirm und Bewegung“) */
  --instant: 100ms cubic-bezier(0.2, 0, 0, 1);
  --fast: 180ms cubic-bezier(0.3, 0, 1, 1);
  --standard: 280ms cubic-bezier(0.2, 0, 0, 1);
  --enter-kurve: cubic-bezier(0.05, 0.7, 0.1, 1);
  font-family: "Ommetryx Sora", system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 16px; line-height: 1.5; color: var(--graphit);
}

.abdunklung {
  position: fixed; inset: 0; z-index: 2147483000;
  background: rgba(12, 58, 74, 0.4);
  animation: ein-blende 300ms ease-out;
}

.fenster {
  position: fixed; z-index: 2147483001; background: var(--linen);
  box-shadow: 0 -4px 24px rgba(12, 58, 74, 0.12);
  display: flex; flex-direction: column;
  left: 0; right: 0; bottom: 0; max-height: 92vh; border-radius: 16px 16px 0 0;
  animation: ein-unten 300ms cubic-bezier(0.2, 0.8, 0.2, 1);
}
@media (min-width: 768px) {
  .fenster { top: 0; bottom: 0; left: auto; width: 440px; max-height: none; border-radius: 16px 0 0 16px; animation-name: ein-seite; }
}
.ox.schliesst .fenster { animation: aus-unten 220ms ease-in forwards; }
.ox.schliesst .abdunklung { animation: aus-blende 220ms ease-in forwards; }
@media (min-width: 768px) { .ox.schliesst .fenster { animation-name: aus-seite; } }

@keyframes ein-blende { from { opacity: 0; } }
@keyframes aus-blende { to { opacity: 0; } }
@keyframes ein-unten { from { transform: translateY(100%); } }
@keyframes aus-unten { to { transform: translateY(100%); } }
@keyframes ein-seite { from { transform: translateX(100%); } }
@keyframes aus-seite { to { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) {
  .abdunklung, .fenster, .ox.schliesst .fenster, .ox.schliesst .abdunklung { animation: none; }
}

.kopf { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 20px 8px; }
.marke { font-weight: 600; font-size: 14px; color: var(--ink); letter-spacing: -0.015em; }
.inhalt { padding: 8px 20px 24px; overflow-y: auto; }

h2 { font-size: 20px; line-height: 1.25; font-weight: 600; margin: 0 0 12px; }
h2:focus { outline: none; }
p { margin: 0 0 12px; }
.leise { color: var(--sekundaer); font-size: 14px; }
.entwurf { display: inline-block; font-size: 12px; font-weight: 600; color: var(--terracotta); border: 1px solid var(--terracotta); border-radius: 999px; padding: 2px 10px; margin-bottom: 12px; }

button { font: inherit; cursor: pointer; }
:focus-visible { outline: 2px solid var(--petrol-tief); outline-offset: 2px; }

.schliessen { width: 44px; height: 44px; border-radius: 999px; border: 1px solid var(--linie-stark); background: #fff; color: var(--graphit); font-size: 20px; line-height: 1; }

.primaer { display: block; width: 100%; min-height: 48px; border: none; border-radius: 12px; background: var(--ink); color: #fff; font-weight: 600; padding: 0 20px; }
.primaer[disabled] { opacity: 0.55; cursor: not-allowed; }
.sekundaer { display: block; width: 100%; min-height: 44px; margin-top: 12px; border: 1px solid var(--linie-stark); border-radius: 12px; background: #fff; color: var(--ink); font-weight: 600; padding: 0 16px; }
.link { background: none; border: none; color: var(--petrol-tief); text-decoration: underline; padding: 8px 0; min-height: 44px; text-align: left; }

.karte { background: #fff; border: 1px solid var(--linie); border-radius: 16px; padding: 16px; margin-bottom: 16px; }

.wahl { display: flex; gap: 12px; align-items: flex-start; padding: 8px 0; }
.wahl input { width: 24px; height: 24px; margin: 2px 0 0; flex: none; accent-color: var(--petrol-tief); }

.feld { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; }
.feld label { font-weight: 600; font-size: 14px; }
.feld input, .feld select { height: 48px; font: inherit; font-size: 16px; padding: 0 12px; border: 1px solid var(--linie-stark); border-radius: 12px; background: #fff; color: var(--graphit); }
.feld input[aria-invalid="true"] { border: 2px solid var(--fehler); }
.fehler { color: var(--fehler); font-size: 14px; }

fieldset { border: none; padding: 0; margin: 0 0 20px; }
legend { font-weight: 600; font-size: 14px; margin-bottom: 8px; padding: 0; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
/* Passform: vier Chips in einer Reihe (Figma E09), bei Zoom umbrechend */
.chips[role=radiogroup] { display: grid; grid-template-columns: repeat(auto-fit, minmax(72px, 1fr)); gap: 6px; }
.chips[role=radiogroup] .chip span { display: flex; justify-content: center; padding: 0 4px; font-size: 14px; border-radius: 12px; }
.chip { position: relative; }
.chip input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.chip span { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border: 1px solid var(--linie-stark); border-radius: 999px; background: #fff; }
.chip input:checked + span { border: 2px solid var(--petrol-tief); color: var(--ink); font-weight: 600; }
.chip input:focus-visible + span { outline: 2px solid var(--petrol-tief); outline-offset: 2px; }

/* Ergebnis (Figma E09, E10): Karte mit Apricot-Kreis – Apricot nur hier, einmal pro Screen */
.karte-ergebnis { background: var(--hinweis-flaeche); border-radius: 16px; padding: 16px; margin-bottom: 16px; }
.karte-ergebnis.mit-kreis { display: flex; align-items: center; gap: 16px; }
.karte-ergebnis h2 { margin: 0 0 4px; }
.karte-ergebnis p { margin: 0 0 4px; font-size: 14px; }
.karte-ergebnis p:last-child { margin-bottom: 0; }
.kreis { flex: none; width: 64px; height: 64px; border-radius: 999px; background: var(--apricot); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; line-height: 1; font-weight: 600; }

/* Zwischen zwei Größen (E38) */
.karte-zwei { border: 2px solid var(--petrol-tief); border-radius: 16px; padding: 16px; margin-bottom: 16px; background: #fff; }
.zwei-kopf { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.zwei-kopf h2 { margin: 0 0 12px; }
.marke-klein { flex: none; font-size: 12px; font-weight: 600; color: var(--ink); border: 1px solid var(--ink); border-radius: 999px; padding: 2px 10px; }
.zwei-raster { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
.mini { background: var(--hinweis-flaeche); border-radius: 12px; padding: 12px; }
.mini strong { display: block; font-size: 20px; margin-bottom: 4px; }
.mini p { margin: 0; font-size: 14px; color: var(--sekundaer); }
.karte-zwei > p { margin: 0; font-size: 14px; }

/* Passform je Zone (E09b) */
details.zonen { border: 1px solid var(--linie); border-radius: 16px; background: #fff; margin-bottom: 16px; }
details.zonen summary { cursor: pointer; list-style: none; display: flex; align-items: center; justify-content: space-between; min-height: 48px; padding: 0 16px; font-weight: 600; border-radius: 16px; }
details.zonen summary::-webkit-details-marker { display: none; }
details.zonen summary::after { content: ""; width: 8px; height: 8px; border-right: 2px solid var(--graphit); border-bottom: 2px solid var(--graphit); transform: rotate(45deg) translate(-2px, -2px); transition: transform var(--fast); }
details.zonen[open] summary::after { transform: rotate(-135deg) translate(-2px, -2px); }
.zonen-inhalt { padding: 0 16px 16px; }
.zonen-kopf { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 12px; }
.umschalter { display: inline-flex; border: 1px solid var(--linie-stark); border-radius: 12px; overflow: hidden; }
.umschalter button { min-height: 44px; padding: 0 14px; border: none; background: #fff; color: var(--graphit); font: inherit; font-size: 14px; }
.umschalter button[aria-pressed="true"] { background: var(--ink); color: #fff; font-weight: 600; }
.umschalter button:focus-visible { outline-offset: -4px; }
.zonen-raster { display: grid; grid-template-columns: 88px 1fr; gap: 16px; align-items: start; }
.silhouette { width: 88px; height: auto; display: block; }
.silhouette .umriss { fill: #EFEAE2; stroke: #CFC7BA; stroke-width: 1; }
.silhouette .passt { fill: var(--zone-passt); }
.silhouette .eng { fill: var(--terracotta); }
.silhouette .weit { fill: var(--linie-stark); }
.zonen-liste { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }
.zone-text { display: flex; justify-content: space-between; gap: 8px; font-size: 14px; margin-bottom: 6px; }
.zone-text > span { color: var(--sekundaer); text-align: right; }
.skala { position: relative; height: 6px; border-radius: 999px; background: var(--linie); }
.skala .wunsch { position: absolute; left: 33.33%; width: 33.34%; top: 0; bottom: 0; background: var(--zone-passt); }
.skala .punkt { position: absolute; top: 50%; width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 999px; background: var(--petrol-tief); border: 2px solid #fff; box-shadow: 0 0 0 1px var(--petrol-tief); }
.skala .punkt.eng { background: var(--terracotta); box-shadow: 0 0 0 1px var(--terracotta); }
.achse { display: flex; justify-content: space-between; font-size: 12px; color: var(--sekundaer); margin: 12px 0 8px; }
.legende { list-style: none; display: flex; flex-wrap: wrap; gap: 4px 16px; padding: 0; margin: 0 0 12px; font-size: 12px; color: var(--sekundaer); }
.legende li { display: flex; align-items: center; gap: 6px; }
.farbe { width: 16px; height: 6px; border-radius: 999px; }
.farbe.passt { background: var(--zone-passt); }
.farbe.eng { background: var(--terracotta); }
.farbe.weit { background: var(--linie-stark); }
.zonen-inhalt > p { margin: 0; font-size: 12px; }

/* Ihre Angaben (E37) */
.angaben { scroll-margin-top: 16px; }
.angaben-kopf { display: flex; align-items: center; justify-content: space-between; }
.angaben ul { list-style: none; margin: 4px 0 8px; padding: 0; }
.angaben li { display: flex; align-items: center; justify-content: space-between; gap: 8px; border-bottom: 1px solid var(--linie); font-size: 14px; }
.angaben .link, .angaben-kopf .link { font-size: 14px; }
.angaben > p { margin: 0; font-size: 12px; }

.fuss-links { display: flex; justify-content: space-between; gap: 8px; margin-top: 4px; }
.fuss-links { flex-wrap: wrap; }
.fuss-links .link { font-size: 14px; min-height: 44px; white-space: nowrap; }

/* Kopfzeile der Mess-Schritte: Zurück · „Brust · 2 von 4“ · Schließen, darunter Fortschritt */
.kopf-schritt { display: grid; grid-template-columns: 44px 1fr 44px; align-items: center; gap: 8px; padding: 12px 12px 8px; }
.kopf-schritt .titel { text-align: center; font-size: 14px; color: var(--sekundaer); }
.zurueck { width: 44px; height: 44px; border: none; background: none; color: var(--graphit); font-size: 22px; border-radius: 999px; }
.fortschritt { height: 4px; background: var(--linie); }
.fortschritt span { display: block; height: 100%; background: var(--petrol-mittel); transition: width var(--standard); }

/* Video-Platzhalter (echte Videos folgen) */
.video { position: relative; height: 200px; margin: 0 -20px 20px; background: linear-gradient(135deg, #50A2B6 0%, #15788C 45%, #0C3A4A 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; color: #fff; font-size: 13px; text-align: center; padding: 0 16px; }
.video .abspielen { width: 56px; height: 56px; border-radius: 999px; background: var(--petrol-mittel); display: flex; align-items: center; justify-content: center; }

.warum { color: var(--sekundaer); margin-bottom: 16px; }
.mit-einheit { display: flex; align-items: center; gap: 12px; }
.mit-einheit input { flex: 1; min-width: 0; }
.einheit { color: var(--sekundaer); }

details.tipp { margin: 4px 0 16px; }
details.tipp summary { cursor: pointer; color: var(--petrol-tief); text-decoration: underline; min-height: 44px; display: flex; align-items: center; gap: 8px; list-style: none; }
details.tipp summary::-webkit-details-marker { display: none; }
details.tipp summary::before { content: "i"; display: inline-flex; width: 18px; height: 18px; border: 1.5px solid currentColor; border-radius: 999px; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; text-decoration: none; }
details.tipp p { margin: 4px 0 0; }

/* Nachfrage (Plausibilität, Figma E17) */
.nachfrage { background: var(--hinweis-flaeche); border-radius: 12px; padding: 16px; margin: -4px 0 16px; }
.nachfrage p { margin: 0 0 12px; }
.knoepfe { display: flex; flex-wrap: wrap; gap: 8px; }
.knoepfe .primaer, .knoepfe .sekundaer { width: auto; margin: 0; }

/* Feste Fußleiste mit dem Hauptknopf (Figma E03–E06: „Weiter“ bleibt unten sichtbar) */
.fuss { position: sticky; bottom: -24px; margin: 0 -20px -24px; padding: 12px 20px 24px; background: var(--linen); border-top: 1px solid var(--linie); }

.karte-knopf { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: left; min-height: 56px; padding: 12px 16px;
  border: 1px solid var(--linie-stark); border-radius: 12px; background: #fff; color: var(--graphit); margin-bottom: 16px; }
.karte-knopf strong { display: block; font-size: 14px; }
.karte-knopf span { font-size: 14px; color: var(--sekundaer); }

/* Ladebildschirm (Figma E36): Bildmarke in drei Etappen, Liste mit Häkchen */
.berechnung { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 48px 0 24px; }
.logo { width: 120px; height: 84px; margin-bottom: 24px; }
.logo-innen { position: relative; width: 171px; height: 119px; transform: scale(0.7018); transform-origin: top left; }
.ebene { position: absolute; }
.ebene img { position: absolute; inset: 0; display: block; width: 100%; height: 100%; max-width: none; }
.stufe { position: absolute; inset: 0; clip-path: inset(0 100% 0 0); transition: clip-path var(--etappe, 500ms) cubic-bezier(0.2, 0, 0, 1); }
.stufe.zeigen { clip-path: inset(0 0 0 0); }
.schritte-liste { list-style: none; padding: 0; margin: 16px 0 24px; text-align: left; }
.schritte-liste li { display: flex; align-items: center; gap: 12px; padding: 6px 0; color: var(--sekundaer); }
.schritte-liste li.aktiv { color: var(--graphit); font-weight: 600; }
.schritte-liste li.fertig { color: var(--graphit); }
.marke-punkt { flex: none; width: 22px; height: 22px; border-radius: 999px; border: 2px solid var(--linie-stark); display: inline-flex; align-items: center; justify-content: center; }
li.fertig .marke-punkt { background: var(--petrol-tief); border-color: var(--petrol-tief); }
li.fertig .marke-punkt::after { content: ""; width: 9px; height: 5px; border-left: 2px solid #fff; border-bottom: 2px solid #fff; transform: rotate(-45deg) translate(1px, -1px); }
li.aktiv .marke-punkt { border-color: var(--petrol-tief); }
li.aktiv .marke-punkt::after { content: ""; width: 8px; height: 8px; border-radius: 999px; background: var(--apricot); }

/* Ergebnis-Reveal: Kreis 85 → 100 %, Buchstabe 80 ms später, danach je 40 ms versetzt */
.reveal .kreis { animation: kreis-ein 350ms var(--enter-kurve) both; }
.reveal .kreis span { animation: ein-blende 200ms ease-out 80ms both; }
.reveal .folge > * { animation: folge-ein 280ms var(--enter-kurve) both; }
.reveal .folge > *:nth-child(2) { animation-delay: 40ms; }
.reveal .folge > *:nth-child(3) { animation-delay: 80ms; }
.reveal .folge > *:nth-child(4) { animation-delay: 120ms; }
.reveal .folge > *:nth-child(n+5) { animation-delay: 160ms; }
@keyframes kreis-ein { from { transform: scale(0.85); opacity: 0; } }
@keyframes folge-ein { from { transform: translateY(6px); opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .stufe { clip-path: none; transition: none; }
  .reveal .kreis, .reveal .kreis span, .reveal .folge > * { animation: none; }
  .fortschritt span { transition: none; }
}

.nur-vorleser { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
`;
