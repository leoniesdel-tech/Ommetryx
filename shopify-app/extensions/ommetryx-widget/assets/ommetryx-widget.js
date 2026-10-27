"use strict";(()=>{var ne=Object.defineProperty;var se=(s,e,t)=>e in s?ne(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var l=(s,e,t)=>se(s,typeof e!="symbol"?e+"":e,t);var g={verarbeitung:{version:"entwurf-1",text:"Ich willige ein, dass Ommetryx meine K\xF6rperma\xDFe verarbeitet, um mir eine Gr\xF6\xDFe zu empfehlen. K\xF6rperma\xDFe k\xF6nnen R\xFCckschl\xFCsse auf meine Gesundheit zulassen. Ohne Profil werden die Ma\xDFe nicht gespeichert. Ich kann die Einwilligung jederzeit widerrufen."},profil:{version:"entwurf-1",text:"Ich willige ein, dass Ommetryx meine K\xF6rperma\xDFe und meine E-Mail-Adresse speichert, um mir in allen Shops mit Ommetryx Gr\xF6\xDFen zu empfehlen. Die Ma\xDFe werden verschl\xFCsselt und getrennt von meiner E-Mail-Adresse gespeichert. Neue Ma\xDFe \xFCberschreiben die alten. Ich kann die Einwilligung jederzeit unter \u201EMein Ommetryx\u201C widerrufen; dann wird mein Profil sofort gel\xF6scht. Nach 24 Monaten ohne Nutzung wird es automatisch gel\xF6scht."},alter16:{version:"entwurf-1",text:"Ich bin mindestens 16 Jahre alt."}},G=["16-29","30-44","45-59","60+"];var _=`
:host { all: initial; }
* { box-sizing: border-box; }

.ox {
  --linen: #F6F4EF; --graphit: #1E2326; --sekundaer: #4F575C; --ink: #0C3A4A;
  --petrol-tief: #15788C; --petrol-mittel: #238397; --apricot: #DC5E2E; --terracotta: #B8492A;
  --linie-stark: #7D868A; --linie: #D9D4CB; --fehler: #B3261E; --hinweis-flaeche: #E8F2F4; --zone-passt: #9CCAD4;
  /* Bewegungs-Tokens (Figma \u201ESpezifikation \xB7 Ladebildschirm und Bewegung\u201C) */
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

/* Ergebnis (Figma E09, E10): Karte mit Apricot-Kreis \u2013 Apricot nur hier, einmal pro Screen */
.karte-ergebnis { background: var(--hinweis-flaeche); border-radius: 16px; padding: 16px; margin-bottom: 16px; }
.karte-ergebnis.mit-kreis { display: flex; align-items: center; gap: 16px; }
.karte-ergebnis h2 { margin: 0 0 4px; }
.karte-ergebnis p { margin: 0 0 4px; font-size: 14px; }
.karte-ergebnis p:last-child { margin-bottom: 0; }
.kreis { flex: none; width: 64px; height: 64px; border-radius: 999px; background: var(--apricot); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 24px; line-height: 1; font-weight: 600; }

/* Zwischen zwei Gr\xF6\xDFen (E38) */
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

/* Kopfzeile der Mess-Schritte: Zur\xFCck \xB7 \u201EBrust \xB7 2 von 4\u201C \xB7 Schlie\xDFen, darunter Fortschritt */
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

/* Nachfrage (Plausibilit\xE4t, Figma E17) */
.nachfrage { background: var(--hinweis-flaeche); border-radius: 12px; padding: 16px; margin: -4px 0 16px; }
.nachfrage p { margin: 0 0 12px; }
.knoepfe { display: flex; flex-wrap: wrap; gap: 8px; }
.knoepfe .primaer, .knoepfe .sekundaer { width: auto; margin: 0; }

/* Feste Fu\xDFleiste mit dem Hauptknopf (Figma E03\u2013E06: \u201EWeiter\u201C bleibt unten sichtbar) */
.fuss { position: sticky; bottom: -24px; margin: 0 -20px -24px; padding: 12px 20px 24px; background: var(--linen); border-top: 1px solid var(--linie); }

.karte-knopf { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 12px; text-align: left; min-height: 56px; padding: 12px 16px;
  border: 1px solid var(--linie-stark); border-radius: 12px; background: #fff; color: var(--graphit); margin-bottom: 16px; }
.karte-knopf strong { display: block; font-size: 14px; }
.karte-knopf span { font-size: 14px; color: var(--sekundaer); }

/* Ladebildschirm (Figma E36): Bildmarke in drei Etappen, Liste mit H\xE4kchen */
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

/* Ergebnis-Reveal: Kreis 85 \u2192 100 %, Buchstabe 80 ms sp\xE4ter, danach je 40 ms versetzt */
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
`;var f=[{feld:"koerpergroesse",beschriftung:"K\xF6rpergr\xF6\xDFe",min:100,max:230},{feld:"brust",beschriftung:"Brustumfang",min:30,max:250},{feld:"huefte",beschriftung:"H\xFCftumfang",min:30,max:250},{feld:"taille",beschriftung:"Taillenumfang",min:30,max:250}];function y(s){let e=(s!=null?s:"").trim().replace(",",".");return e===""?null:/^\d+(\.\d+)?$/.test(e)?Number(e):Number.NaN}function $(s,e){let t={},i={};for(let{feld:n,beschriftung:r,min:a,max:u}of f){let p=y(s[n]),d=n!=="taille"||e;if(p===null){d&&(t[n]=`Bitte geben Sie Ihren ${r} in cm ein.`);continue}if(Number.isNaN(p)){t[n]="Bitte nur eine Zahl eingeben, z. B. 92 oder 92,5.";continue}if(p<a||p>u){t[n]=`Bitte pr\xFCfen Sie den Wert. Erwartet wird ein Wert zwischen ${a} und ${u} cm.`;continue}i[n]=p}return Object.keys(t).length>0?{ok:!1,fehler:t}:{ok:!0,koerper:{koerpergroesse:i.koerpergroesse,brust:i.brust,huefte:i.huefte,...i.taille!==void 0?{taille:i.taille}:{}}}}var b={brust:{name:"Brust",an:"an der Brust"},taille:{name:"Taille",an:"an der Taille"},huefte:{name:"H\xFCfte",an:"an der H\xFCfte"},oberschenkel:{name:"Oberschenkel",an:"am Oberschenkel"},oberarm:{name:"Oberarm",an:"am Oberarm"}},m={koerpernah:{wort:"k\xF6rpernah",eine:"eine k\xF6rpernahe Passform"},regulaer:{wort:"regul\xE4r",eine:"eine regul\xE4re Passform"},locker:{wort:"locker",eine:"eine lockere Passform"},oversized:{wort:"oversized",eine:"eine Oversized-Passform"}},N={passt:"sitzt wie gew\xFCnscht",zu_eng:"enger als gew\xFCnscht",zu_weit:"weiter als gew\xFCnscht"},P=s=>s.charAt(0).toUpperCase()+s.slice(1),k=s=>`${Math.abs(s).toLocaleString("de-DE",{maximumFractionDigits:1})} cm`,R=s=>b[s].name,K=s=>m[s].wort,O=s=>N[s];function M(s){return s.spielraum<0?`${k(s.spielraum)} schmaler, dehnt sich`:s.spielraum===0?"liegt genau an":`${k(s.spielraum)} Spielraum`}function C(s){return Math.round((50+Math.max(-1,Math.min(1,s))*50)*10)/10}function Z(s){return s>=80?"sehr sicher":"recht sicher"}var v=(s,e)=>{var t,i;return(i=(t=s.zonen.find(n=>n.zone===e))!=null?t:s.zonen[0])!=null?i:null};function W(s,e){let t=s.zonen.find(n=>n.bewertung!=="passt"),i=`Sitzt ${m[e].wort}`;return t?`${i}, ${b[t.zone].an} etwas ${t.bewertung==="zu_eng"?"enger":"weiter"}.`:`${i}.`}function j(s,e,t){let i=v(s,e);if(!i)return`Diese Gr\xF6\xDFe passt am besten zu Ihren Ma\xDFen und ${m[t].eine}.`;let n=P(b[i.zone].an),r=i.spielraum<0?`${n} ist das Teil ${k(i.spielraum)} schmaler als Ihr Ma\xDF, das Material gibt nach`:i.spielraum===0?`${n} liegt das Teil genau an`:`${n} bleiben ${k(i.spielraum)} Spielraum`;if(i.bewertung==="passt")return`${r}, ideal f\xFCr ${m[t].eine}.`;let a=i.bewertung==="zu_eng"?"etwas enger":"etwas weiter";return`${r}. Das ist ${a} als ideal f\xFCr ${m[t].eine}, passt insgesamt aber am besten.`}function D(s,e,t){let i=v(s,t),n=e.zonen.find(a=>a.zone===(i==null?void 0:i.zone));if(!i||!n)return"Zum Vergleich.";let r=n.spielraum-i.spielraum;return r===0?`${P(b[i.zone].an)} gleich viel Spielraum.`:`Insgesamt ${r>0?"weiter":"enger"}, ${b[i.zone].an} ${k(r)} ${r>0?"mehr":"weniger"} Spielraum.`}function U(s,e,t){var u,p,d,c;let i=(p=(u=v(s,t))==null?void 0:u.spielraum)!=null?p:0,n=(c=(d=e.zonen.find(h=>{var x;return h.zone===((x=v(s,t))==null?void 0:x.zone)}))==null?void 0:d.spielraum)!=null?c:0,[r,a]=i<=n?[s,e]:[e,s];return`Lieber etwas enger: ${r.groesse}. Lieber etwas weiter: ${a.groesse}.`}function q(s,e){let t=v(s,e);return t?`${b[t.zone].name} ${M(t)}, ${N[t.bewertung]}.`:""}function V(s,e){return`Dieses Teil ist ${m[s].wort} geschnitten. ${P(m[e].wort)} sitzt es deshalb nur begrenzt \u2013 wir haben die Empfehlung an den Schnitt angepasst.`}var re=[[{datei:"ox-logo-5ebd1.svg",inset:"5.88% 53.98% 6.47% 4.97%"}],[{datei:"ox-logo-a246b.svg",inset:"46.47% 33.45% 5.46% 25.15%",maske:{datei:"ox-logo-31810.svg",position:"-34.5px -48.3px",groesse:"70.2px 104.3px",innen:"-18.71% -15.82% -19.58% -15.25%"}},{datei:"ox-logo-6d693.svg",inset:"46.22% 33.8% 6.13% 25.03%"},{datei:"ox-logo-6e388.svg",inset:"5.88% 7.02% 47.39% 61.35%"},{datei:"ox-logo-6f7f0.svg",inset:"6.13% 4.97% 5.8% 29.12%",maske:{datei:"ox-logo-756dc.svg",position:"-41.3px -0.3px",groesse:"150.5px 104.7px",innen:"-10.21% -9.94% -10.69% -9.58%"}},{datei:"ox-logo-e35f0.svg",inset:"5.88% 5.32% 6.47% 29.01%"}],[{datei:"ox-logo-81a93.svg",inset:"6.39% 2.87% 67.31% 80.82%"},{datei:"ox-logo-8b1d9.svg",inset:"-2.52% -1.46% 60.5% 72.22%",maske:{datei:"ox-logo-135bd.svg",position:"14.7px 10.6px",groesse:"27.9px 31.3px",innen:"0"}}]];function ae(s,e){if(!e.maske)return`<div class="ebene" style="inset:${e.inset}"><img alt="" src="${s}${e.datei}" /></div>`;let t=e.maske,i=`url('${s}${t.datei}')`;return`<div class="ebene" style="inset:${e.inset};mask-image:${i};-webkit-mask-image:${i};mask-position:${t.position};-webkit-mask-position:${t.position};mask-size:${t.groesse};-webkit-mask-size:${t.groesse};mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat">
      <div class="ebene" style="inset:${t.innen}"><img alt="" src="${s}${e.datei}" /></div>
    </div>`}function J(s){return`<div class="logo" aria-hidden="true"><div class="logo-innen">
    ${re.map((e,t)=>`<div class="stufe stufe-${t+1}">${e.map(i=>ae(s,i)).join("")}</div>`).join("")}
  </div></div>`}var Y=2.54,oe={brust:60,huefte:60,taille:45},w=s=>s.toLocaleString("de-DE",{maximumFractionDigits:1}),X=s=>f.find(e=>e.feld===s),z=(s,e)=>e>=X(s).min&&e<=X(s).max,le={brust:"Brust",huefte:"H\xFCfte",taille:"Taille"};function he(s,e,t){let i=t.huefte_minus_brust_cm,n=t.brust_minus_taille_cm,r=[];return s==="huefte"&&(e.brust!==void 0&&r.push(e.brust+i),e.taille!==void 0&&r.push(e.taille+n+i)),s==="brust"&&(e.huefte!==void 0&&r.push(e.huefte-i),e.taille!==void 0&&r.push(e.taille+n)),s==="taille"&&(e.brust!==void 0&&r.push(e.brust-n),e.huefte!==void 0&&r.push(e.huefte-i-n)),r.length===0?null:r.reduce((a,u)=>a+u,0)/r.length}function Q(s,e,t,i){if(s==="koerpergroesse"){if(e>=1&&e<=2.3){let a=Math.round(e*100),u=e.toLocaleString("de-DE",{maximumFractionDigits:2});return{art:"vorschlag",wert:a,frage:`${u} m? Meinten Sie ${a} cm?`}}return!z(s,e)&&z(s,e/10)?{art:"vorschlag",wert:e/10,frage:`${w(e)} cm? Meinten Sie ${w(e/10)} cm?`}:null}if(!z(s,e)&&z(s,e/10))return{art:"vorschlag",wert:e/10,frage:`${w(e)} cm? Meinten Sie ${w(e/10)} cm?`};let n=oe[s];if(n!==void 0&&e<n&&z(s,Math.round(e*Y))){let a=Math.round(e*Y);return{art:"vorschlag",wert:a,frage:`Haben Sie in Zoll gemessen? ${w(e)} Zoll sind etwa ${a} cm.`}}let r=he(s,t,i);if(r!==null&&Math.abs(e-r)>i.abweichung_cm){let a=le[s],u=e<r;return{art:"nachmessen",text:`Die ${a} wirkt im Vergleich zu Ihren anderen Ma\xDFen ${u?"klein":"gro\xDF"}.${s==="huefte"&&u?" Sie wird oft zu klein gemessen.":""}`}}return null}var F={brust:46,taille:82,huefte:116,oberschenkel:146,oberarm:30};function ee(s,e){return`<svg class="silhouette" viewBox="0 0 100 166" aria-hidden="true" focusable="false">
      <path class="umriss" d="M38 6 Q50 14 62 6 L72 9 L93 24 L84 42 L74 35 L74 160 L26 160 L26 35 L16 42 L7 24 L28 9 Z"/>
      ${s.zonen.map(i=>{let n=i.bewertung==="passt"?"passt":i.bewertung==="zu_eng"?"eng":"weit";return i.zone==="oberarm"?`<rect class="${n}" x="9" y="${F.oberarm}" width="14" height="6" rx="3" transform="rotate(33 16 ${F.oberarm+3})"/>`:`<rect class="${n}" x="28" y="${F[i.zone]}" width="44" height="6" rx="3"/>`}).join("")}
    </svg>`}var T={koerpergroesse:{kurz:"Gr\xF6\xDFe",frage:"Ihre K\xF6rpergr\xF6\xDFe",warum:"Damit \xC4rmel und L\xE4nge zu Ihnen passen.",tipp:"Ohne Schuhe mit dem R\xFCcken an eine Wand stellen, Blick geradeaus. Ein Buch flach auf den Kopf legen, an der Wand markieren und von unten messen.",video:"K\xF6rpergr\xF6\xDFe messen \xB7 15 Sek. \xB7 mit Untertiteln"},brust:{kurz:"Brust",frage:"Ihr Brustumfang",warum:"Damit das Teil an der Brust weder spannt noch schlabbert.",tipp:"Das Ma\xDFband waagerecht \xFCber die st\xE4rkste Stelle der Brust f\xFChren, unter den Armen hindurch. Normal ausatmen, das Band anliegen lassen, nicht straff ziehen. Am besten mit dem BH, den Sie meist tragen.",video:"Brustumfang messen \xB7 15 Sek. \xB7 mit Untertiteln"},huefte:{kurz:"H\xFCfte",frage:"Ihr H\xFCftumfang",warum:"Die H\xFCfte entscheidet bei Kleidern, R\xF6cken und Hosen.",tipp:"F\xFC\xDFe zusammenstellen, das Band waagerecht um die breiteste Stelle des Pos legen. Die H\xFCfte wird am h\xE4ufigsten zu klein gemessen: im Spiegel pr\xFCfen, dass das Band rundherum gerade liegt.",video:"H\xFCftumfang messen \xB7 15 Sek. \xB7 mit Untertiteln"},taille:{kurz:"Taille",frage:"Ihr Taillenumfang",warum:"Damit taillierte Teile, R\xF6cke und Hosen am Bund gut sitzen.",tipp:"An der schmalsten Stelle messen, meist etwas \xFCber dem Bauchnabel. Normal ausatmen, den Bauch nicht einziehen.",video:"Taillenumfang messen \xB7 15 Sek. \xB7 mit Untertiteln"}},te="Zu zweit messen ist genauer. Jedes Ma\xDF am besten zweimal messen.";var ie=[["koerpernah","k\xF6rpernah"],["regulaer","regul\xE4r"],["locker","locker"],["oversized","oversized"]],I="ommetryx-sitzung",ue={abweichung_cm:6,huefte_minus_brust_cm:8,brust_minus_taille_cm:16},L=(()=>{let s=document.currentScript;return s!=null&&s.src?s.src.replace(/[?#].*$/,"").replace(/[^/]*$/,""):""})();function pe(){if(!L||document.getElementById("ommetryx-schrift"))return;let s=document.createElement("link");s.id="ommetryx-schrift",s.rel="stylesheet",s.href=`${L}ommetryx-schrift.css`,document.head.appendChild(s)}var o=s=>s.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),E=s=>new Promise(e=>window.setTimeout(e,s)),S=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches,A={lesen(){try{return window.localStorage.getItem(I)}catch{return null}},schreiben(s){try{window.localStorage.setItem(I,s)}catch{}},loeschen(){try{window.localStorage.removeItem(I)}catch{}}},B=class{constructor(){l(this,"host");l(this,"wurzel");l(this,"einstellungen");l(this,"schritt","laden");l(this,"taillePflicht",!1);l(this,"tailleGewertet",!1);l(this,"plausi",ue);l(this,"einwilligung",!1);l(this,"alter16",!1);l(this,"roh",{});l(this,"altersgruppe","");l(this,"feldFehler",{});l(this,"passform","regulaer");l(this,"ergebnis");l(this,"vorherigerUeberlauf","");l(this,"token",null);l(this,"profil");l(this,"profilEinwilligung",!1);l(this,"email","");l(this,"meldung","");l(this,"meinUrl",null);l(this,"messIndex",0);l(this,"hinweis",null);l(this,"bestaetigt",{});l(this,"abbruch");l(this,"zurueckNachAbbruch","passform");l(this,"reveal",!1);l(this,"ansicht","haupt");l(this,"detailsOffen",!1);l(this,"detailsVorgabe",null);l(this,"angabenOffen",!1);l(this,"einzelAenderung",!1);l(this,"sicherung")}oeffnen(e){this.host||(pe(),this.einstellungen=e,this.passform="regulaer",this.ergebnis=void 0,this.meldung="",this.hinweis=null,this.schritt="laden",this.host=document.createElement("ommetryx-widget"),this.host.id="ommetryx-widget",this.host.setAttribute("style","display:block !important; position:static !important;"),this.wurzel=this.host.attachShadow({mode:"open"}),this.wurzel.innerHTML=`<style>${_}</style>
      <div class="ox" lang="de">
        <div class="abdunklung" data-aktion="schliessen"></div>
        <div class="fenster" role="dialog" aria-modal="true" aria-labelledby="ox-titel">
          <div data-kopf></div>
          <div class="inhalt" data-inhalt></div>
          <div class="nur-vorleser" aria-live="polite" data-ansage></div>
        </div>
      </div>`,document.body.appendChild(this.host),this.vorherigerUeberlauf=document.documentElement.style.overflow,document.documentElement.style.overflow="hidden",this.wurzel.addEventListener("click",t=>this.beiKlick(t)),this.wurzel.addEventListener("change",t=>this.beiAenderung(t)),this.wurzel.addEventListener("submit",t=>this.beiAbsenden(t)),this.wurzel.addEventListener("keydown",t=>this.beiTaste(t)),this.zeichne(),this.starte())}schliessen(){var n;let e=this.host;if(!e||!this.wurzel)return;(n=this.abbruch)==null||n.abort();let t=this.wurzel.querySelector(".ox"),i=()=>{var r,a;e.remove(),document.documentElement.style.overflow=this.vorherigerUeberlauf,(a=(r=this.einstellungen)==null?void 0:r.ausloeser)==null||a.focus()};if(this.host=void 0,this.wurzel=void 0,this.roh={},this.sicherung=void 0,this.einzelAenderung=!1,this.bestaetigt={},this.profil=void 0,this.ergebnis=void 0,this.email="",S()||!t)return i();t.classList.add("schliesst"),window.setTimeout(i,220)}async post(e,t,i){let n=await fetch(`${this.einstellungen.proxy}/${e}`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},credentials:"same-origin",body:JSON.stringify(t),signal:i});return{status:n.status,daten:await n.json()}}async starte(){let e=this.einstellungen;try{let t=await fetch(`${e.proxy}/artikel?produkt=${encodeURIComponent(e.produkt)}`,{headers:{Accept:"application/json"},credentials:"same-origin"}),i=await t.json();if(!t.ok)throw new Error("Antwort");if(!i.vermessen)return this.wechsle("nicht_vermessen");if(this.taillePflicht=!!i.taillePflicht,this.tailleGewertet=!!i.tailleGewertet,this.meinUrl=i.meinUrl&&i.meinUrl.startsWith("https://")?i.meinUrl:null,i.plausibilitaet&&(this.plausi=i.plausibilitaet),this.token=A.lesen(),this.token){let{daten:n}=await this.post("konto",{aktion:"profil_laden",token:this.token});if(n.angemeldet&&n.profil)return this.profil=n.profil,this.uebernimmProfil(n.profil),this.wechsle("willkommen");this.token=null,A.loeschen()}this.wechsle(this.einwilligung?"messen":"einwilligung")}catch{this.wechsle("fehler")}}uebernimmProfil(e){var i;let t=n=>String(n).replace(".",",");this.roh={koerpergroesse:t(e.koerpergroesse),brust:t(e.brust),huefte:t(e.huefte),...e.taille?{taille:t(e.taille)}:{}},this.altersgruppe=(i=e.altersgruppe)!=null?i:""}async bestaetigeEinwilligung(){try{let{status:e}=await this.post("einwilligung",{version:g.verarbeitung.version,mindestens16:!0});if(e!==200)throw new Error("Antwort");this.messIndex=0,this.wechsle("messen")}catch{this.wechsle("fehler")}}async berechne(e){let t;if(e){let a=$(this.roh,this.taillePflicht);if(!a.ok){this.feldFehler=a.fehler;let u=this.messFelder().findIndex(p=>a.fehler[p]);return this.messIndex=Math.max(0,u),this.wechsle("messen")}t=a.koerper}this.zurueckNachAbbruch=this.schritt==="willkommen"?"willkommen":"passform";let i=!e,n=S()?150:i?230:500;this.abbruch=new AbortController;let r=this.abbruch.signal;this.wechsle("berechnung"),this.setzeEtappe(0,n);try{let a=(async()=>{if(t&&this.token&&this.profil){let c=this.mitAltersgruppe(t),{status:h}=await this.post("konto",{aktion:"profil_speichern",token:this.token,profil:c},r);h===200&&(this.profil=c)}let d=t?{koerper:t}:{token:this.token};return this.post("empfehlung",{produkt:this.einstellungen.produkt,passform:this.passform,...d},r)})();if(await E(n),r.aborted||(this.setzeEtappe(1,n),await E(n),r.aborted))return;this.setzeEtappe(2,n);let{status:u,daten:p}=await a;if(r.aborted)return;if(u===401)return this.abgemeldet(),this.wechsle("einwilligung");if(u!==200)throw new Error("Antwort");if(await E(n),r.aborted||(this.setzeEtappe(3,n),await E(S()?0:350),r.aborted))return;this.setzeErgebnis(p,!0),this.reveal=!S(),this.wechsle("ergebnis"),this.reveal=!1,this.sage(this.ansageText())}catch{if(r.aborted)return;this.wechsle("fehler")}}async rechneSofort(){var i,n;let e=$(this.roh,this.taillePflicht),t=this.token&&this.profil?{token:this.token}:e.ok?{koerper:e.koerper}:null;if(t)try{let{status:r,daten:a}=await this.post("empfehlung",{produkt:this.einstellungen.produkt,passform:this.passform,...t});if(r!==200)throw new Error("Antwort");this.setzeErgebnis(a,!1),this.zeichne(),(n=(i=this.wurzel)==null?void 0:i.querySelector(`input[name=passform][value=${this.passform}]`))==null||n.focus(),this.sage(this.ansageText())}catch{this.wechsle("fehler")}}setzeErgebnis(e,t){this.ergebnis=e,this.ansicht="haupt",this.angabenOffen=!1,(t||e.status==="unsicher")&&(this.detailsVorgabe=e.status==="unsicher")}setzeEtappe(e,t){var n;let i=this.wurzel;i&&((n=i.querySelector(".logo-innen"))==null||n.style.setProperty("--etappe",`${t}ms`),i.querySelectorAll(".stufe").forEach((r,a)=>r.classList.toggle("zeigen",a<=e)),i.querySelectorAll(".schritte-liste li").forEach((r,a)=>{r.classList.toggle("fertig",a<e),r.classList.toggle("aktiv",a===e)}))}brecheAb(){var e;(e=this.abbruch)==null||e.abort(),this.wechsle(this.zurueckNachAbbruch)}mitAltersgruppe(e){return{...e,...this.altersgruppe?{altersgruppe:this.altersgruppe}:{}}}async fordereCodeAn(){var t,i;let e=(t=this.wurzel)==null?void 0:t.getElementById("ox-email");if(this.email=((i=e==null?void 0:e.value)!=null?i:this.email).trim(),this.feldFehler={},this.profilEinwilligung||(this.feldFehler.profil="Bitte best\xE4tigen Sie die Einwilligung, damit wir Ihre Ma\xDFe speichern d\xFCrfen."),/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)||(this.feldFehler.email="Bitte geben Sie eine g\xFCltige E-Mail-Adresse ein."),Object.keys(this.feldFehler).length>0)return this.zeichne();try{let{status:n}=await this.post("konto",{aktion:"code_anfordern",email:this.email});if(n!==200)throw new Error("Antwort");this.wechsle("code")}catch{this.wechsle("fehler")}}async pruefeCode(e){let t=$(this.roh,this.taillePflicht);try{let{status:i,daten:n}=await this.post("konto",{aktion:"code_pruefen",email:this.email,code:e,einwilligung:{version:g.profil.version,mindestens16:!0},...t.ok?{profil:this.mitAltersgruppe(t.koerper)}:{}});if(i===401)return this.feldFehler={code:"Der Code stimmt nicht oder ist abgelaufen. Bitte pr\xFCfen Sie ihn oder fordern Sie einen neuen an."},this.zeichne();if(i!==200||!n.token)throw new Error("Antwort");this.token=n.token,A.schreiben(n.token),t.ok&&(this.profil=this.mitAltersgruppe(t.koerper)),this.email="",this.meldung="Ihre Ma\xDFe sind gespeichert. Beim n\xE4chsten Mal w\xE4hlen Sie nur noch die Passform.",this.wechsle("ergebnis"),this.sage(this.meldung)}catch{this.wechsle("fehler")}}async meldeAb(){let e=this.token;if(this.abgemeldet(),e)try{await this.post("konto",{aktion:"abmelden",token:e})}catch{}this.roh={},this.bestaetigt={},this.einwilligung=!1,this.alter16=!1,this.wechsle("einwilligung")}abgemeldet(){this.token=null,this.profil=void 0,A.loeschen()}messFelder(){let e=["koerpergroesse","brust","huefte"];return(this.tailleGewertet||this.taillePflicht)&&e.push("taille"),e}aktuellesFeld(){return this.messFelder()[this.messIndex]}weiter(){var u,p,d,c;let e=this.aktuellesFeld(),t=(u=this.wurzel)==null?void 0:u.getElementById(`ox-${e}`);t&&(this.roh[e]=t.value);let i=((p=this.roh[e])!=null?p:"").trim(),n=y(i),r=f.find(h=>h.feld===e),a=e!=="taille"||this.taillePflicht;if(this.feldFehler={},n===null)return a?(this.feldFehler[e]=`Bitte geben Sie Ihren ${r.beschriftung} in cm ein.`,this.zeichneUndFokus(`ox-${e}`)):this.naechsterSchritt();if(Number.isNaN(n))return this.feldFehler[e]="Bitte nur eine Zahl eingeben, z. B. 92 oder 92,5.",this.zeichneUndFokus(`ox-${e}`);if(this.bestaetigt[e]!==i){let h=Q(e,n,this.andereWerte(e),this.plausi);if(h){this.hinweis={feld:e,hinweis:h},this.zeichne(),(c=(d=this.wurzel)==null?void 0:d.querySelector(".nachfrage"))==null||c.focus();return}}if(n<r.min||n>r.max)return this.feldFehler[e]=`Bitte pr\xFCfen Sie den Wert. Erwartet wird ein Wert zwischen ${r.min} und ${r.max} cm.`,this.zeichneUndFokus(`ox-${e}`);this.naechsterSchritt()}andereWerte(e){var i;let t={};for(let n of this.messFelder()){if(n===e||this.bestaetigt[n]!==void 0&&this.bestaetigt[n]===((i=this.roh[n])!=null?i:"").trim())continue;let r=y(this.roh[n]);r!==null&&!Number.isNaN(r)&&(t[n]=r)}return t}naechsterSchritt(){if(this.hinweis=null,this.einzelAenderung)return this.einzelAenderung=!1,this.sicherung=void 0,void this.berechne(!0);if(this.messIndex<this.messFelder().length-1)return this.messIndex+=1,this.wechsle("messen");this.wechsle("passform")}zurueck(){if(this.hinweis=null,this.feldFehler={},this.einzelAenderung&&this.ergebnis)return this.einzelAenderung=!1,this.sicherung&&(this.roh=this.sicherung),this.sicherung=void 0,this.wechsle("ergebnis");if(this.schritt==="passform")return this.messIndex=this.messFelder().length-1,this.wechsle("messen");if(this.schritt==="messen"&&this.messIndex>0)return this.messIndex-=1,this.wechsle("messen");this.wechsle(this.token&&this.profil?"willkommen":"einwilligung")}beiKlick(e){var i,n,r,a,u,p,d,c;let t=e.target.closest("[data-aktion]");if(t)switch(t.dataset.aktion){case"schliessen":return this.schliessen();case"zur-einwilligung-weiter":this.einwilligung&&this.alter16&&this.bestaetigeEinwilligung();return;case"zurueck":return this.zurueck();case"vorschlag-uebernehmen":{if(((i=this.hinweis)==null?void 0:i.hinweis.art)!=="vorschlag")return;let h=this.hinweis.feld,x=String(this.hinweis.hinweis.wert).replace(".",",");this.roh[h]=x;let H=(n=this.wurzel)==null?void 0:n.getElementById(`ox-${h}`);return H&&(H.value=x),this.hinweis=null,this.weiter()}case"aendern":{let h=(r=this.hinweis)==null?void 0:r.feld;return this.hinweis=null,this.zeichneUndFokus(h?`ox-${h}`:void 0)}case"stimmt-so":{if(!this.hinweis)return;let h=this.hinweis.feld;return this.bestaetigt[h]=((a=this.roh[h])!=null?a:"").trim(),this.hinweis=null,this.weiter()}case"masse-aendern":return this.messIndex=0,this.einzelAenderung=!1,this.wechsle("messen");case"angaben":return this.angabenOffen=!this.angabenOffen,this.zeichne(),(p=(u=this.wurzel)==null?void 0:u.querySelector(this.angabenOffen?"#ox-angaben":"[data-aktion='angaben']"))==null?void 0:p.focus();case"feld-aendern":{let h=this.messFelder().indexOf(t.dataset.feld);return h<0?void 0:(this.sicherung={...this.roh},this.messIndex=h,this.einzelAenderung=!0,this.angabenOffen=!1,this.wechsle("messen"))}case"ansicht":{let h=t.dataset.wert==="vergleich"?"vergleich":"haupt";return h===this.ansicht?void 0:(this.ansicht=h,this.zeichne(),(c=(d=this.wurzel)==null?void 0:d.querySelector(`[data-aktion='ansicht'][data-wert='${h}']`))==null||c.focus(),this.sage(this.ansageText()))}case"uebernehmen":return this.uebernehmen();case"erneut":return this.wechsle("laden"),void this.starte();case"willkommen-rechnen":return void this.berechne(!1);case"abbrechen":return this.brecheAb();case"speichern":return this.feldFehler={},this.wechsle("speichern");case"code-erneut":return this.meldung="Wir haben Ihnen einen neuen Code geschickt.",void this.fordereCodeAn();case"andere-email":return this.meldung="",this.wechsle("speichern");case"abmelden":return void this.meldeAb()}}beiAenderung(e){var i;let t=e.target;if(t instanceof HTMLInputElement&&t.name==="einwilligung"&&(this.einwilligung=t.checked),t instanceof HTMLInputElement&&t.name==="alter16"&&(this.alter16=t.checked),t instanceof HTMLInputElement&&t.name==="profil-einwilligung"&&(this.profilEinwilligung=t.checked),t.name==="einwilligung"||t.name==="alter16"){let n=(i=this.wurzel)==null?void 0:i.querySelector("[data-aktion='zur-einwilligung-weiter']");n&&(n.disabled=!(this.einwilligung&&this.alter16))}t.name==="altersgruppe"&&(this.altersgruppe=t.value),t.name==="passform"&&(this.passform=t.value,this.schritt==="ergebnis"&&this.rechneSofort())}beiAbsenden(e){e.preventDefault();let t=e.target;switch(t.dataset.formular){case"code":return void this.pruefeCode(t.elements.namedItem("code").value);case"speichern":return void this.fordereCodeAn();case"messen":return this.weiter();case"passform":return void this.berechne(!0)}}beiTaste(e){if(e.key==="Escape"){e.preventDefault(),this.schliessen();return}if(e.key!=="Tab"||!this.wurzel)return;let t=[...this.wurzel.querySelectorAll("button:not([disabled]), input:not([disabled]), select, summary, a[href], [tabindex='-1']")].filter(a=>a.offsetParent!==null||a.tagName==="H2"),i=t[0],n=t[t.length-1],r=this.wurzel.activeElement;e.shiftKey&&(r===i||(r==null?void 0:r.tagName)==="H2")?(e.preventDefault(),n==null||n.focus()):!e.shiftKey&&r===n&&(e.preventDefault(),i==null||i.focus())}wechsle(e){var t,i;this.schritt=e,this.zeichne(),(i=(t=this.wurzel)==null?void 0:t.querySelector("h2"))==null||i.focus()}zeichneUndFokus(e){var t,i;this.zeichne(),e&&((i=(t=this.wurzel)==null?void 0:t.getElementById(e))==null||i.focus())}sage(e){var i;let t=(i=this.wurzel)==null?void 0:i.querySelector("[data-ansage]");t&&(t.textContent=e)}ansageText(){let e=this.ergebnis;return e?this.ansicht==="vergleich"&&e.vergleich?`Ansicht: So s\xE4\xDFe ${e.vergleich.groesse}.`:e.status==="empfohlen"&&e.recommended_size?e.alternative_size?`Sie liegen zwischen ${e.recommended_size} und ${e.alternative_size}, Passform ${this.passformText()}.`:`Empfohlene Gr\xF6\xDFe ${e.recommended_size}, Passform ${this.passformText()}.`:e.status==="unsicher"?"Keine sichere Gr\xF6\xDFenempfehlung. Die Passform je Zone ist aufgeklappt.":"Keine Gr\xF6\xDFe passt gut genug.":""}passformText(){var e,t;return(t=(e=ie.find(([i])=>i===this.passform))==null?void 0:e[1])!=null?t:""}zeichne(){let e=this.wurzel;if(!e)return;let t=e.querySelector("[data-kopf]"),i=e.querySelector("[data-inhalt]"),n=e.querySelector("details.zonen");this.detailsVorgabe!==null?this.detailsOffen=this.detailsVorgabe:n&&(this.detailsOffen=n.open),this.detailsVorgabe=null,t&&(t.innerHTML=this.htmlKopf()),i&&(i.innerHTML=this.html())}htmlKopf(){let e='<button type="button" class="schliessen" data-aktion="schliessen" aria-label="Gr\xF6\xDFenberatung schlie\xDFen">\xD7</button>';if(this.schritt==="messen"||this.schritt==="passform"){let i=this.messFelder().length,n=this.schritt==="passform"?i:this.messIndex+1,r=this.schritt==="passform"?"Passform":`${T[this.aktuellesFeld()].kurz} \xB7 ${n} von ${i}`,a=this.schritt==="passform"?100:Math.round(n/(i+1)*100);return`<div class="kopf-schritt">
          <button type="button" class="zurueck" data-aktion="zurueck" aria-label="Zur\xFCck">\u2039</button>
          <span class="titel">${o(r)}</span>
          ${e}
        </div>
        <div class="fortschritt" role="progressbar" aria-label="Fortschritt" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${a}"><span style="width:${a}%"></span></div>`}return`<div class="kopf"><span class="marke">Ommetryx \xB7 Gr\xF6\xDFenberatung</span>${e}</div>`}html(){switch(this.schritt){case"laden":return'<h2 id="ox-titel" tabindex="-1">Einen Moment \u2026</h2><p class="leise">Die Gr\xF6\xDFenberatung wird geladen.</p>';case"nicht_vermessen":return`<h2 id="ox-titel" tabindex="-1">F\xFCr diesen Artikel gibt es noch keine Gr\xF6\xDFenberatung</h2>
          <p>Bitte nutzen Sie die Gr\xF6\xDFentabelle des Shops.</p>
          <button type="button" class="primaer" data-aktion="schliessen">Schlie\xDFen</button>`;case"fehler":return`<h2 id="ox-titel" tabindex="-1">Die Gr\xF6\xDFenberatung ist gerade nicht erreichbar</h2>
          <p>Bitte versuchen Sie es gleich noch einmal oder nutzen Sie die Gr\xF6\xDFentabelle des Shops.</p>
          <button type="button" class="primaer" data-aktion="erneut">Noch einmal versuchen</button>
          <button type="button" class="sekundaer" data-aktion="schliessen">Schlie\xDFen</button>`;case"einwilligung":return this.htmlEinwilligung();case"willkommen":return this.htmlWillkommen();case"messen":return this.htmlMessen();case"passform":return this.htmlPassformSchritt();case"berechnung":return this.htmlBerechnung();case"ergebnis":return this.htmlErgebnis();case"speichern":return this.htmlSpeichern();case"code":return this.htmlCode()}}htmlEinwilligung(){let e=this.einwilligung&&this.alter16;return`<h2 id="ox-titel" tabindex="-1">Ihre Gr\xF6\xDFe in wenigen Schritten</h2>
      <span class="entwurf">Entwurf \xB7 Text wird noch rechtlich gepr\xFCft</span>
      <p>Ommetryx vergleicht Ihre K\xF6rperma\xDFe mit den gemessenen Ma\xDFen dieses Kleidungsst\xFCcks und empfiehlt Ihnen eine Gr\xF6\xDFe.</p>
      <div class="karte">
        <label class="wahl">
          <input type="checkbox" name="einwilligung" ${this.einwilligung?"checked":""} />
          <span>${o(g.verarbeitung.text)}</span>
        </label>
        <label class="wahl">
          <input type="checkbox" name="alter16" ${this.alter16?"checked":""} />
          <span>${o(g.alter16.text)}</span>
        </label>
      </div>
      <button type="button" class="primaer" data-aktion="zur-einwilligung-weiter" ${e?"":"disabled"}>Weiter</button>
      <button type="button" class="link" data-aktion="schliessen">Ohne Einwilligung: Gr\xF6\xDFentabelle des Shops nutzen</button>`}htmlWillkommen(){return`<h2 id="ox-titel" tabindex="-1">Willkommen zur\xFCck</h2>
      <p>Ihre Ma\xDFe sind gespeichert. W\xE4hlen Sie nur noch, wie dieses Teil sitzen soll.</p>
      <form novalidate data-formular="willkommen">${this.htmlPassform()}</form>
      <button type="button" class="primaer" data-aktion="willkommen-rechnen">Gr\xF6\xDFe berechnen</button>
      <button type="button" class="sekundaer" data-aktion="masse-aendern">Ma\xDFe \xE4ndern</button>
      ${this.meinLink()}
      <button type="button" class="link" data-aktion="abmelden">Abmelden</button>`}htmlMessen(){var p,d,c;let e=this.aktuellesFeld(),t=T[e],i=`ox-${e}`,n=this.feldFehler[e],r=e==="taille"&&!this.taillePflicht,a=[n?`${i}-fehler`:"",((p=this.hinweis)==null?void 0:p.feld)===e?"ox-nachfrage":""].filter(Boolean).join(" "),u=this.messIndex===this.messFelder().length-1;return`<div class="video" role="img" aria-label="Platzhalter f\xFCr ein Anleitungsvideo: ${o(t.video)}">
        <span class="abspielen" aria-hidden="true"><svg width="20" height="22" viewBox="0 0 20 22"><path d="M2 1.5v19L19 11z" fill="#fff"/></svg></span>
        <span aria-hidden="true">[Video: ${o(t.video)}]</span>
      </div>
      <form novalidate data-formular="messen">
        <h2 id="ox-titel" tabindex="-1">${o(t.frage)}${r?' <span class="leise">(empfohlen)</span>':""}</h2>
        <p class="warum">${o(t.warum)}</p>
        <div class="feld">
          <label for="${i}" class="nur-vorleser">${o(t.frage)} in Zentimetern</label>
          <div class="mit-einheit">
            <input id="${i}" name="${e}" inputmode="decimal" autocomplete="off" placeholder="${e==="koerpergroesse"?"z. B. 168":"z. B. 92"}"
              value="${o((d=this.roh[e])!=null?d:"")}" ${n?'aria-invalid="true"':""} ${a?`aria-describedby="${a}"`:""} />
            <span class="einheit" aria-hidden="true">cm</span>
          </div>
          ${n?`<span class="fehler" id="${i}-fehler">${o(n)}</span>`:""}
        </div>
        ${((c=this.hinweis)==null?void 0:c.feld)===e?this.htmlNachfrage(this.hinweis.hinweis,t.frage):""}
        <details class="tipp">
          <summary>Kein Video m\xF6glich? Kurz-Tipp</summary>
          <p>${o(t.tipp)}</p>
          <p class="leise">${o(te)}</p>
        </details>
        <button type="button" class="karte-knopf" data-aktion="schliessen">
          <span><strong>Kein Ma\xDFband zur Hand?</strong><span>Dann nutzen Sie bitte die Gr\xF6\xDFentabelle des Shops.</span></span>
          <span aria-hidden="true">\u203A</span>
        </button>
        <div class="fuss"><button type="submit" class="primaer">${this.einzelAenderung?"Neu berechnen":u?"Weiter zur Passform":"Weiter"}</button></div>
      </form>`}htmlNachfrage(e,t){return e.art==="vorschlag"?`<div class="nachfrage" id="ox-nachfrage" tabindex="-1" role="group" aria-label="R\xFCckfrage zu ${o(t)}">
          <p><strong>${o(e.frage)}</strong></p>
          <div class="knoepfe">
            <button type="button" class="primaer" data-aktion="vorschlag-uebernehmen">${o(String(e.wert).replace(".",","))} cm \xFCbernehmen</button>
            <button type="button" class="sekundaer" data-aktion="aendern">\xC4ndern</button>
          </div>
        </div>`:`<div class="nachfrage" id="ox-nachfrage" tabindex="-1" role="group" aria-label="R\xFCckfrage zu ${o(t)}">
        <p><strong>Bitte noch einmal messen?</strong> ${o(e.text)}</p>
        <div class="knoepfe">
          <button type="button" class="sekundaer" data-aktion="stimmt-so">Stimmt so</button>
          <button type="button" class="sekundaer" data-aktion="aendern">Nochmal messen</button>
        </div>
      </div>`}htmlPassform(){return`<fieldset>
        <legend>Wie soll dieses Teil sitzen?</legend>
        <div class="chips" role="radiogroup">
          ${ie.map(([e,t])=>`<label class="chip"><input type="radio" name="passform" value="${e}" ${this.passform===e?"checked":""} /><span>${t}</span></label>`).join("")}
        </div>
      </fieldset>`}htmlPassformSchritt(){return`<form novalidate data-formular="passform">
        <h2 id="ox-titel" tabindex="-1">Wie soll dieses Teil sitzen?</h2>
        <p class="warum">Jedes Teil darf anders sitzen. Wir fragen deshalb bei jedem Artikel neu.</p>
        ${this.htmlPassform().replace("<legend>Wie soll dieses Teil sitzen?</legend>",'<legend class="nur-vorleser">Passform</legend>')}
        <div class="feld">
          <label for="ox-altersgruppe">Altersgruppe (optional)</label>
          <select id="ox-altersgruppe" name="altersgruppe">
            <option value="">Keine Angabe</option>
            ${G.map(e=>`<option value="${e}" ${this.altersgruppe===e?"selected":""}>${e.replace("-","\u2013")} Jahre</option>`).join("")}
          </select>
        </div>
        <div class="fuss"><button type="submit" class="primaer">Gr\xF6\xDFe berechnen</button></div>
      </form>`}htmlBerechnung(){let e=["Ihre Ma\xDFe","Echte Ma\xDFe dieses Artikels",`Passform \u201E${this.passformText()}\u201C`];return`<div class="berechnung">
        ${J(L)}
        <h2 id="ox-titel" tabindex="-1">Wir vergleichen Ihre Ma\xDFe mit den echten Ma\xDFen dieses Artikels</h2>
        <ol class="schritte-liste">
          ${e.map(t=>`<li><span class="marke-punkt" aria-hidden="true"></span>${o(t)}</li>`).join("")}
        </ol>
        <button type="button" class="link" data-aktion="abbrechen">Abbrechen</button>
      </div>`}htmlErgebnis(){let e=this.ergebnis,t=`<form novalidate data-formular="ergebnis">${this.htmlPassform()}</form>`;if(e.status==="keine_passende_groesse"||!e.haupt)return`<div class="${this.reveal?"reveal":""}">
          ${t}
          <div class="folge">
            <div class="karte-ergebnis">
              <h2 id="ox-titel" tabindex="-1">Keine Gr\xF6\xDFe passt gut genug</h2>
              <p>Bei diesem Artikel passt Ihnen mit dieser Passform leider keine Gr\xF6\xDFe gut genug. Vielleicht klappt es mit einer anderen Passform, sonst hilft die Gr\xF6\xDFentabelle des Shops.</p>
            </div>
            ${this.htmlAngaben()}
            ${this.htmlKonto()}
          </div>
          <div class="fuss">
            <button type="button" class="primaer" data-aktion="schliessen">Zur Gr\xF6\xDFentabelle des Shops</button>
            <div class="fuss-links"><button type="button" class="link" data-aktion="angaben" aria-expanded="${this.angabenOffen}">Angaben \xE4ndern</button></div>
          </div>
        </div>`;let i=e.haupt,n=e.vergleich,r=this.ansicht==="vergleich"&&n?n:i,a=e.status==="empfohlen"&&!!e.alternative_size&&n!==null,u=e.status==="unsicher",p,d="";if(u)p=`<div class="karte-ergebnis">
          <h2 id="ox-titel" tabindex="-1">Wir sind uns bei diesem Artikel nicht sicher</h2>
          <p class="leise">Ihre Ma\xDFe passen nicht eindeutig zu einer Gr\xF6\xDFe. Unten sehen Sie, wie ${o(i.groesse)}${n?` und ${o(n.groesse)}`:""} sitzen w\xFCrden.</p>
        </div>`;else if(a&&n)p=`<div class="karte-zwei">
          <div class="zwei-kopf">
            <h2 id="ox-titel" tabindex="-1">Sie liegen zwischen ${o(i.groesse)} und ${o(n.groesse)}</h2>
            <span class="marke-klein">beide m\xF6glich</span>
          </div>
          <div class="zwei-raster">
            ${[i,n].map(h=>`<div class="mini"><strong>${o(h.groesse)}</strong><p>${o(q(h,e.primaer))}</p></div>`).join("")}
          </div>
          <p><strong>Entscheidungshilfe:</strong> ${o(U(i,n,e.primaer))}</p>
        </div>`,d=`<p><strong>Warum zwei?</strong> ${o(`Bei der Passform \u201E${K(this.passform)}\u201C liegt der gew\xFCnschte Spielraum genau zwischen zwei Gr\xF6\xDFen.`)}</p>`;else{let h=r!==i;p=`<div class="karte-ergebnis mit-kreis">
          <div class="kreis" aria-hidden="true"><span>${o(r.groesse)}</span></div>
          <div>
            <h2 id="ox-titel" tabindex="-1">${h?`So s\xE4\xDFe ${o(r.groesse)}`:`Ihre Gr\xF6\xDFe: ${o(r.groesse)}`}</h2>
            <p>${o(h?D(i,r,e.primaer):W(r,this.passform))}</p>
            <p class="leise">${h?`Empfohlen bleibt ${o(i.groesse)}`:`Empfehlung: ${Z(e.confidence)}`}</p>
          </div>
        </div>`,d=`<p><strong>Warum ${o(i.groesse)}?</strong> ${o(j(i,e.primaer,this.passform))}</p>`}let c=e.begrenzt_durch_schnitt?`<p class="leise">${o(V(e.schnitt,this.passform))}</p>`:"";return`<div class="${this.reveal?"reveal":""}">
        ${t}
        <div class="folge">
          ${p}
          ${d}${c}
          ${this.htmlAngaben()}
          ${this.htmlZonen(e.primaer,i,n,a||u)}
          ${this.htmlKonto()}
        </div>
        <div class="fuss">
          <button type="button" class="primaer" data-aktion="uebernehmen">Gr\xF6\xDFe ${o(r.groesse)} \xFCbernehmen</button>
          <div class="fuss-links">
            <button type="button" class="link" data-aktion="angaben" aria-expanded="${this.angabenOffen}">Angaben \xE4ndern</button>
            ${this.token?"":'<button type="button" class="link" data-aktion="speichern">Ma\xDFe speichern</button>'}
            <button type="button" class="link" data-aktion="schliessen">Gr\xF6\xDFentabelle</button>
          </div>
        </div>
      </div>`}htmlZonen(e,t,i,n){let r=this.ansicht==="vergleich"&&i?i:t;if(r.zonen.length===0)return"";let a=(d,c)=>`<button type="button" data-aktion="ansicht" data-wert="${d}" aria-pressed="${this.ansicht===d}">${o(c)}</button>`,u=i?`<div class="umschalter" role="group" aria-label="Gr\xF6\xDFe f\xFCr die Ansicht">
          ${a("haupt",t.groesse)}${a("vergleich",n?i.groesse:`So s\xE4\xDFe ${i.groesse}`)}
        </div>`:"",p=r.zonen.map(d=>`<li>
          <div class="zone-text"><strong>${o(R(d.zone))}</strong><span>${o(M(d))}<span class="nur-vorleser">, ${o(O(d.bewertung))}</span></span></div>
          <div class="skala" aria-hidden="true"><span class="wunsch"></span><span class="punkt${d.bewertung==="zu_eng"?" eng":""}" style="left:${C(d.lage)}%"></span></div>
        </li>`).join("");return`<details class="zonen" ${this.detailsOffen?"open":""}>
        <summary>Passform je Zone ansehen</summary>
        <div class="zonen-inhalt">
          <div class="zonen-kopf"><strong>Passform im Detail \xB7 ${o(r.groesse)}</strong>${u}</div>
          <div class="zonen-raster">
            ${ee(r,e)}
            <ul class="zonen-liste">${p}</ul>
          </div>
          <div class="achse" aria-hidden="true"><span>eng</span><span>gew\xFCnschte Passform</span><span>weit</span></div>
          <ul class="legende" aria-hidden="true">
            <li><span class="farbe passt"></span>sitzt wie gew\xFCnscht</li><li><span class="farbe eng"></span>enger</li><li><span class="farbe weit"></span>weiter</li>
          </ul>
          <p class="leise">Gemessen, nicht gesch\xE4tzt: abgeglichen mit den echten Ma\xDFen dieses Artikels.</p>
        </div>
      </details>`}htmlAngaben(){return this.angabenOffen?`<section class="karte angaben" id="ox-angaben" tabindex="-1" aria-label="Ihre Angaben">
        <div class="angaben-kopf"><strong>Ihre Angaben</strong><button type="button" class="link" data-aktion="angaben">Schlie\xDFen</button></div>
        <ul>${this.messFelder().map(t=>{var r;let i=f.find(a=>a.feld===t),n=((r=this.roh[t])!=null?r:"").trim();return`<li><span>${o(i.beschriftung)} \xB7 ${n?`${o(n)} cm`:"nicht angegeben"}</span>
          <button type="button" class="link" data-aktion="feld-aendern" data-feld="${t}" aria-label="${o(i.beschriftung)} \xE4ndern">\xC4ndern</button></li>`}).join("")}</ul>
        <p class="leise">Nach dem \xC4ndern kommen Sie direkt hierher zur\xFCck.</p>
      </section>`:""}htmlKonto(){return this.token?`<div>
        ${this.meldung?`<p class="karte" role="status">${o(this.meldung)}</p>`:'<p class="leise">Ihre Ma\xDFe sind gespeichert.</p>'}
        ${this.meinLink()}
        <button type="button" class="link" data-aktion="abmelden">Abmelden</button>
      </div>`:""}uebernehmen(){this.schliessen()}meinLink(){return this.meinUrl?`<a class="link" style="display:block" href="${o(this.meinUrl)}" target="_blank" rel="noopener noreferrer">Mein Ommetryx: Daten ansehen, \xE4ndern oder l\xF6schen<span class="nur-vorleser"> (\xF6ffnet in neuem Tab)</span></a>`:""}htmlSpeichern(){let e=this.feldFehler;return`<h2 id="ox-titel" tabindex="-1">Ma\xDFe speichern</h2>
      <span class="entwurf">Entwurf \xB7 Text wird noch rechtlich gepr\xFCft</span>
      <p>Mit einem Profil m\xFCssen Sie beim n\xE4chsten Einkauf nicht neu messen \u2013 auch in anderen Shops mit Ommetryx. Sie melden sich ohne Passwort an: Wir schicken Ihnen einen Code per E-Mail.</p>
      <form novalidate data-formular="speichern">
        <div class="karte">
          <label class="wahl">
            <input type="checkbox" name="profil-einwilligung" ${this.profilEinwilligung?"checked":""} ${e.profil?'aria-invalid="true" aria-describedby="ox-profil-fehler"':""} />
            <span>${o(g.profil.text)}</span>
          </label>
          ${e.profil?`<span class="fehler" id="ox-profil-fehler">${o(e.profil)}</span>`:""}
        </div>
        <div class="feld">
          <label for="ox-email">E-Mail-Adresse</label>
          <input id="ox-email" name="email" type="email" inputmode="email" autocomplete="email" value="${o(this.email)}"
            ${e.email?'aria-invalid="true" aria-describedby="ox-email-fehler"':""} />
          ${e.email?`<span class="fehler" id="ox-email-fehler">${o(e.email)}</span>`:""}
        </div>
        <button type="submit" class="primaer">Code senden</button>
      </form>
      <button type="button" class="sekundaer" data-aktion="schliessen">Nicht speichern</button>`}htmlCode(){let e=this.feldFehler;return`<h2 id="ox-titel" tabindex="-1">Code eingeben</h2>
      <p>Wir haben einen 6-stelligen Code an <strong>${o(this.email)}</strong> geschickt. Er ist 10 Minuten g\xFCltig.</p>
      ${this.meldung?`<p class="leise" role="status">${o(this.meldung)}</p>`:""}
      <form novalidate data-formular="code">
        <div class="feld">
          <label for="ox-code">Code aus der E-Mail</label>
          <input id="ox-code" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="7"
            ${e.code?'aria-invalid="true" aria-describedby="ox-code-fehler"':""} />
          ${e.code?`<span class="fehler" id="ox-code-fehler">${o(e.code)}</span>`:""}
        </div>
        <button type="submit" class="primaer">Best\xE4tigen</button>
      </form>
      <button type="button" class="link" data-aktion="code-erneut">Code erneut senden</button>
      <button type="button" class="link" data-aktion="andere-email">Andere E-Mail-Adresse verwenden</button>`}},de=new B;window.OmmetryxWidget={oeffnen:s=>de.oeffnen(s)};})();
