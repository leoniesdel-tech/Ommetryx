"use strict";(()=>{var _=Object.defineProperty;var N=(r,e,t)=>e in r?_(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var o=(r,e,t)=>N(r,typeof e!="symbol"?e+"":e,t);var m={verarbeitung:{version:"entwurf-1",text:"Ich willige ein, dass Ommetryx meine K\xF6rperma\xDFe verarbeitet, um mir eine Gr\xF6\xDFe zu empfehlen. K\xF6rperma\xDFe k\xF6nnen R\xFCckschl\xFCsse auf meine Gesundheit zulassen. Ohne Profil werden die Ma\xDFe nicht gespeichert. Ich kann die Einwilligung jederzeit widerrufen."},profil:{version:"entwurf-1",text:"Ich willige ein, dass Ommetryx meine K\xF6rperma\xDFe und meine E-Mail-Adresse speichert, um mir in allen Shops mit Ommetryx Gr\xF6\xDFen zu empfehlen. Die Ma\xDFe werden verschl\xFCsselt und getrennt von meiner E-Mail-Adresse gespeichert. Neue Ma\xDFe \xFCberschreiben die alten. Ich kann die Einwilligung jederzeit unter \u201EMein Ommetryx\u201C widerrufen; dann wird mein Profil sofort gel\xF6scht. Nach 24 Monaten ohne Nutzung wird es automatisch gel\xF6scht."},alter16:{version:"entwurf-1",text:"Ich bin mindestens 16 Jahre alt."}},F=["16-29","30-44","45-59","60+"];var M=`
:host { all: initial; }
* { box-sizing: border-box; }

.ox {
  --linen: #F6F4EF; --graphit: #1E2326; --sekundaer: #4F575C; --ink: #0C3A4A;
  --petrol-tief: #15788C; --petrol-mittel: #238397; --apricot: #DC5E2E; --terracotta: #B8492A;
  --linie-stark: #7D868A; --linie: #D9D4CB; --fehler: #B3261E; --hinweis-flaeche: #E8F2F4;
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
.chip { position: relative; }
.chip input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.chip span { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border: 1px solid var(--linie-stark); border-radius: 999px; background: #fff; }
.chip input:checked + span { border: 2px solid var(--petrol-tief); color: var(--ink); font-weight: 600; }
.chip input:focus-visible + span { outline: 2px solid var(--petrol-tief); outline-offset: 2px; }

.ergebnis { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.kreis { flex: none; width: 96px; height: 96px; border-radius: 999px; background: var(--apricot); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 40px; line-height: 1.25; font-weight: 600; }
.ergebnis strong { display: block; font-size: 20px; line-height: 1.25; }

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
`;var g=[{feld:"koerpergroesse",beschriftung:"K\xF6rpergr\xF6\xDFe",min:100,max:230},{feld:"brust",beschriftung:"Brustumfang",min:30,max:250},{feld:"huefte",beschriftung:"H\xFCftumfang",min:30,max:250},{feld:"taille",beschriftung:"Taillenumfang",min:30,max:250}];function x(r){let e=(r!=null?r:"").trim().replace(",",".");return e===""?null:/^\d+(\.\d+)?$/.test(e)?Number(e):Number.NaN}function k(r,e){let t={},i={};for(let{feld:n,beschriftung:s,min:a,max:h}of g){let d=x(r[n]),u=n!=="taille"||e;if(d===null){u&&(t[n]=`Bitte geben Sie Ihren ${s} in cm ein.`);continue}if(Number.isNaN(d)){t[n]="Bitte nur eine Zahl eingeben, z. B. 92 oder 92,5.";continue}if(d<a||d>h){t[n]=`Bitte pr\xFCfen Sie den Wert. Erwartet wird ein Wert zwischen ${a} und ${h} cm.`;continue}i[n]=d}return Object.keys(t).length>0?{ok:!1,fehler:t}:{ok:!0,koerper:{koerpergroesse:i.koerpergroesse,brust:i.brust,huefte:i.huefte,...i.taille!==void 0?{taille:i.taille}:{}}}}function I(r){return r>=80?"hoch":r>=60?"mittel":"niedrig"}var R=[[{datei:"ox-logo-5ebd1.svg",inset:"5.88% 53.98% 6.47% 4.97%"}],[{datei:"ox-logo-a246b.svg",inset:"46.47% 33.45% 5.46% 25.15%",maske:{datei:"ox-logo-31810.svg",position:"-34.5px -48.3px",groesse:"70.2px 104.3px",innen:"-18.71% -15.82% -19.58% -15.25%"}},{datei:"ox-logo-6d693.svg",inset:"46.22% 33.8% 6.13% 25.03%"},{datei:"ox-logo-6e388.svg",inset:"5.88% 7.02% 47.39% 61.35%"},{datei:"ox-logo-6f7f0.svg",inset:"6.13% 4.97% 5.8% 29.12%",maske:{datei:"ox-logo-756dc.svg",position:"-41.3px -0.3px",groesse:"150.5px 104.7px",innen:"-10.21% -9.94% -10.69% -9.58%"}},{datei:"ox-logo-e35f0.svg",inset:"5.88% 5.32% 6.47% 29.01%"}],[{datei:"ox-logo-81a93.svg",inset:"6.39% 2.87% 67.31% 80.82%"},{datei:"ox-logo-8b1d9.svg",inset:"-2.52% -1.46% 60.5% 72.22%",maske:{datei:"ox-logo-135bd.svg",position:"14.7px 10.6px",groesse:"27.9px 31.3px",innen:"0"}}]];function G(r,e){if(!e.maske)return`<div class="ebene" style="inset:${e.inset}"><img alt="" src="${r}${e.datei}" /></div>`;let t=e.maske,i=`url('${r}${t.datei}')`;return`<div class="ebene" style="inset:${e.inset};mask-image:${i};-webkit-mask-image:${i};mask-position:${t.position};-webkit-mask-position:${t.position};mask-size:${t.groesse};-webkit-mask-size:${t.groesse};mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat">
      <div class="ebene" style="inset:${t.innen}"><img alt="" src="${r}${e.datei}" /></div>
    </div>`}function P(r){return`<div class="logo" aria-hidden="true"><div class="logo-innen">
    ${R.map((e,t)=>`<div class="stufe stufe-${t+1}">${e.map(i=>G(r,i)).join("")}</div>`).join("")}
  </div></div>`}var T=2.54,K={brust:60,huefte:60,taille:45},f=r=>r.toLocaleString("de-DE",{maximumFractionDigits:1}),A=r=>g.find(e=>e.feld===r),b=(r,e)=>e>=A(r).min&&e<=A(r).max,C={brust:"Brust",huefte:"H\xFCfte",taille:"Taille"};function W(r,e,t){let i=t.huefte_minus_brust_cm,n=t.brust_minus_taille_cm,s=[];return r==="huefte"&&(e.brust!==void 0&&s.push(e.brust+i),e.taille!==void 0&&s.push(e.taille+n+i)),r==="brust"&&(e.huefte!==void 0&&s.push(e.huefte-i),e.taille!==void 0&&s.push(e.taille+n)),r==="taille"&&(e.brust!==void 0&&s.push(e.brust-n),e.huefte!==void 0&&s.push(e.huefte-i-n)),s.length===0?null:s.reduce((a,h)=>a+h,0)/s.length}function L(r,e,t,i){if(r==="koerpergroesse"){if(e>=1&&e<=2.3){let a=Math.round(e*100);return{art:"vorschlag",wert:a,frage:`${f(e)} m? Meinten Sie ${a} cm?`}}return!b(r,e)&&b(r,e/10)?{art:"vorschlag",wert:e/10,frage:`${f(e)} cm? Meinten Sie ${f(e/10)} cm?`}:null}if(!b(r,e)&&b(r,e/10))return{art:"vorschlag",wert:e/10,frage:`${f(e)} cm? Meinten Sie ${f(e/10)} cm?`};let n=K[r];if(n!==void 0&&e<n&&b(r,Math.round(e*T))){let a=Math.round(e*T);return{art:"vorschlag",wert:a,frage:`Haben Sie in Zoll gemessen? ${f(e)} Zoll sind etwa ${a} cm.`}}let s=W(r,t,i);if(s!==null&&Math.abs(e-s)>i.abweichung_cm){let a=C[r],h=e<s;return{art:"nachmessen",text:`Die ${a} wirkt im Vergleich zu Ihren anderen Ma\xDFen ${h?"klein":"gro\xDF"}.${r==="huefte"&&h?" Sie wird oft zu klein gemessen.":""}`}}return null}var z={koerpergroesse:{kurz:"Gr\xF6\xDFe",frage:"Ihre K\xF6rpergr\xF6\xDFe",warum:"Damit \xC4rmel und L\xE4nge zu Ihnen passen.",tipp:"Ohne Schuhe mit dem R\xFCcken an eine Wand stellen, Blick geradeaus. Ein Buch flach auf den Kopf legen, an der Wand markieren und von unten messen.",video:"K\xF6rpergr\xF6\xDFe messen \xB7 15 Sek. \xB7 mit Untertiteln"},brust:{kurz:"Brust",frage:"Ihr Brustumfang",warum:"Damit das Teil an der Brust weder spannt noch schlabbert.",tipp:"Das Ma\xDFband waagerecht \xFCber die st\xE4rkste Stelle der Brust f\xFChren, unter den Armen hindurch. Normal ausatmen, das Band anliegen lassen, nicht straff ziehen. Am besten mit dem BH, den Sie meist tragen.",video:"Brustumfang messen \xB7 15 Sek. \xB7 mit Untertiteln"},huefte:{kurz:"H\xFCfte",frage:"Ihr H\xFCftumfang",warum:"Die H\xFCfte entscheidet bei Kleidern, R\xF6cken und Hosen.",tipp:"F\xFC\xDFe zusammenstellen, das Band waagerecht um die breiteste Stelle des Pos legen. Die H\xFCfte wird am h\xE4ufigsten zu klein gemessen: im Spiegel pr\xFCfen, dass das Band rundherum gerade liegt.",video:"H\xFCftumfang messen \xB7 15 Sek. \xB7 mit Untertiteln"},taille:{kurz:"Taille",frage:"Ihr Taillenumfang",warum:"Damit taillierte Teile, R\xF6cke und Hosen am Bund gut sitzen.",tipp:"An der schmalsten Stelle messen, meist etwas \xFCber dem Bauchnabel. Normal ausatmen, den Bauch nicht einziehen.",video:"Taillenumfang messen \xB7 15 Sek. \xB7 mit Untertiteln"}},B="Zu zweit messen ist genauer. Jedes Ma\xDF am besten zweimal messen.";var H=[["koerpernah","k\xF6rpernah"],["regulaer","regul\xE4r"],["locker","locker"],["oversized","oversized"]],E="ommetryx-sitzung",U={abweichung_cm:6,huefte_minus_brust_cm:8,brust_minus_taille_cm:16},$=(()=>{let r=document.currentScript;return r!=null&&r.src?r.src.replace(/[?#].*$/,"").replace(/[^/]*$/,""):""})();function D(){if(!$||document.getElementById("ommetryx-schrift"))return;let r=document.createElement("link");r.id="ommetryx-schrift",r.rel="stylesheet",r.href=`${$}ommetryx-schrift.css`,document.head.appendChild(r)}var l=r=>r.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),v=r=>new Promise(e=>window.setTimeout(e,r)),w=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches,y={lesen(){try{return window.localStorage.getItem(E)}catch{return null}},schreiben(r){try{window.localStorage.setItem(E,r)}catch{}},loeschen(){try{window.localStorage.removeItem(E)}catch{}}},S=class{constructor(){o(this,"host");o(this,"wurzel");o(this,"einstellungen");o(this,"schritt","laden");o(this,"taillePflicht",!1);o(this,"tailleGewertet",!1);o(this,"plausi",U);o(this,"einwilligung",!1);o(this,"alter16",!1);o(this,"roh",{});o(this,"altersgruppe","");o(this,"feldFehler",{});o(this,"passform","regulaer");o(this,"ergebnis");o(this,"vorherigerUeberlauf","");o(this,"token",null);o(this,"profil");o(this,"profilEinwilligung",!1);o(this,"email","");o(this,"meldung","");o(this,"meinUrl",null);o(this,"messIndex",0);o(this,"hinweis",null);o(this,"bestaetigt",{});o(this,"abbruch");o(this,"zurueckNachAbbruch","passform");o(this,"reveal",!1)}oeffnen(e){this.host||(D(),this.einstellungen=e,this.passform="regulaer",this.ergebnis=void 0,this.meldung="",this.hinweis=null,this.schritt="laden",this.host=document.createElement("ommetryx-widget"),this.host.id="ommetryx-widget",this.host.setAttribute("style","display:block !important; position:static !important;"),this.wurzel=this.host.attachShadow({mode:"open"}),this.wurzel.innerHTML=`<style>${M}</style>
      <div class="ox" lang="de">
        <div class="abdunklung" data-aktion="schliessen"></div>
        <div class="fenster" role="dialog" aria-modal="true" aria-labelledby="ox-titel">
          <div data-kopf></div>
          <div class="inhalt" data-inhalt></div>
          <div class="nur-vorleser" aria-live="polite" data-ansage></div>
        </div>
      </div>`,document.body.appendChild(this.host),this.vorherigerUeberlauf=document.documentElement.style.overflow,document.documentElement.style.overflow="hidden",this.wurzel.addEventListener("click",t=>this.beiKlick(t)),this.wurzel.addEventListener("change",t=>this.beiAenderung(t)),this.wurzel.addEventListener("submit",t=>this.beiAbsenden(t)),this.wurzel.addEventListener("keydown",t=>this.beiTaste(t)),this.zeichne(),this.starte())}schliessen(){var n;let e=this.host;if(!e||!this.wurzel)return;(n=this.abbruch)==null||n.abort();let t=this.wurzel.querySelector(".ox"),i=()=>{var s,a;e.remove(),document.documentElement.style.overflow=this.vorherigerUeberlauf,(a=(s=this.einstellungen)==null?void 0:s.ausloeser)==null||a.focus()};if(this.host=void 0,this.wurzel=void 0,this.roh={},this.bestaetigt={},this.profil=void 0,this.ergebnis=void 0,this.email="",w()||!t)return i();t.classList.add("schliesst"),window.setTimeout(i,220)}async post(e,t,i){let n=await fetch(`${this.einstellungen.proxy}/${e}`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},credentials:"same-origin",body:JSON.stringify(t),signal:i});return{status:n.status,daten:await n.json()}}async starte(){let e=this.einstellungen;try{let t=await fetch(`${e.proxy}/artikel?produkt=${encodeURIComponent(e.produkt)}`,{headers:{Accept:"application/json"},credentials:"same-origin"}),i=await t.json();if(!t.ok)throw new Error("Antwort");if(!i.vermessen)return this.wechsle("nicht_vermessen");if(this.taillePflicht=!!i.taillePflicht,this.tailleGewertet=!!i.tailleGewertet,this.meinUrl=i.meinUrl&&i.meinUrl.startsWith("https://")?i.meinUrl:null,i.plausibilitaet&&(this.plausi=i.plausibilitaet),this.token=y.lesen(),this.token){let{daten:n}=await this.post("konto",{aktion:"profil_laden",token:this.token});if(n.angemeldet&&n.profil)return this.profil=n.profil,this.uebernimmProfil(n.profil),this.wechsle("willkommen");this.token=null,y.loeschen()}this.wechsle(this.einwilligung?"messen":"einwilligung")}catch{this.wechsle("fehler")}}uebernimmProfil(e){var i;let t=n=>String(n).replace(".",",");this.roh={koerpergroesse:t(e.koerpergroesse),brust:t(e.brust),huefte:t(e.huefte),...e.taille?{taille:t(e.taille)}:{}},this.altersgruppe=(i=e.altersgruppe)!=null?i:""}async bestaetigeEinwilligung(){try{let{status:e}=await this.post("einwilligung",{version:m.verarbeitung.version,mindestens16:!0});if(e!==200)throw new Error("Antwort");this.messIndex=0,this.wechsle("messen")}catch{this.wechsle("fehler")}}async berechne(e){let t;if(e){let a=k(this.roh,this.taillePflicht);if(!a.ok){this.feldFehler=a.fehler;let h=this.messFelder().findIndex(d=>a.fehler[d]);return this.messIndex=Math.max(0,h),this.wechsle("messen")}t=a.koerper}this.zurueckNachAbbruch=this.schritt==="willkommen"?"willkommen":"passform";let i=!e,n=w()?150:i?230:500;this.abbruch=new AbortController;let s=this.abbruch.signal;this.wechsle("berechnung"),this.setzeEtappe(0,n);try{let a=(async()=>{if(t&&this.token&&this.profil){let c=this.mitAltersgruppe(t),{status:p}=await this.post("konto",{aktion:"profil_speichern",token:this.token,profil:c},s);p===200&&(this.profil=c)}let u=t?{koerper:t}:{token:this.token};return this.post("empfehlung",{produkt:this.einstellungen.produkt,passform:this.passform,...u},s)})();if(await v(n),s.aborted||(this.setzeEtappe(1,n),await v(n),s.aborted))return;this.setzeEtappe(2,n);let{status:h,daten:d}=await a;if(s.aborted)return;if(h===401)return this.abgemeldet(),this.wechsle("einwilligung");if(h!==200)throw new Error("Antwort");if(await v(n),s.aborted||(this.setzeEtappe(3,n),await v(w()?0:350),s.aborted))return;this.ergebnis=d,this.reveal=!w(),this.wechsle("ergebnis"),this.reveal=!1,this.sage(this.ansageText())}catch{if(s.aborted)return;this.wechsle("fehler")}}async rechneSofort(){var i,n;let e=k(this.roh,this.taillePflicht),t=this.token&&this.profil?{token:this.token}:e.ok?{koerper:e.koerper}:null;if(t)try{let{status:s,daten:a}=await this.post("empfehlung",{produkt:this.einstellungen.produkt,passform:this.passform,...t});if(s!==200)throw new Error("Antwort");this.ergebnis=a,this.zeichne(),(n=(i=this.wurzel)==null?void 0:i.querySelector(`input[name=passform][value=${this.passform}]`))==null||n.focus(),this.sage(this.ansageText())}catch{this.wechsle("fehler")}}setzeEtappe(e,t){var n;let i=this.wurzel;i&&((n=i.querySelector(".logo-innen"))==null||n.style.setProperty("--etappe",`${t}ms`),i.querySelectorAll(".stufe").forEach((s,a)=>s.classList.toggle("zeigen",a<=e)),i.querySelectorAll(".schritte-liste li").forEach((s,a)=>{s.classList.toggle("fertig",a<e),s.classList.toggle("aktiv",a===e)}))}brecheAb(){var e;(e=this.abbruch)==null||e.abort(),this.wechsle(this.zurueckNachAbbruch)}mitAltersgruppe(e){return{...e,...this.altersgruppe?{altersgruppe:this.altersgruppe}:{}}}async fordereCodeAn(){var t,i;let e=(t=this.wurzel)==null?void 0:t.getElementById("ox-email");if(this.email=((i=e==null?void 0:e.value)!=null?i:this.email).trim(),this.feldFehler={},this.profilEinwilligung||(this.feldFehler.profil="Bitte best\xE4tigen Sie die Einwilligung, damit wir Ihre Ma\xDFe speichern d\xFCrfen."),/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)||(this.feldFehler.email="Bitte geben Sie eine g\xFCltige E-Mail-Adresse ein."),Object.keys(this.feldFehler).length>0)return this.zeichne();try{let{status:n}=await this.post("konto",{aktion:"code_anfordern",email:this.email});if(n!==200)throw new Error("Antwort");this.wechsle("code")}catch{this.wechsle("fehler")}}async pruefeCode(e){let t=k(this.roh,this.taillePflicht);try{let{status:i,daten:n}=await this.post("konto",{aktion:"code_pruefen",email:this.email,code:e,einwilligung:{version:m.profil.version,mindestens16:!0},...t.ok?{profil:this.mitAltersgruppe(t.koerper)}:{}});if(i===401)return this.feldFehler={code:"Der Code stimmt nicht oder ist abgelaufen. Bitte pr\xFCfen Sie ihn oder fordern Sie einen neuen an."},this.zeichne();if(i!==200||!n.token)throw new Error("Antwort");this.token=n.token,y.schreiben(n.token),t.ok&&(this.profil=this.mitAltersgruppe(t.koerper)),this.email="",this.meldung="Ihre Ma\xDFe sind gespeichert. Beim n\xE4chsten Mal w\xE4hlen Sie nur noch die Passform.",this.wechsle("ergebnis"),this.sage(this.meldung)}catch{this.wechsle("fehler")}}async meldeAb(){let e=this.token;if(this.abgemeldet(),e)try{await this.post("konto",{aktion:"abmelden",token:e})}catch{}this.roh={},this.bestaetigt={},this.einwilligung=!1,this.alter16=!1,this.wechsle("einwilligung")}abgemeldet(){this.token=null,this.profil=void 0,y.loeschen()}messFelder(){let e=["koerpergroesse","brust","huefte"];return(this.tailleGewertet||this.taillePflicht)&&e.push("taille"),e}aktuellesFeld(){return this.messFelder()[this.messIndex]}weiter(){var h,d,u,c;let e=this.aktuellesFeld(),t=(h=this.wurzel)==null?void 0:h.getElementById(`ox-${e}`);t&&(this.roh[e]=t.value);let i=((d=this.roh[e])!=null?d:"").trim(),n=x(i),s=g.find(p=>p.feld===e),a=e!=="taille"||this.taillePflicht;if(this.feldFehler={},n===null)return a?(this.feldFehler[e]=`Bitte geben Sie Ihren ${s.beschriftung} in cm ein.`,this.zeichneUndFokus(`ox-${e}`)):this.naechsterSchritt();if(Number.isNaN(n))return this.feldFehler[e]="Bitte nur eine Zahl eingeben, z. B. 92 oder 92,5.",this.zeichneUndFokus(`ox-${e}`);if(this.bestaetigt[e]!==i){let p=L(e,n,this.andereWerte(e),this.plausi);if(p){this.hinweis={feld:e,hinweis:p},this.zeichne(),(c=(u=this.wurzel)==null?void 0:u.querySelector(".nachfrage"))==null||c.focus();return}}if(n<s.min||n>s.max)return this.feldFehler[e]=`Bitte pr\xFCfen Sie den Wert. Erwartet wird ein Wert zwischen ${s.min} und ${s.max} cm.`,this.zeichneUndFokus(`ox-${e}`);this.naechsterSchritt()}andereWerte(e){let t={};for(let i of this.messFelder()){if(i===e)continue;let n=x(this.roh[i]);n!==null&&!Number.isNaN(n)&&(t[i]=n)}return t}naechsterSchritt(){if(this.hinweis=null,this.messIndex<this.messFelder().length-1)return this.messIndex+=1,this.wechsle("messen");this.wechsle("passform")}zurueck(){if(this.hinweis=null,this.feldFehler={},this.schritt==="passform")return this.messIndex=this.messFelder().length-1,this.wechsle("messen");if(this.schritt==="messen"&&this.messIndex>0)return this.messIndex-=1,this.wechsle("messen");this.wechsle(this.token&&this.profil?"willkommen":"einwilligung")}beiKlick(e){var i,n,s;let t=e.target.closest("[data-aktion]");if(t)switch(t.dataset.aktion){case"schliessen":return this.schliessen();case"zur-einwilligung-weiter":this.einwilligung&&this.alter16&&this.bestaetigeEinwilligung();return;case"zurueck":return this.zurueck();case"vorschlag-uebernehmen":{if(((i=this.hinweis)==null?void 0:i.hinweis.art)!=="vorschlag")return;let a=this.hinweis.feld;return this.roh[a]=String(this.hinweis.hinweis.wert).replace(".",","),this.hinweis=null,this.weiter()}case"aendern":{let a=(n=this.hinweis)==null?void 0:n.feld;return this.hinweis=null,this.zeichneUndFokus(a?`ox-${a}`:void 0)}case"stimmt-so":{if(!this.hinweis)return;let a=this.hinweis.feld;return this.bestaetigt[a]=((s=this.roh[a])!=null?s:"").trim(),this.hinweis=null,this.weiter()}case"masse-aendern":return this.messIndex=0,this.wechsle("messen");case"erneut":return this.wechsle("laden"),void this.starte();case"willkommen-rechnen":return void this.berechne(!1);case"abbrechen":return this.brecheAb();case"speichern":return this.feldFehler={},this.wechsle("speichern");case"code-erneut":return this.meldung="Wir haben Ihnen einen neuen Code geschickt.",void this.fordereCodeAn();case"andere-email":return this.meldung="",this.wechsle("speichern");case"abmelden":return void this.meldeAb()}}beiAenderung(e){var i;let t=e.target;if(t instanceof HTMLInputElement&&t.name==="einwilligung"&&(this.einwilligung=t.checked),t instanceof HTMLInputElement&&t.name==="alter16"&&(this.alter16=t.checked),t instanceof HTMLInputElement&&t.name==="profil-einwilligung"&&(this.profilEinwilligung=t.checked),t.name==="einwilligung"||t.name==="alter16"){let n=(i=this.wurzel)==null?void 0:i.querySelector("[data-aktion='zur-einwilligung-weiter']");n&&(n.disabled=!(this.einwilligung&&this.alter16))}t.name==="altersgruppe"&&(this.altersgruppe=t.value),t.name==="passform"&&(this.passform=t.value,this.schritt==="ergebnis"&&this.rechneSofort())}beiAbsenden(e){e.preventDefault();let t=e.target;switch(t.dataset.formular){case"code":return void this.pruefeCode(t.elements.namedItem("code").value);case"speichern":return void this.fordereCodeAn();case"messen":return this.weiter();case"passform":return void this.berechne(!0)}}beiTaste(e){if(e.key==="Escape"){e.preventDefault(),this.schliessen();return}if(e.key!=="Tab"||!this.wurzel)return;let t=[...this.wurzel.querySelectorAll("button:not([disabled]), input:not([disabled]), select, summary, a[href], [tabindex='-1']")].filter(a=>a.offsetParent!==null||a.tagName==="H2"),i=t[0],n=t[t.length-1],s=this.wurzel.activeElement;e.shiftKey&&(s===i||(s==null?void 0:s.tagName)==="H2")?(e.preventDefault(),n==null||n.focus()):!e.shiftKey&&s===n&&(e.preventDefault(),i==null||i.focus())}wechsle(e){var t,i;this.schritt=e,this.zeichne(),(i=(t=this.wurzel)==null?void 0:t.querySelector("h2"))==null||i.focus()}zeichneUndFokus(e){var t,i;this.zeichne(),e&&((i=(t=this.wurzel)==null?void 0:t.getElementById(e))==null||i.focus())}sage(e){var i;let t=(i=this.wurzel)==null?void 0:i.querySelector("[data-ansage]");t&&(t.textContent=e)}ansageText(){let e=this.ergebnis;return e?e.status==="empfohlen"&&e.recommended_size?`Empfohlene Gr\xF6\xDFe ${e.recommended_size}, Passform ${this.passformText()}.`:"Keine sichere Gr\xF6\xDFenempfehlung m\xF6glich.":""}passformText(){var e,t;return(t=(e=H.find(([i])=>i===this.passform))==null?void 0:e[1])!=null?t:""}zeichne(){let e=this.wurzel;if(!e)return;let t=e.querySelector("[data-kopf]"),i=e.querySelector("[data-inhalt]");t&&(t.innerHTML=this.htmlKopf()),i&&(i.innerHTML=this.html())}htmlKopf(){let e='<button type="button" class="schliessen" data-aktion="schliessen" aria-label="Gr\xF6\xDFenberatung schlie\xDFen">\xD7</button>';if(this.schritt==="messen"||this.schritt==="passform"){let i=this.messFelder().length,n=this.schritt==="passform"?i:this.messIndex+1,s=this.schritt==="passform"?"Passform":`${z[this.aktuellesFeld()].kurz} \xB7 ${n} von ${i}`,a=this.schritt==="passform"?100:Math.round(n/(i+1)*100);return`<div class="kopf-schritt">
          <button type="button" class="zurueck" data-aktion="zurueck" aria-label="Zur\xFCck">\u2039</button>
          <span class="titel">${l(s)}</span>
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
          <span>${l(m.verarbeitung.text)}</span>
        </label>
        <label class="wahl">
          <input type="checkbox" name="alter16" ${this.alter16?"checked":""} />
          <span>${l(m.alter16.text)}</span>
        </label>
      </div>
      <button type="button" class="primaer" data-aktion="zur-einwilligung-weiter" ${e?"":"disabled"}>Weiter</button>
      <button type="button" class="link" data-aktion="schliessen">Ohne Einwilligung: Gr\xF6\xDFentabelle des Shops nutzen</button>`}htmlWillkommen(){return`<h2 id="ox-titel" tabindex="-1">Willkommen zur\xFCck</h2>
      <p>Ihre Ma\xDFe sind gespeichert. W\xE4hlen Sie nur noch, wie dieses Teil sitzen soll.</p>
      <form novalidate data-formular="willkommen">${this.htmlPassform()}</form>
      <button type="button" class="primaer" data-aktion="willkommen-rechnen">Gr\xF6\xDFe berechnen</button>
      <button type="button" class="sekundaer" data-aktion="masse-aendern">Ma\xDFe \xE4ndern</button>
      ${this.meinLink()}
      <button type="button" class="link" data-aktion="abmelden">Abmelden</button>`}htmlMessen(){var d,u,c;let e=this.aktuellesFeld(),t=z[e],i=`ox-${e}`,n=this.feldFehler[e],s=e==="taille"&&!this.taillePflicht,a=[n?`${i}-fehler`:"",((d=this.hinweis)==null?void 0:d.feld)===e?"ox-nachfrage":""].filter(Boolean).join(" "),h=this.messIndex===this.messFelder().length-1;return`<div class="video" role="img" aria-label="Platzhalter f\xFCr ein Anleitungsvideo: ${l(t.video)}">
        <span class="abspielen" aria-hidden="true"><svg width="20" height="22" viewBox="0 0 20 22"><path d="M2 1.5v19L19 11z" fill="#fff"/></svg></span>
        <span aria-hidden="true">[Video: ${l(t.video)}]</span>
      </div>
      <form novalidate data-formular="messen">
        <h2 id="ox-titel" tabindex="-1">${l(t.frage)}${s?' <span class="leise">(empfohlen)</span>':""}</h2>
        <p class="warum">${l(t.warum)}</p>
        <div class="feld">
          <label for="${i}" class="nur-vorleser">${l(t.frage)} in Zentimetern</label>
          <div class="mit-einheit">
            <input id="${i}" name="${e}" inputmode="decimal" autocomplete="off" placeholder="${e==="koerpergroesse"?"z. B. 168":"z. B. 92"}"
              value="${l((u=this.roh[e])!=null?u:"")}" ${n?'aria-invalid="true"':""} ${a?`aria-describedby="${a}"`:""} />
            <span class="einheit" aria-hidden="true">cm</span>
          </div>
          ${n?`<span class="fehler" id="${i}-fehler">${l(n)}</span>`:""}
        </div>
        ${((c=this.hinweis)==null?void 0:c.feld)===e?this.htmlNachfrage(this.hinweis.hinweis,t.frage):""}
        <details class="tipp">
          <summary>Kein Video m\xF6glich? Kurz-Tipp</summary>
          <p>${l(t.tipp)}</p>
          <p class="leise">${l(B)}</p>
        </details>
        <button type="button" class="karte-knopf" data-aktion="schliessen">
          <span><strong>Kein Ma\xDFband zur Hand?</strong><span>Dann nutzen Sie bitte die Gr\xF6\xDFentabelle des Shops.</span></span>
          <span aria-hidden="true">\u203A</span>
        </button>
        <button type="submit" class="primaer">${h?"Weiter zur Passform":"Weiter"}</button>
      </form>`}htmlNachfrage(e,t){return e.art==="vorschlag"?`<div class="nachfrage" id="ox-nachfrage" tabindex="-1" role="group" aria-label="R\xFCckfrage zu ${l(t)}">
          <p><strong>${l(e.frage)}</strong></p>
          <div class="knoepfe">
            <button type="button" class="primaer" data-aktion="vorschlag-uebernehmen">${l(String(e.wert).replace(".",","))} cm \xFCbernehmen</button>
            <button type="button" class="sekundaer" data-aktion="aendern">\xC4ndern</button>
          </div>
        </div>`:`<div class="nachfrage" id="ox-nachfrage" tabindex="-1" role="group" aria-label="R\xFCckfrage zu ${l(t)}">
        <p><strong>Bitte noch einmal messen?</strong> ${l(e.text)}</p>
        <div class="knoepfe">
          <button type="button" class="sekundaer" data-aktion="stimmt-so">Stimmt so</button>
          <button type="button" class="sekundaer" data-aktion="aendern">Nochmal messen</button>
        </div>
      </div>`}htmlPassform(){return`<fieldset>
        <legend>Wie soll dieses Teil sitzen?</legend>
        <div class="chips" role="radiogroup">
          ${H.map(([e,t])=>`<label class="chip"><input type="radio" name="passform" value="${e}" ${this.passform===e?"checked":""} /><span>${t}</span></label>`).join("")}
        </div>
      </fieldset>`}htmlPassformSchritt(){return`<form novalidate data-formular="passform">
        <h2 id="ox-titel" tabindex="-1">Wie soll dieses Teil sitzen?</h2>
        <p class="warum">Jedes Teil darf anders sitzen. Wir fragen deshalb bei jedem Artikel neu.</p>
        ${this.htmlPassform().replace("<legend>Wie soll dieses Teil sitzen?</legend>",'<legend class="nur-vorleser">Passform</legend>')}
        <div class="feld">
          <label for="ox-altersgruppe">Altersgruppe (optional)</label>
          <select id="ox-altersgruppe" name="altersgruppe">
            <option value="">Keine Angabe</option>
            ${F.map(e=>`<option value="${e}" ${this.altersgruppe===e?"selected":""}>${e} Jahre</option>`).join("")}
          </select>
        </div>
        <button type="submit" class="primaer">Gr\xF6\xDFe berechnen</button>
      </form>`}htmlBerechnung(){let e=["Ihre Ma\xDFe","Echte Ma\xDFe dieses Artikels",`Passform \u201E${this.passformText()}\u201C`];return`<div class="berechnung">
        ${P($)}
        <h2 id="ox-titel" tabindex="-1">Wir vergleichen Ihre Ma\xDFe mit den echten Ma\xDFen dieses Artikels</h2>
        <ol class="schritte-liste">
          ${e.map(t=>`<li><span class="marke-punkt" aria-hidden="true"></span>${l(t)}</li>`).join("")}
        </ol>
        <button type="button" class="link" data-aktion="abbrechen">Abbrechen</button>
      </div>`}htmlErgebnis(){let e=this.ergebnis,t=e.status==="empfohlen"&&e.recommended_size?`<div class="ergebnis">
            <div class="kreis" aria-hidden="true"><span>${l(e.recommended_size)}</span></div>
            <div><strong>Gr\xF6\xDFe ${l(e.recommended_size)}</strong><span class="leise">Sicherheit: ${I(e.confidence)}</span></div>
          </div>`:e.status==="keine_passende_groesse"?"<p>Leider passt Ihnen keine der verf\xFCgbaren Gr\xF6\xDFen gut genug. Bitte nutzen Sie die Gr\xF6\xDFentabelle des Shops.</p>":"<p>F\xFCr Ihre Ma\xDFe k\xF6nnen wir bei diesem Artikel keine sichere Gr\xF6\xDFe empfehlen. Bitte nutzen Sie die Gr\xF6\xDFentabelle des Shops.</p>",i=[e.status==="empfohlen"&&e.alternative_size?`<p>Sie liegen zwischen zwei Gr\xF6\xDFen. ${l(e.alternative_size)} passt fast genauso gut.</p>`:"",e.status==="empfohlen"&&e.begrenzt_durch_schnitt?'<p class="leise">Dieser Artikel ist anders geschnitten als Ihre Wahl. Wir haben die Empfehlung daran angepasst.</p>':""].join(""),n=this.token?`${this.meldung?`<p class="karte" role="status">${l(this.meldung)}</p>`:'<p class="leise">Ihre Ma\xDFe sind gespeichert.</p>'}
         ${this.meinLink()}
         <button type="button" class="link" data-aktion="abmelden">Abmelden</button>`:'<button type="button" class="sekundaer" data-aktion="speichern">Ma\xDFe f\xFCr den n\xE4chsten Einkauf speichern</button>';return`<div class="${this.reveal?"reveal":""}">
        <h2 id="ox-titel" tabindex="-1">Ihre Empfehlung</h2>
        ${t}
        <div class="folge">
          ${i?`<div>${i}</div>`:""}
          <form novalidate data-formular="ergebnis">${this.htmlPassform()}</form>
          <button type="button" class="primaer" data-aktion="schliessen">Fertig</button>
          <div>
            <button type="button" class="sekundaer" data-aktion="masse-aendern">Ma\xDFe \xE4ndern</button>
            ${n}
          </div>
        </div>
      </div>`}meinLink(){return this.meinUrl?`<a class="link" style="display:block" href="${l(this.meinUrl)}" target="_blank" rel="noopener noreferrer">Mein Ommetryx: Daten ansehen, \xE4ndern oder l\xF6schen<span class="nur-vorleser"> (\xF6ffnet in neuem Tab)</span></a>`:""}htmlSpeichern(){let e=this.feldFehler;return`<h2 id="ox-titel" tabindex="-1">Ma\xDFe speichern</h2>
      <span class="entwurf">Entwurf \xB7 Text wird noch rechtlich gepr\xFCft</span>
      <p>Mit einem Profil m\xFCssen Sie beim n\xE4chsten Einkauf nicht neu messen \u2013 auch in anderen Shops mit Ommetryx. Sie melden sich ohne Passwort an: Wir schicken Ihnen einen Code per E-Mail.</p>
      <form novalidate data-formular="speichern">
        <div class="karte">
          <label class="wahl">
            <input type="checkbox" name="profil-einwilligung" ${this.profilEinwilligung?"checked":""} ${e.profil?'aria-invalid="true" aria-describedby="ox-profil-fehler"':""} />
            <span>${l(m.profil.text)}</span>
          </label>
          ${e.profil?`<span class="fehler" id="ox-profil-fehler">${l(e.profil)}</span>`:""}
        </div>
        <div class="feld">
          <label for="ox-email">E-Mail-Adresse</label>
          <input id="ox-email" name="email" type="email" inputmode="email" autocomplete="email" value="${l(this.email)}"
            ${e.email?'aria-invalid="true" aria-describedby="ox-email-fehler"':""} />
          ${e.email?`<span class="fehler" id="ox-email-fehler">${l(e.email)}</span>`:""}
        </div>
        <button type="submit" class="primaer">Code senden</button>
      </form>
      <button type="button" class="sekundaer" data-aktion="schliessen">Nicht speichern</button>`}htmlCode(){let e=this.feldFehler;return`<h2 id="ox-titel" tabindex="-1">Code eingeben</h2>
      <p>Wir haben einen 6-stelligen Code an <strong>${l(this.email)}</strong> geschickt. Er ist 10 Minuten g\xFCltig.</p>
      ${this.meldung?`<p class="leise" role="status">${l(this.meldung)}</p>`:""}
      <form novalidate data-formular="code">
        <div class="feld">
          <label for="ox-code">Code aus der E-Mail</label>
          <input id="ox-code" name="code" inputmode="numeric" autocomplete="one-time-code" maxlength="7"
            ${e.code?'aria-invalid="true" aria-describedby="ox-code-fehler"':""} />
          ${e.code?`<span class="fehler" id="ox-code-fehler">${l(e.code)}</span>`:""}
        </div>
        <button type="submit" class="primaer">Best\xE4tigen</button>
      </form>
      <button type="button" class="link" data-aktion="code-erneut">Code erneut senden</button>
      <button type="button" class="link" data-aktion="andere-email">Andere E-Mail-Adresse verwenden</button>`}},j=new S;window.OmmetryxWidget={oeffnen:r=>j.oeffnen(r)};})();
