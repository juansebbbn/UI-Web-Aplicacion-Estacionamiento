import { expect, test } from "@playwright/test";
import { entrarModoDemo } from "./ayudantes.js";

// La verificacion de zona en modo demo siempre da positivo (ver
// fixturesDemo.ts), asi que la coordenada exacta de la geolocalizacion no
// importa para que el test pase — se usa una real solo para que el mapa se
// vea razonable si se corre con --headed.
test.use({ geolocation: { latitude: -37.3286, longitude: -59.137 }, permissions: ["geolocation"] });

test.describe("Flujo USUARIO (modo demo)", () => {
  test("ver saldo y mapa de zonas en el dashboard", async ({ page }) => {
    await entrarModoDemo(page, "Usuario");

    await expect(page).toHaveURL(/\/estacionamiento$/);
    await expect(page.getByText("Saldo", { exact: true })).toBeVisible();
    await expect(page.locator(".leaflet-container")).toBeVisible();
  });

  test("alta y baja de vehiculo, con toasts de confirmacion", async ({ page }) => {
    await entrarModoDemo(page, "Usuario");
    await page.getByRole("link", { name: "Vehículos" }).click();
    await expect(page).toHaveURL(/\/vehiculos$/);

    await page.getByLabel("Patente").fill("E2E1234");
    await page
      .getByLabel("Tarjeta verde o azul")
      .setInputFiles({ name: "tarjeta.jpg", mimeType: "image/jpeg", buffer: Buffer.from("tarjeta") });
    await page
      .getByLabel("DNI")
      .setInputFiles({ name: "dni.jpg", mimeType: "image/jpeg", buffer: Buffer.from("dni") });
    await page
      .getByLabel("Foto delantera del auto")
      .setInputFiles({ name: "auto.jpg", mimeType: "image/jpeg", buffer: Buffer.from("auto") });
    await page.getByRole("button", { name: "Agregar vehículo" }).click();

    await expect(page.getByText("Vehículo E2E1234 agregado.")).toBeVisible();
    const itemVehiculo = page.getByRole("listitem").filter({ hasText: "E2E1234" });
    await expect(itemVehiculo).toContainText("Auto");

    await itemVehiculo.getByRole("button", { name: "Eliminar" }).click();

    await expect(page.getByText("Vehículo E2E1234 eliminado.")).toBeVisible();
  });

  test("iniciar y finalizar una sesion muestra cronometro, toasts e historial", async ({ page }) => {
    await entrarModoDemo(page, "Usuario");

    await page.getByLabel("Vehículo").selectOption("DEMO001");
    await page.getByRole("button", { name: "Usar mi ubicación" }).click();
    await expect(page.getByText(/Dentro de la zona/)).toBeVisible();

    await page.getByRole("button", { name: "Estacionar acá" }).click();
    await expect(page.getByText("Sesión de estacionamiento iniciada.")).toBeVisible();
    await expect(page.getByText("Activa", { exact: true })).toBeVisible();
    // Cronometro en formato mm:ss, actualizandose en vivo.
    await expect(page.getByText(/^\d{2}:\d{2}$/)).toBeVisible();
    await expect(page.getByText("Costo estimado")).toBeVisible();

    await page.getByRole("button", { name: "Finalizar sesión" }).click();
    await expect(page.getByText(/Sesión de DEMO001 finalizada\. Se cobraron/)).toBeVisible();

    await page.getByRole("link", { name: "Historial" }).click();
    await expect(page.getByRole("cell", { name: "DEMO001" }).first()).toBeVisible();
  });
});
