"use strict";(()=>{var y=Object.defineProperty;var E=(a,e,t)=>e in a?y(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var s=(a,e,t)=>E(a,typeof e!="symbol"?e+"":e,t);var u={verarbeitung:{version:"entwurf-1",text:"Ich willige ein, dass Ommetryx meine K\xF6rperma\xDFe verarbeitet, um mir eine Gr\xF6\xDFe zu empfehlen. K\xF6rperma\xDFe k\xF6nnen R\xFCckschl\xFCsse auf meine Gesundheit zulassen. Ohne Profil werden die Ma\xDFe nicht gespeichert. Ich kann die Einwilligung jederzeit widerrufen."},profil:{version:"entwurf-1",text:"Ich willige ein, dass Ommetryx meine K\xF6rperma\xDFe und meine E-Mail-Adresse speichert, um mir in allen Shops mit Ommetryx Gr\xF6\xDFen zu empfehlen. Die Ma\xDFe werden verschl\xFCsselt und getrennt von meiner E-Mail-Adresse gespeichert. Neue Ma\xDFe \xFCberschreiben die alten. Ich kann die Einwilligung jederzeit unter \u201EMein Ommetryx\u201C widerrufen; dann wird mein Profil sofort gel\xF6scht. Nach 24 Monaten ohne Nutzung wird es automatisch gel\xF6scht."},alter16:{version:"entwurf-1",text:"Ich bin mindestens 16 Jahre alt."}},w=["16-29","30-44","45-59","60+"];var k=`
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

.nur-vorleser { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
`;var p=[{feld:"koerpergroesse",beschriftung:"K\xF6rpergr\xF6\xDFe",min:100,max:230},{feld:"brust",beschriftung:"Brustumfang",min:30,max:250},{feld:"huefte",beschriftung:"H\xFCftumfang",min:30,max:250},{feld:"taille",beschriftung:"Taillenumfang",min:30,max:250}];function z(a){let e=(a!=null?a:"").trim().replace(",",".");return e===""?null:/^\d+(\.\d+)?$/.test(e)?Number(e):Number.NaN}function f(a,e){let t={},i={};for(let{feld:n,beschriftung:r,min:l,max:d}of p){let h=z(a[n]),m=n!=="taille"||e;if(h===null){m&&(t[n]=`Bitte geben Sie Ihren ${r} in cm ein.`);continue}if(Number.isNaN(h)){t[n]="Bitte nur eine Zahl eingeben, z. B. 92 oder 92,5.";continue}if(h<l||h>d){t[n]=`Bitte pr\xFCfen Sie den Wert. Erwartet wird ein Wert zwischen ${l} und ${d} cm.`;continue}i[n]=h}return Object.keys(t).length>0?{ok:!1,fehler:t}:{ok:!0,koerper:{koerpergroesse:i.koerpergroesse,brust:i.brust,huefte:i.huefte,...i.taille!==void 0?{taille:i.taille}:{}}}}function x(a){return a>=80?"hoch":a>=60?"mittel":"niedrig"}var v=[["koerpernah","k\xF6rpernah"],["regulaer","regul\xE4r"],["locker","locker"],["oversized","oversized"]],g="ommetryx-sitzung",o=a=>a.replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),c={lesen(){try{return window.localStorage.getItem(g)}catch{return null}},schreiben(a){try{window.localStorage.setItem(g,a)}catch{}},loeschen(){try{window.localStorage.removeItem(g)}catch{}}},b=class{constructor(){s(this,"host");s(this,"wurzel");s(this,"einstellungen");s(this,"schritt","laden");s(this,"taillePflicht",!1);s(this,"tailleGewertet",!1);s(this,"einwilligung",!1);s(this,"alter16",!1);s(this,"roh",{});s(this,"altersgruppe","");s(this,"feldFehler",{});s(this,"passform","regulaer");s(this,"ergebnis");s(this,"rechnet",!1);s(this,"vorherigerUeberlauf","");s(this,"token",null);s(this,"profil");s(this,"profilEinwilligung",!1);s(this,"email","");s(this,"meldung","");s(this,"meinUrl",null)}oeffnen(e){this.host||(this.einstellungen=e,this.passform="regulaer",this.ergebnis=void 0,this.meldung="",this.schritt="laden",this.host=document.createElement("ommetryx-widget"),this.host.id="ommetryx-widget",this.host.setAttribute("style","display:block !important; position:static !important;"),this.wurzel=this.host.attachShadow({mode:"open"}),this.wurzel.innerHTML=`<style>${k}</style>
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
      </div>`,document.body.appendChild(this.host),this.vorherigerUeberlauf=document.documentElement.style.overflow,document.documentElement.style.overflow="hidden",this.wurzel.addEventListener("click",t=>this.beiKlick(t)),this.wurzel.addEventListener("change",t=>this.beiAenderung(t)),this.wurzel.addEventListener("submit",t=>this.beiAbsenden(t)),this.wurzel.addEventListener("keydown",t=>this.beiTaste(t)),this.zeichne(),this.starte())}schliessen(){let e=this.host;if(!e||!this.wurzel)return;let t=this.wurzel.querySelector(".ox"),i=window.matchMedia("(prefers-reduced-motion: reduce)").matches,n=()=>{var r,l;e.remove(),document.documentElement.style.overflow=this.vorherigerUeberlauf,(l=(r=this.einstellungen)==null?void 0:r.ausloeser)==null||l.focus()};if(this.host=void 0,this.wurzel=void 0,this.roh={},this.profil=void 0,this.ergebnis=void 0,this.email="",i||!t)return n();t.classList.add("schliesst"),window.setTimeout(n,220)}async post(e,t){let i=await fetch(`${this.einstellungen.proxy}/${e}`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},credentials:"same-origin",body:JSON.stringify(t)});return{status:i.status,daten:await i.json()}}async starte(){let e=this.einstellungen;try{let t=await fetch(`${e.proxy}/artikel?produkt=${encodeURIComponent(e.produkt)}`,{headers:{Accept:"application/json"},credentials:"same-origin"}),i=await t.json();if(!t.ok)throw new Error("Antwort");if(!i.vermessen)return this.wechsle("nicht_vermessen");if(this.taillePflicht=!!i.taillePflicht,this.tailleGewertet=!!i.tailleGewertet,this.meinUrl=i.meinUrl&&i.meinUrl.startsWith("https://")?i.meinUrl:null,this.token=c.lesen(),this.token){let{daten:n}=await this.post("konto",{aktion:"profil_laden",token:this.token});if(n.angemeldet&&n.profil)return this.profil=n.profil,this.uebernimmProfil(n.profil),this.wechsle("willkommen");this.token=null,c.loeschen()}this.wechsle(this.einwilligung?"masse":"einwilligung")}catch{this.wechsle("fehler")}}uebernimmProfil(e){var t;this.roh={koerpergroesse:String(e.koerpergroesse).replace(".",","),brust:String(e.brust).replace(".",","),huefte:String(e.huefte).replace(".",","),...e.taille?{taille:String(e.taille).replace(".",",")}:{}},this.altersgruppe=(t=e.altersgruppe)!=null?t:""}async bestaetigeEinwilligung(){try{let{status:e}=await this.post("einwilligung",{version:u.verarbeitung.version,mindestens16:!0});if(e!==200)throw new Error("Antwort");this.wechsle("masse")}catch{this.wechsle("fehler")}}async rechne(e){var i,n;let t;if(e){let r=f(this.roh,this.taillePflicht);if(!r.ok){this.feldFehler=r.fehler,this.zeichne();let l=p.find(d=>r.fehler[d.feld]);l&&((n=(i=this.wurzel)==null?void 0:i.getElementById(`ox-${l.feld}`))==null||n.focus());return}t=r.koerper}this.feldFehler={},this.rechnet=!0,this.zeichne();try{if(t&&this.token&&this.profil){let h=this.mitAltersgruppe(t),{status:m}=await this.post("konto",{aktion:"profil_speichern",token:this.token,profil:h});m===200&&(this.profil=h)}let r=t?{koerper:t}:{token:this.token},{status:l,daten:d}=await this.post("empfehlung",{produkt:this.einstellungen.produkt,passform:this.passform,...r});if(l===401)return this.abgemeldet(),this.wechsle("einwilligung");if(l!==200)throw new Error("Antwort");this.ergebnis=d,this.rechnet=!1,this.wechsle("ergebnis"),this.sage(this.ansageText())}catch{this.rechnet=!1,this.wechsle("fehler")}}mitAltersgruppe(e){return{...e,...this.altersgruppe?{altersgruppe:this.altersgruppe}:{}}}async fordereCodeAn(){var t,i;let e=(t=this.wurzel)==null?void 0:t.getElementById("ox-email");if(this.email=((i=e==null?void 0:e.value)!=null?i:this.email).trim(),this.feldFehler={},this.profilEinwilligung||(this.feldFehler.profil="Bitte best\xE4tigen Sie die Einwilligung, damit wir Ihre Ma\xDFe speichern d\xFCrfen."),/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)||(this.feldFehler.email="Bitte geben Sie eine g\xFCltige E-Mail-Adresse ein."),Object.keys(this.feldFehler).length>0)return this.zeichne();try{let{status:n}=await this.post("konto",{aktion:"code_anfordern",email:this.email});if(n!==200)throw new Error("Antwort");this.meldung="",this.wechsle("code")}catch{this.wechsle("fehler")}}async pruefeCode(e){let t=f(this.roh,this.taillePflicht);try{let{status:i,daten:n}=await this.post("konto",{aktion:"code_pruefen",email:this.email,code:e,einwilligung:{version:u.profil.version,mindestens16:!0},...t.ok?{profil:this.mitAltersgruppe(t.koerper)}:{}});if(i===401)return this.feldFehler={code:"Der Code stimmt nicht oder ist abgelaufen. Bitte pr\xFCfen Sie ihn oder fordern Sie einen neuen an."},this.zeichne();if(i!==200||!n.token)throw new Error("Antwort");this.token=n.token,c.schreiben(n.token),t.ok&&(this.profil=this.mitAltersgruppe(t.koerper)),this.email="",this.meldung="Ihre Ma\xDFe sind gespeichert. Beim n\xE4chsten Mal w\xE4hlen Sie nur noch die Passform.",this.wechsle("ergebnis"),this.sage(this.meldung)}catch{this.wechsle("fehler")}}async melddeAb(){let e=this.token;if(this.abgemeldet(),e)try{await this.post("konto",{aktion:"abmelden",token:e})}catch{}this.roh={},this.einwilligung=!1,this.alter16=!1,this.wechsle("einwilligung")}abgemeldet(){this.token=null,this.profil=void 0,c.loeschen()}beiKlick(e){let t=e.target.closest("[data-aktion]");if(t)switch(t.dataset.aktion){case"schliessen":return this.schliessen();case"zur-einwilligung-weiter":this.einwilligung&&this.alter16&&this.bestaetigeEinwilligung();return;case"masse-aendern":return this.wechsle("masse");case"erneut":return this.wechsle("laden"),void this.starte();case"willkommen-rechnen":return void this.rechne(!1);case"speichern":return this.feldFehler={},this.wechsle("speichern");case"code-senden":return void this.fordereCodeAn();case"code-erneut":return this.meldung="Wir haben Ihnen einen neuen Code geschickt.",void this.fordereCodeAn();case"andere-email":return this.wechsle("speichern");case"abmelden":return void this.melddeAb()}}beiAenderung(e){var i;let t=e.target;if(t instanceof HTMLInputElement&&t.name==="einwilligung"&&(this.einwilligung=t.checked),t instanceof HTMLInputElement&&t.name==="alter16"&&(this.alter16=t.checked),t instanceof HTMLInputElement&&t.name==="profil-einwilligung"&&(this.profilEinwilligung=t.checked),t.name==="einwilligung"||t.name==="alter16"){let n=(i=this.wurzel)==null?void 0:i.querySelector("[data-aktion='zur-einwilligung-weiter']");n&&(n.disabled=!(this.einwilligung&&this.alter16))}t.name==="altersgruppe"&&(this.altersgruppe=t.value),t.name==="passform"&&(this.passform=t.value,this.schritt==="ergebnis"&&this.rechne(!this.token))}beiAbsenden(e){e.preventDefault();let t=e.target;if(t.dataset.formular==="code"){let i=t.elements.namedItem("code").value;return void this.pruefeCode(i)}if(t.dataset.formular==="speichern")return void this.fordereCodeAn();for(let{feld:i}of p){let n=t.elements.namedItem(i);n&&(this.roh[i]=n.value)}this.rechne(!0)}beiTaste(e){if(e.key==="Escape"){e.preventDefault(),this.schliessen();return}if(e.key!=="Tab"||!this.wurzel)return;let t=[...this.wurzel.querySelectorAll("button:not([disabled]), input:not([disabled]), select, [tabindex='-1']")].filter(l=>l.offsetParent!==null||l.tagName==="H2"),i=t[0],n=t[t.length-1],r=this.wurzel.activeElement;e.shiftKey&&(r===i||(r==null?void 0:r.tagName)==="H2")?(e.preventDefault(),n==null||n.focus()):!e.shiftKey&&r===n&&(e.preventDefault(),i==null||i.focus())}wechsle(e){var t,i;this.schritt=e,this.zeichne(),(i=(t=this.wurzel)==null?void 0:t.querySelector("h2"))==null||i.focus()}sage(e){var i;let t=(i=this.wurzel)==null?void 0:i.querySelector("[data-ansage]");t&&(t.textContent=e)}ansageText(){var t;let e=this.ergebnis;return e?e.status==="empfohlen"&&e.recommended_size?`Empfohlene Gr\xF6\xDFe ${e.recommended_size}, Passform ${(t=v.find(([i])=>i===this.passform))==null?void 0:t[1]}.`:"Keine sichere Gr\xF6\xDFenempfehlung m\xF6glich.":""}zeichne(){var t;let e=(t=this.wurzel)==null?void 0:t.querySelector("[data-inhalt]");e&&(e.innerHTML=this.html())}html(){switch(this.schritt){case"laden":return'<h2 id="ox-titel" tabindex="-1">Einen Moment \u2026</h2><p class="leise">Die Gr\xF6\xDFenberatung wird geladen.</p>';case"nicht_vermessen":return`<h2 id="ox-titel" tabindex="-1">F\xFCr diesen Artikel gibt es noch keine Gr\xF6\xDFenberatung</h2>
          <p>Bitte nutzen Sie die Gr\xF6\xDFentabelle des Shops.</p>
          <button type="button" class="primaer" data-aktion="schliessen">Schlie\xDFen</button>`;case"fehler":return`<h2 id="ox-titel" tabindex="-1">Die Gr\xF6\xDFenberatung ist gerade nicht erreichbar</h2>
          <p>Bitte versuchen Sie es gleich noch einmal oder nutzen Sie die Gr\xF6\xDFentabelle des Shops.</p>
          <button type="button" class="primaer" data-aktion="erneut">Noch einmal versuchen</button>
          <button type="button" class="sekundaer" data-aktion="schliessen">Schlie\xDFen</button>`;case"einwilligung":return this.htmlEinwilligung();case"willkommen":return this.htmlWillkommen();case"masse":return this.htmlMasse();case"ergebnis":return this.htmlErgebnis();case"speichern":return this.htmlSpeichern();case"code":return this.htmlCode()}}htmlEinwilligung(){let e=this.einwilligung&&this.alter16;return`<h2 id="ox-titel" tabindex="-1">Ihre Gr\xF6\xDFe in wenigen Schritten</h2>
      <span class="entwurf">Entwurf \xB7 Text wird noch rechtlich gepr\xFCft</span>
      <p>Ommetryx vergleicht Ihre K\xF6rperma\xDFe mit den gemessenen Ma\xDFen dieses Kleidungsst\xFCcks und empfiehlt Ihnen eine Gr\xF6\xDFe.</p>
      <div class="karte">
        <label class="wahl">
          <input type="checkbox" name="einwilligung" ${this.einwilligung?"checked":""} />
          <span>${o(u.verarbeitung.text)}</span>
        </label>
        <label class="wahl">
          <input type="checkbox" name="alter16" ${this.alter16?"checked":""} />
          <span>${o(u.alter16.text)}</span>
        </label>
      </div>
      <button type="button" class="primaer" data-aktion="zur-einwilligung-weiter" ${e?"":"disabled"}>Weiter</button>
      <button type="button" class="link" data-aktion="schliessen">Ohne Einwilligung: Gr\xF6\xDFentabelle des Shops nutzen</button>`}htmlWillkommen(){return`<h2 id="ox-titel" tabindex="-1">Willkommen zur\xFCck</h2>
      <p>Ihre Ma\xDFe sind gespeichert. W\xE4hlen Sie nur noch, wie dieses Teil sitzen soll.</p>
      <form novalidate data-formular="willkommen">${this.htmlPassform()}</form>
      <button type="button" class="primaer" data-aktion="willkommen-rechnen" ${this.rechnet?"disabled":""}>${this.rechnet?"Wird berechnet \u2026":"Gr\xF6\xDFe berechnen"}</button>
      <button type="button" class="sekundaer" data-aktion="masse-aendern">Ma\xDFe \xE4ndern</button>
      ${this.meinLink()}
      <button type="button" class="link" data-aktion="abmelden">Abmelden</button>`}meinLink(){return this.meinUrl?`<a class="link" style="display:block" href="${o(this.meinUrl)}" target="_blank" rel="noopener noreferrer">Mein Ommetryx: Daten ansehen, \xE4ndern oder l\xF6schen<span class="nur-vorleser"> (\xF6ffnet in neuem Tab)</span></a>`:""}htmlFeld(e,t,i){var l;let n=this.feldFehler[e],r=`ox-${e}`;return`<div class="feld">
        <label for="${r}">${t} in cm${i}</label>
        <input id="${r}" name="${e}" inputmode="decimal" autocomplete="off" value="${o((l=this.roh[e])!=null?l:"")}"
          ${n?`aria-invalid="true" aria-describedby="${r}-fehler"`:""} />
        ${n?`<span class="fehler" id="${r}-fehler">${o(n)}</span>`:""}
      </div>`}htmlPassform(){return`<fieldset>
        <legend>Wie soll dieses Teil sitzen?</legend>
        <div class="chips" role="radiogroup">
          ${v.map(([e,t])=>`<label class="chip"><input type="radio" name="passform" value="${e}" ${this.passform===e?"checked":""} /><span>${t}</span></label>`).join("")}
        </div>
      </fieldset>`}htmlMasse(){let e=this.taillePflicht?"":" (empfohlen)";return`<h2 id="ox-titel" tabindex="-1">Ihre Ma\xDFe</h2>
      <p class="leise">Messen Sie mit einem Ma\xDFband, am besten zu zweit. Normal ausatmen, Band nicht straff ziehen.</p>
      <form novalidate data-formular="masse">
        ${this.htmlFeld("koerpergroesse","K\xF6rpergr\xF6\xDFe","")}
        ${this.htmlFeld("brust","Brustumfang","")}
        ${this.htmlFeld("huefte","H\xFCftumfang","")}
        ${this.tailleGewertet||this.taillePflicht?this.htmlFeld("taille","Taillenumfang",e):""}
        <div class="feld">
          <label for="ox-altersgruppe">Altersgruppe (optional)</label>
          <select id="ox-altersgruppe" name="altersgruppe">
            <option value="">Keine Angabe</option>
            ${w.map(t=>`<option value="${t}" ${this.altersgruppe===t?"selected":""}>${t} Jahre</option>`).join("")}
          </select>
        </div>
        ${this.htmlPassform()}
        <button type="submit" class="primaer" ${this.rechnet?"disabled":""}>${this.rechnet?"Wird berechnet \u2026":"Gr\xF6\xDFe berechnen"}</button>
      </form>`}htmlErgebnis(){let e=this.ergebnis,t=e.status==="empfohlen"&&e.recommended_size?`<div class="ergebnis">
            <div class="kreis" aria-hidden="true">${o(e.recommended_size)}</div>
            <div><strong>Gr\xF6\xDFe ${o(e.recommended_size)}</strong><span class="leise">Sicherheit: ${x(e.confidence)}</span></div>
          </div>
          ${e.alternative_size?`<p>Sie liegen zwischen zwei Gr\xF6\xDFen. ${o(e.alternative_size)} passt fast genauso gut.</p>`:""}
          ${e.begrenzt_durch_schnitt?'<p class="leise">Dieser Artikel ist anders geschnitten als Ihre Wahl. Wir haben die Empfehlung daran angepasst.</p>':""}`:e.status==="keine_passende_groesse"?"<p>Leider passt Ihnen keine der verf\xFCgbaren Gr\xF6\xDFen gut genug. Bitte nutzen Sie die Gr\xF6\xDFentabelle des Shops.</p>":"<p>F\xFCr Ihre Ma\xDFe k\xF6nnen wir bei diesem Artikel keine sichere Gr\xF6\xDFe empfehlen. Bitte nutzen Sie die Gr\xF6\xDFentabelle des Shops.</p>",i=this.token?`${this.meldung?`<p class="karte" role="status">${o(this.meldung)}</p>`:'<p class="leise">Ihre Ma\xDFe sind gespeichert.</p>'}
         ${this.meinLink()}
         <button type="button" class="link" data-aktion="abmelden">Abmelden</button>`:'<button type="button" class="sekundaer" data-aktion="speichern">Ma\xDFe f\xFCr den n\xE4chsten Einkauf speichern</button>';return`<h2 id="ox-titel" tabindex="-1">Ihre Empfehlung</h2>
      ${t}
      <form novalidate data-formular="ergebnis">${this.htmlPassform()}</form>
      ${this.rechnet?'<p class="leise">Wird neu berechnet \u2026</p>':""}
      <button type="button" class="primaer" data-aktion="schliessen">Fertig</button>
      <button type="button" class="sekundaer" data-aktion="masse-aendern">Ma\xDFe \xE4ndern</button>
      ${i}`}htmlSpeichern(){let e=this.feldFehler;return`<h2 id="ox-titel" tabindex="-1">Ma\xDFe speichern</h2>
      <span class="entwurf">Entwurf \xB7 Text wird noch rechtlich gepr\xFCft</span>
      <p>Mit einem Profil m\xFCssen Sie beim n\xE4chsten Einkauf nicht neu messen \u2013 auch in anderen Shops mit Ommetryx. Sie melden sich ohne Passwort an: Wir schicken Ihnen einen Code per E-Mail.</p>
      <form novalidate data-formular="speichern">
        <div class="karte">
          <label class="wahl">
            <input type="checkbox" name="profil-einwilligung" ${this.profilEinwilligung?"checked":""} ${e.profil?'aria-invalid="true" aria-describedby="ox-profil-fehler"':""} />
            <span>${o(u.profil.text)}</span>
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
      <button type="button" class="sekundaer" data-aktion="masse-aendern">Zur\xFCck</button>`}htmlCode(){let e=this.feldFehler;return`<h2 id="ox-titel" tabindex="-1">Code eingeben</h2>
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
      <button type="button" class="link" data-aktion="andere-email">Andere E-Mail-Adresse verwenden</button>`}},$=new b;window.OmmetryxWidget={oeffnen:a=>$.oeffnen(a)};})();
