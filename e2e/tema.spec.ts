import { expect, test } from "@playwright/test";
import { entrarModoDemo } from "./ayudantes.js";

// El conmutador de tema es un segmented control de 3 opciones (sistema/claro/
// oscuro, ver ConmutadorTema.tsx): cada una es un boton role="radio" cuyo
// nombre accesible sale del atributo title (no hay texto visible, son iconos).
test.describe("Conmutador de tema", () => {
  test("selecciona sistema/claro/oscuro y persiste tras recargar", async ({ page }) => {
    await entrarModoDemo(page, "Usuario");

    const botonSistema = page.getByRole("radio", { name: "Tema: Sistema" });
    const botonClaro = page.getByRole("radio", { name: "Tema: Claro" });
    const botonOscuro = page.getByRole("radio", { name: "Tema: Oscuro" });

    await expect(botonSistema).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");

    await botonClaro.click();
    await expect(botonClaro).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    await botonOscuro.click();
    await expect(botonOscuro).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

    // Persiste en localStorage y sobrevive una recarga completa de pagina.
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(page.getByRole("radio", { name: "Tema: Oscuro" })).toHaveAttribute("aria-checked", "true");

    await page.getByRole("radio", { name: "Tema: Sistema" }).click();
    await expect(page.locator("html")).not.toHaveAttribute("data-theme");
  });
});
