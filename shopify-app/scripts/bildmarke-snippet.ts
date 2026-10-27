// Erzeugt extensions/ommetryx-widget/snippets/ox-bildmarke.liquid (farbige Bildmarke im Shop-Button) aus den Logo-Ebenen.
// Aufruf: npx tsx scripts/bildmarke-snippet.ts
import { writeFileSync } from "node:fs";
import { STUFEN } from "../widget/src/logo";
const img = (d: string) => `<img alt="" src="{{ '${d}' | asset_url }}" style="position:absolute;inset:0;display:block;width:100%;height:100%;max-width:none">`;
const teile = STUFEN.flat().map((e) => {
  if (!e.maske) return `    <span style="position:absolute;inset:${e.inset}">${img(e.datei)}</span>`;
  const m = e.maske;
  const u = `url('{{ '${m.datei}' | asset_url }}')`;
  return `    <span style="position:absolute;inset:${e.inset};mask-image:${u};-webkit-mask-image:${u};mask-position:${m.position};-webkit-mask-position:${m.position};mask-size:${m.groesse};-webkit-mask-size:${m.groesse};mask-repeat:no-repeat;-webkit-mask-repeat:no-repeat"><span style="position:absolute;inset:${m.innen}">${img(e.datei)}</span></span>`;
});
const inhalt = `{%- comment -%}
  Farbige Ommetryx-Bildmarke (Figma „DS Logo-Bildmarke“ 50:52) für den Button, Höhe 16 px.
  Erzeugt mit scripts/bildmarke-snippet.ts aus widget/src/logo.ts (gleiche Ebenen, Masken und Maße wie im Widget) – nicht von Hand ändern.
{%- endcomment -%}
<span aria-hidden="true" style="display:inline-block;position:relative;width:23px;height:16px;flex:none">
  <span style="position:absolute;left:0;top:0;width:171px;height:119px;transform:scale(0.13445);transform-origin:top left">
${teile.join("\n")}
  </span>
</span>
`;
writeFileSync(new URL("../extensions/ommetryx-widget/snippets/ox-bildmarke.liquid", import.meta.url), inhalt);
