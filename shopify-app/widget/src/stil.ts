// Stil des Widgets im Shadow DOM – Design „Warm Minimal“ (CLAUDE.md Abschnitt 10). Größen in px.

export const STIL = `
:host { all: initial; }
* { box-sizing: border-box; }

.ox {
  --linen: #F6F4EF; --graphit: #1E2326; --sekundaer: #4F575C; --ink: #0C3A4A;
  --petrol-tief: #15788C; --petrol-mittel: #238397; --apricot: #DC5E2E; --terracotta: #B8492A;
  --linie-stark: #7D868A; --linie: #D9D4CB; --fehler: #B3261E;
  font-family: "Sora", system-ui, -apple-system, "Segoe UI", sans-serif;
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
.feld input { height: 48px; font: inherit; font-size: 16px; padding: 0 12px; border: 1px solid var(--linie-stark); border-radius: 12px; background: #fff; color: var(--graphit); }
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

.nur-vorleser { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
`;
