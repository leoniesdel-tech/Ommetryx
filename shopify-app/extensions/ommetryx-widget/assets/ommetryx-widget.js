"use strict";(()=>{var x=Object.defineProperty;var w=(s,e,t)=>e in s?x(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t;var a=(s,e,t)=>w(s,typeof e!="symbol"?e+"":e,t);var u=`
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
`;var d=[{feld:"koerpergroesse",beschriftung:"K\xF6rpergr\xF6\xDFe",min:100,max:230},{feld:"brust",beschriftung:"Brustumfang",min:30,max:250},{feld:"huefte",beschriftung:"H\xFCftumfang",min:30,max:250},{feld:"taille",beschriftung:"Taillenumfang",min:30,max:250}];function v(s){let e=(s!=null?s:"").trim().replace(",",".");return e===""?null:/^\d+(\.\d+)?$/.test(e)?Number(e):Number.NaN}function f(s,e){let t={},i={};for(let{feld:n,beschriftung:r,min:l,max:c}of d){let o=v(s[n]),b=n!=="taille"||e;if(o===null){b&&(t[n]=`Bitte geben Sie Ihren ${r} in cm ein.`);continue}if(Number.isNaN(o)){t[n]="Bitte nur eine Zahl eingeben, z. B. 92 oder 92,5.";continue}if(o<l||o>c){t[n]=`Bitte pr\xFCfen Sie den Wert. Erwartet wird ein Wert zwischen ${l} und ${c} cm.`;continue}i[n]=o}return Object.keys(t).length>0?{ok:!1,fehler:t}:{ok:!0,koerper:{koerpergroesse:i.koerpergroesse,brust:i.brust,huefte:i.huefte,...i.taille!==void 0?{taille:i.taille}:{}}}}function m(s){return s>=80?"hoch":s>=60?"mittel":"niedrig"}var g=[["koerpernah","k\xF6rpernah"],["regulaer","regul\xE4r"],["locker","locker"],["oversized","oversized"]],h=s=>s.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),p=class{constructor(){a(this,"host");a(this,"wurzel");a(this,"einstellungen");a(this,"schritt","laden");a(this,"taillePflicht",!1);a(this,"tailleGewertet",!1);a(this,"einwilligung",!1);a(this,"alter16",!1);a(this,"roh",{});a(this,"feldFehler",{});a(this,"passform","regulaer");a(this,"ergebnis");a(this,"rechnet",!1);a(this,"vorherigerUeberlauf","")}oeffnen(e){this.host||(this.einstellungen=e,this.passform="regulaer",this.ergebnis=void 0,this.schritt="laden",this.host=document.createElement("div"),this.host.id="ommetryx-widget",this.wurzel=this.host.attachShadow({mode:"open"}),this.wurzel.innerHTML=`<style>${u}</style>
      <div class="ox" lang="de">
        <div class="abdunklung" data-aktion="schliessen"></div>
        <div class="fenster" role="dialog" aria-modal="true" aria-labelledby="ox-titel">
          <div class="kopf">
            <span class="marke">Ommetryx \xB7 Gr\xF6\xDFenberatung</span>
            <button type="button" class="schliessen" data-aktion="schliessen" aria-label="Gr\xF6\xDFenberatung schlie\xDFen">\xD7</button>
          </div>
          <div class="inhalt" data-inhalt></div>
          <div class="nur-vorleser" aria-live="polite" data-ansage></div>
        </div>
      </div>`,document.body.appendChild(this.host),this.vorherigerUeberlauf=document.documentElement.style.overflow,document.documentElement.style.overflow="hidden",this.wurzel.addEventListener("click",t=>this.beiKlick(t)),this.wurzel.addEventListener("change",t=>this.beiAenderung(t)),this.wurzel.addEventListener("submit",t=>this.beiAbsenden(t)),this.wurzel.addEventListener("keydown",t=>this.beiTaste(t)),this.zeichne(),this.ladeArtikel())}schliessen(){let e=this.host;if(!e||!this.wurzel)return;let t=this.wurzel.querySelector(".ox"),i=window.matchMedia("(prefers-reduced-motion: reduce)").matches,n=()=>{var r,l;e.remove(),document.documentElement.style.overflow=this.vorherigerUeberlauf,(l=(r=this.einstellungen)==null?void 0:r.ausloeser)==null||l.focus()};if(this.host=void 0,this.wurzel=void 0,this.roh={},this.ergebnis=void 0,i||!t)return n();t.classList.add("schliesst"),window.setTimeout(n,220)}async ladeArtikel(){let e=this.einstellungen;try{let t=await fetch(`${e.proxy}/artikel?produkt=${encodeURIComponent(e.produkt)}`,{headers:{Accept:"application/json"},credentials:"same-origin"}),i=await t.json();if(!t.ok)throw new Error("Antwort");if(!i.vermessen)return this.wechsle("nicht_vermessen");this.taillePflicht=!!i.taillePflicht,this.tailleGewertet=!!i.tailleGewertet,this.wechsle(this.einwilligung?"masse":"einwilligung")}catch{this.wechsle("fehler")}}async rechne(){var i,n;let e=f(this.roh,this.taillePflicht);if(!e.ok){this.feldFehler=e.fehler,this.zeichne();let r=d.find(l=>e.fehler[l.feld]);r&&((n=(i=this.wurzel)==null?void 0:i.getElementById(`ox-${r.feld}`))==null||n.focus());return}this.feldFehler={},this.rechnet=!0,this.zeichne();let t=this.einstellungen;try{let r=await fetch(`${t.proxy}/empfehlung`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},credentials:"same-origin",body:JSON.stringify({produkt:t.produkt,passform:this.passform,koerper:e.koerper})});if(!r.ok)throw new Error("Antwort");this.ergebnis=await r.json(),this.rechnet=!1,this.wechsle("ergebnis"),this.sage(this.ansageText())}catch{this.rechnet=!1,this.wechsle("fehler")}}beiKlick(e){let t=e.target.closest("[data-aktion]");if(!t)return;let i=t.dataset.aktion;i==="schliessen"&&this.schliessen(),i==="zur-einwilligung-weiter"&&this.einwilligung&&this.alter16&&this.wechsle("masse"),i==="masse-aendern"&&this.wechsle("masse"),i==="erneut"&&(this.wechsle("laden"),this.ladeArtikel())}beiAenderung(e){var i;let t=e.target;if(t.name==="einwilligung"&&(this.einwilligung=t.checked),t.name==="alter16"&&(this.alter16=t.checked),t.name==="einwilligung"||t.name==="alter16"){let n=(i=this.wurzel)==null?void 0:i.querySelector("[data-aktion='zur-einwilligung-weiter']");n&&(n.disabled=!(this.einwilligung&&this.alter16))}t.name==="passform"&&(this.passform=t.value,this.schritt==="ergebnis"&&this.rechne())}beiAbsenden(e){e.preventDefault();let t=e.target;for(let{feld:i}of d){let n=t.elements.namedItem(i);n&&(this.roh[i]=n.value)}this.rechne()}beiTaste(e){if(e.key==="Escape"){e.preventDefault(),this.schliessen();return}if(e.key!=="Tab"||!this.wurzel)return;let t=[...this.wurzel.querySelectorAll("button:not([disabled]), input:not([disabled]), [tabindex='-1']")].filter(l=>l.offsetParent!==null||l.tagName==="H2"),i=t[0],n=t[t.length-1],r=this.wurzel.activeElement;e.shiftKey&&(r===i||(r==null?void 0:r.tagName)==="H2")?(e.preventDefault(),n==null||n.focus()):!e.shiftKey&&r===n&&(e.preventDefault(),i==null||i.focus())}wechsle(e){var t,i;this.schritt=e,this.zeichne(),(i=(t=this.wurzel)==null?void 0:t.querySelector("h2"))==null||i.focus()}sage(e){var i;let t=(i=this.wurzel)==null?void 0:i.querySelector("[data-ansage]");t&&(t.textContent=e)}ansageText(){var t;let e=this.ergebnis;return e?e.status==="empfohlen"&&e.recommended_size?`Empfohlene Gr\xF6\xDFe ${e.recommended_size}, Passform ${(t=g.find(([i])=>i===this.passform))==null?void 0:t[1]}.`:"Keine sichere Gr\xF6\xDFenempfehlung m\xF6glich.":""}zeichne(){var t;let e=(t=this.wurzel)==null?void 0:t.querySelector("[data-inhalt]");e&&(e.innerHTML=this.html())}html(){switch(this.schritt){case"laden":return'<h2 id="ox-titel" tabindex="-1">Einen Moment \u2026</h2><p class="leise">Die Gr\xF6\xDFenberatung wird geladen.</p>';case"nicht_vermessen":return`<h2 id="ox-titel" tabindex="-1">F\xFCr diesen Artikel gibt es noch keine Gr\xF6\xDFenberatung</h2>
          <p>Bitte nutzen Sie die Gr\xF6\xDFentabelle des Shops.</p>
          <button type="button" class="primaer" data-aktion="schliessen">Schlie\xDFen</button>`;case"fehler":return`<h2 id="ox-titel" tabindex="-1">Die Gr\xF6\xDFenberatung ist gerade nicht erreichbar</h2>
          <p>Bitte versuchen Sie es gleich noch einmal oder nutzen Sie die Gr\xF6\xDFentabelle des Shops.</p>
          <button type="button" class="primaer" data-aktion="erneut">Noch einmal versuchen</button>
          <button type="button" class="sekundaer" data-aktion="schliessen">Schlie\xDFen</button>`;case"einwilligung":return this.htmlEinwilligung();case"masse":return this.htmlMasse();case"ergebnis":return this.htmlErgebnis()}}htmlEinwilligung(){let e=this.einwilligung&&this.alter16;return`<h2 id="ox-titel" tabindex="-1">Ihre Gr\xF6\xDFe in wenigen Schritten</h2>
      <span class="entwurf">Entwurf \xB7 Text wird noch rechtlich gepr\xFCft</span>
      <p>Ommetryx vergleicht Ihre K\xF6rperma\xDFe mit den gemessenen Ma\xDFen dieses Kleidungsst\xFCcks und empfiehlt Ihnen eine Gr\xF6\xDFe.</p>
      <div class="karte">
        <label class="wahl">
          <input type="checkbox" name="einwilligung" ${this.einwilligung?"checked":""} />
          <span>Ich willige ein, dass Ommetryx meine K\xF6rperma\xDFe verarbeitet, um mir eine Gr\xF6\xDFe zu empfehlen. K\xF6rperma\xDFe k\xF6nnen R\xFCckschl\xFCsse auf meine Gesundheit zulassen. Die Ma\xDFe werden nicht gespeichert. Ich kann die Einwilligung jederzeit widerrufen.</span>
        </label>
        <label class="wahl">
          <input type="checkbox" name="alter16" ${this.alter16?"checked":""} />
          <span>Ich bin mindestens 16 Jahre alt.</span>
        </label>
      </div>
      <button type="button" class="primaer" data-aktion="zur-einwilligung-weiter" ${e?"":"disabled"}>Weiter</button>
      <button type="button" class="link" data-aktion="schliessen">Ohne Einwilligung: Gr\xF6\xDFentabelle des Shops nutzen</button>`}htmlFeld(e,t,i){var l;let n=this.feldFehler[e],r=`ox-${e}`;return`<div class="feld">
        <label for="${r}">${t} in cm${i}</label>
        <input id="${r}" name="${e}" inputmode="decimal" autocomplete="off" value="${h((l=this.roh[e])!=null?l:"")}"
          ${n?`aria-invalid="true" aria-describedby="${r}-fehler"`:""} />
        ${n?`<span class="fehler" id="${r}-fehler">${h(n)}</span>`:""}
      </div>`}htmlPassform(){return`<fieldset>
        <legend>Wie soll dieses Teil sitzen?</legend>
        <div class="chips" role="radiogroup">
          ${g.map(([e,t])=>`<label class="chip"><input type="radio" name="passform" value="${e}" ${this.passform===e?"checked":""} /><span>${t}</span></label>`).join("")}
        </div>
      </fieldset>`}htmlMasse(){let e=this.taillePflicht?"":" (empfohlen)";return`<h2 id="ox-titel" tabindex="-1">Ihre Ma\xDFe</h2>
      <p class="leise">Messen Sie mit einem Ma\xDFband, am besten zu zweit. Normal ausatmen, Band nicht straff ziehen.</p>
      <form novalidate>
        ${this.htmlFeld("koerpergroesse","K\xF6rpergr\xF6\xDFe","")}
        ${this.htmlFeld("brust","Brustumfang","")}
        ${this.htmlFeld("huefte","H\xFCftumfang","")}
        ${this.tailleGewertet||this.taillePflicht?this.htmlFeld("taille","Taillenumfang",e):""}
        ${this.htmlPassform()}
        <button type="submit" class="primaer" ${this.rechnet?"disabled":""}>${this.rechnet?"Wird berechnet \u2026":"Gr\xF6\xDFe berechnen"}</button>
      </form>`}htmlErgebnis(){let e=this.ergebnis;return`<h2 id="ox-titel" tabindex="-1">Ihre Empfehlung</h2>
      ${e.status==="empfohlen"&&e.recommended_size?`<div class="ergebnis">
            <div class="kreis" aria-hidden="true">${h(e.recommended_size)}</div>
            <div><strong>Gr\xF6\xDFe ${h(e.recommended_size)}</strong><span class="leise">Sicherheit: ${m(e.confidence)}</span></div>
          </div>
          ${e.alternative_size?`<p>Sie liegen zwischen zwei Gr\xF6\xDFen. ${h(e.alternative_size)} passt fast genauso gut.</p>`:""}
          ${e.begrenzt_durch_schnitt?'<p class="leise">Dieser Artikel ist anders geschnitten als Ihre Wahl. Wir haben die Empfehlung daran angepasst.</p>':""}`:e.status==="keine_passende_groesse"?"<p>Leider passt Ihnen keine der verf\xFCgbaren Gr\xF6\xDFen gut genug. Bitte nutzen Sie die Gr\xF6\xDFentabelle des Shops.</p>":"<p>F\xFCr Ihre Ma\xDFe k\xF6nnen wir bei diesem Artikel keine sichere Gr\xF6\xDFe empfehlen. Bitte nutzen Sie die Gr\xF6\xDFentabelle des Shops.</p>"}
      <form novalidate>${this.htmlPassform()}</form>
      ${this.rechnet?'<p class="leise">Wird neu berechnet \u2026</p>':""}
      <button type="button" class="primaer" data-aktion="schliessen">Fertig</button>
      <button type="button" class="sekundaer" data-aktion="masse-aendern">Ma\xDFe \xE4ndern</button>`}},k=new p;window.OmmetryxWidget={oeffnen:s=>k.oeffnen(s)};})();
