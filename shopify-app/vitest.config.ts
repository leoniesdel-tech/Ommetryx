// Eigene Test-Konfiguration, damit Vitest nicht das React-Router-Plugin aus vite.config.ts lädt.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // Tests mit Datenbank laufen nacheinander.
    fileParallelism: false,
    // Erfundene Shopify-Werte, damit shopify.server.ts in Tests startet und Signaturen prüfbar sind.
    env: {
      SHOPIFY_API_KEY: "test-api-key",
      SHOPIFY_API_SECRET: "test-api-secret",
      SHOPIFY_APP_URL: "https://ommetryx-test.example",
      SCOPES: "write_products,write_app_proxy",
    },
  },
});
