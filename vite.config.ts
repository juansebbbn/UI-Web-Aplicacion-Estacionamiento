import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    // jsdom no expone localStorage bajo el origen "about:blank" por defecto.
    environmentOptions: { jsdom: { url: "http://localhost" } },
    setupFiles: ["./src/test/configuracion.ts"],
    // e2e/ son specs de Playwright (otro test runner, ver playwright.config.ts),
    // no de Vitest: si no se excluye, Vitest los intenta correr igual y fallan
    // porque usan el `test`/`expect` de @playwright/test, no los de Vitest.
    exclude: ["**/node_modules/**", "**/e2e/**"],
  },
});
