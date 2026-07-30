import { expect, test } from "@playwright/test";
import { entrarModoDemo } from "./ayudantes.js";

test.describe("Flujo INSPECTOR (modo demo)", () => {
  test("una patente generica tiene sesion activa", async ({ page }) => {
    await entrarModoDemo(page, "Inspector");
    await expect(page).toHaveURL(/\/inspeccion$/);

    await page.getByPlaceholder("Patente").fill("XYZ999");
    await page.getByRole("button", { name: "Consultar" }).click();

    await expect(page.getByText("tiene una sesión activa")).toBeVisible();
  });

  test('la patente "LIBRE" no tiene sesion activa (regla del fixture demo)', async ({ page }) => {
    await entrarModoDemo(page, "Inspector");

    await page.getByPlaceholder("Patente").fill("libre");
    await page.getByRole("button", { name: "Consultar" }).click();

    await expect(page.getByText("no tiene una sesión activa")).toBeVisible();
  });
});
