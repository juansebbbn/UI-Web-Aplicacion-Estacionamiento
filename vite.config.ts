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
  },
});
