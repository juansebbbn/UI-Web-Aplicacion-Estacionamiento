import type { Page } from "@playwright/test";

export type RolDemo = "Usuario" | "Administrador";

// Entra usando el panel de modo demo de Login.tsx (solo existe en dev, ver
// src/componentes/PanelModoDemo.tsx): sirve datos ficticios sin backend.
export async function entrarModoDemo(page: Page, rol: RolDemo): Promise<void> {
  await page.goto("/login");
  await page.getByRole("button", { name: `Entrar como ${rol}` }).click();
}
