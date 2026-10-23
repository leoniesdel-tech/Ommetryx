// Baut das Widget (widget/src) zu einer Datei in der Theme App Extension.
// Aufruf: npm run widget:bauen   (mit --beobachten: baut bei jeder Änderung neu)

import { build, context } from "esbuild";
import { statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";

const ziel = "extensions/ommetryx-widget/assets/ommetryx-widget.js";
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

function groessen() {
  for (const datei of [ziel, "extensions/ommetryx-widget/assets/ommetryx-lader.js"]) {
    const kb = statSync(datei).size / 1024;
    const gz = gzipSync(readFileSync(datei)).length / 1024;
    console.log(`${datei}: ${kb.toFixed(1)} KB (gzip ${gz.toFixed(1)} KB)`);
  }
}

if (process.argv.includes("--beobachten")) {
  const ctx = await context(optionen);
  await ctx.watch();
  console.log("Widget wird bei Änderungen neu gebaut …");
} else {
  await build(optionen);
  groessen();
}
