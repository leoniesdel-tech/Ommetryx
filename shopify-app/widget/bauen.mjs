// Baut das Widget (widget/src) zu einer Datei in der Theme App Extension
// und die Schrift-Datei (Sora, eingebettet in CSS – Theme-Erweiterungen erlauben keine .woff2-Dateien).
// Aufruf: npm run widget:bauen   (mit --beobachten: baut bei jeder Änderung neu)

import { build, context } from "esbuild";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";

const ASSETS = "extensions/ommetryx-widget/assets";
const ziel = `${ASSETS}/ommetryx-widget.js`;
const schrift = `${ASSETS}/ommetryx-schrift.css`;
const optionen = {
  entryPoints: ["widget/src/widget.ts"],
  outfile: ziel,
  bundle: true,
  minify: true,
  format: "iife",
  target: ["es2019", "safari13"],
  legalComments: "none",
  logLevel: "warning",
};

/** Sora (SIL OFL 1.1, siehe widget/schrift/LIZENZ.txt) als @font-face mit eingebetteter WOFF2-Datei. */
function baueSchrift() {
  const daten = readFileSync("widget/schrift/sora-latin.woff2").toString("base64");
  const css =
    `/* Sora – Copyright 2019 The Sora Project Authors – SIL Open Font License 1.1 */\n` +
    `@font-face{font-family:"Ommetryx Sora";src:url(data:font/woff2;base64,${daten}) format("woff2");font-weight:100 800;font-display:swap;` +
    `unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212;}\n`;
  writeFileSync(schrift, css);
}

function groessen() {
  for (const datei of [ziel, `${ASSETS}/ommetryx-lader.js`, schrift]) {
    const kb = statSync(datei).size / 1024;
    const gz = gzipSync(readFileSync(datei)).length / 1024;
    console.log(`${datei}: ${kb.toFixed(1)} KB (gzip ${gz.toFixed(1)} KB)`);
  }
}

baueSchrift();
if (process.argv.includes("--beobachten")) {
  const ctx = await context(optionen);
  await ctx.watch();
  console.log("Widget wird bei Änderungen neu gebaut …");
} else {
  await build(optionen);
  groessen();
}
