// Eigene Test-Konfiguration, damit Vitest nicht das React-Router-Plugin aus vite.config.ts lädt.
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    // Tests mit Datenbank laufen nacheinander.
    fileParallelism: false,
  },
});
