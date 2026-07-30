import { expect, test } from "@playwright/test";
import { entrarModoDemo } from "./ayudantes.js";

test.describe("Flujo ADMINISTRADOR (modo demo)", () => {
  test("transferir la titularidad de un vehiculo muestra un toast", async ({ page }) => {
    await entrarModoDemo(page, "Administrador");
    await expect(page).toHaveURL(/\/admin$/);

    await page.getByLabel("Patente").fill("DEMO001");
    await page.getByLabel("Nuevo usuario").fill("otro-e2e");
    await page.getByRole("button", { name: "Transferir" }).click();

    await expect(page.getByText("transferido a otro-e2e")).toBeVisible();
  });

  test("la tabla de todas las sesiones pagina", async ({ page }) => {
    await entrarModoDemo(page, "Administrador");

    await expect(page.getByText("Página 1 de")).toBeVisible();
    await page.getByRole("button", { name: "Siguiente →" }).click();
    await expect(page.getByText("Página 2 de")).toBeVisible();
  });
});
