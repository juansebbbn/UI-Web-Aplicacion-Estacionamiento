import { afterEach, describe, expect, it, vi } from "vitest";
import { guardarSesion, leerSesion, limpiarSesion, suscribirseACambiosDeSesion } from "./almacenTokens";
import type { TokenRespuesta } from "../tipos/autenticacion";

const tokenDeEjemplo: TokenRespuesta = {
  accessToken: "access-123",
  refreshToken: "refresh-456",
  tipoToken: "Bearer",
  expiraEnSegundos: 900,
  username: "juan",
  roles: ["USER"],
};

afterEach(() => {
  localStorage.clear();
});

describe("almacenTokens", () => {
  it("no hay sesion guardada al arrancar", () => {
    expect(leerSesion()).toBeNull();
  });

  it("guarda y relee la sesion con los campos relevantes del token", () => {
    guardarSesion(tokenDeEjemplo);

    expect(leerSesion()).toEqual({
      accessToken: "access-123",
      refreshToken: "refresh-456",
      username: "juan",
      roles: ["USER"],
    });
  });

  it("limpiarSesion borra lo guardado", () => {
    guardarSesion(tokenDeEjemplo);
    limpiarSesion();

    expect(leerSesion()).toBeNull();
  });

  it("notifica a los suscriptores en guardar y en limpiar", () => {
    const callback = vi.fn();
    const desuscribirse = suscribirseACambiosDeSesion(callback);

    guardarSesion(tokenDeEjemplo);
    limpiarSesion();

    expect(callback).toHaveBeenCalledTimes(2);
    desuscribirse();
  });

  it("deja de notificar despues de desuscribirse", () => {
    const callback = vi.fn();
    const desuscribirse = suscribirseACambiosDeSesion(callback);
    desuscribirse();

    guardarSesion(tokenDeEjemplo);

    expect(callback).not.toHaveBeenCalled();
  });
});
