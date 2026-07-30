import { expect, test } from "@playwright/test";
import { entrarModoDemo } from "./ayudantes.js";

// El rol INSPECTOR se eliminó: esta potestad (consultar si una patente tiene
// sesión activa) ahora es de ADMINISTRADOR, alcanzable desde la nav en vez
// de ser la landing propia de un rol dedicado.
test.describe("Flujo de inspección de patente (rol ADMINISTRADOR, modo demo)", () => {
  test("una patente generica tiene sesion activa", async ({ page }) => {
    await entrarModoDemo(page, "Administrador");
    await page.getByRole("link", { name: "Inspección" }).click();
    await expect(page).toHaveURL(/\/inspeccion$/);

    await page.getByPlaceholder("Patente").fill("XYZ999");
    await page.getByRole("button", { name: "Consultar" }).click();

    await expect(page.getByText("Sesión activa")).toBeVisible();
  });

  test('la patente "LIBRE" no tiene sesion activa (regla del fixture demo)', async ({ page }) => {
    await entrarModoDemo(page, "Administrador");
    await page.getByRole("link", { name: "Inspección" }).click();

    await page.getByPlaceholder("Patente").fill("libre");
    await page.getByRole("button", { name: "Consultar" }).click();

    await expect(page.getByText("Sin sesión activa")).toBeVisible();
  });
});
