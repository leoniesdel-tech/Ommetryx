// Stil des Widgets im Shadow DOM – Design „Warm Minimal“ (CLAUDE.md Abschnitt 10). Größen in px.

export const STIL = `
:host { all: initial; }
* { box-sizing: border-box; }

.ox {
  --linen: #F6F4EF; --graphit: #1E2326; --sekundaer: #4F575C; --ink: #0C3A4A;
  --petrol-tief: #15788C; --petrol-mittel: #238397; --apricot: #DC5E2E; --terracotta: #B8492A;
  --linie-stark: #7D868A; --linie: #D9D4CB; --fehler: #B3261E; --hinweis-flaeche: #E8F2F4;
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
.chip { position: relative; }
.chip input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.chip span { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border: 1px solid var(--linie-stark); border-radius: 999px; background: #fff; }
.chip input:checked + span { border: 2px solid var(--petrol-tief); color: var(--ink); font-weight: 600; }
.chip input:focus-visible + span { outline: 2px solid var(--petrol-tief); outline-offset: 2px; }

.ergebnis { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.kreis { flex: none; width: 96px; height: 96px; border-radius: 999px; background: var(--apricot); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 40px; line-height: 1.25; font-weight: 600; }
.ergebnis strong { display: block; font-size: 20px; line-height: 1.25; }

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
