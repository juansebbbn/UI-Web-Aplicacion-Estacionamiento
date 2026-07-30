import { describe, expect, it } from "vitest";
import { AxiosError, AxiosHeaders } from "axios";
import { obtenerMensajeError } from "./errores";
import type { ProblemaHttp } from "../tipos/problema";

function crearAxiosError(status: number, data: ProblemaHttp): AxiosError<ProblemaHttp> {
  return new AxiosError(
    "Request failed",
    String(status),
    undefined,
    undefined,
    {
      status,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
      data,
    },
  );
}

describe("obtenerMensajeError", () => {
  it("prioriza la lista de errores de validacion", () => {
    const error = crearAxiosError(400, {
      detail: "Uno o mas campos no son validos.",
      errores: ["password: debe tener al menos 8 caracteres"],
    });

    expect(obtenerMensajeError(error)).toBe("password: debe tener al menos 8 caracteres");
  });

  it("usa detail cuando no hay lista de errores", () => {
    const error = crearAxiosError(402, { detail: "Saldo insuficiente para iniciar la sesion." });

    expect(obtenerMensajeError(error)).toBe("Saldo insuficiente para iniciar la sesion.");
  });

  it("devuelve un mensaje generico para errores que no son de Axios", () => {
    expect(obtenerMensajeError("algo raro")).toBe("Ocurrio un error inesperado.");
  });

  it("usa el mensaje del Error cuando no es un AxiosError", () => {
    expect(obtenerMensajeError(new Error("fallo de red"))).toBe("fallo de red");
  });
});
