import { expect, test } from "@playwright/test";
import { entrarModoDemo } from "./ayudantes.js";

test.describe("Conmutador de tema", () => {
  test("cicla sistema -> claro -> oscuro -> sistema y persiste tras recargar", async ({ page }) => {
    await entrarModoDemo(page, "Usuario");

    const boton = page.getByRole("button", { name: /^Tema:/ });
    await expect(boton).toHaveText("Tema: Sistema");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");

    await boton.click();
    await expect(boton).toHaveText("Tema: Claro");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await boton.click();
    await expect(boton).toHaveText("Tema: Oscuro");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    // Persiste en localStorage y sobrevive una recarga completa de pagina.
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    await boton.click();
    await expect(boton).toHaveText("Tema: Sistema");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  });
});
