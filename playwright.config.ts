import { defineConfig, devices } from "@playwright/test";

// Corre contra `npm run dev`: el modo demo (ver src/api/modoDemo.ts) solo
// existe en import.meta.env.DEV, y es justamente lo que estos tests
// necesitan para no depender de un backend/MySQL levantado.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev -- --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
