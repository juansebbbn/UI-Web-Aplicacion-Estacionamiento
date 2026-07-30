import axios from "axios";
import type { ProblemaHttp } from "../tipos/problema";

// Traduce un error de Axios (application/problem+json, RFC 7807) a un mensaje
// legible para mostrar en la UI. Prioriza "errores" (validacion, 400) sobre
// "detail" porque trae el detalle campo por campo.
export function obtenerMensajeError(error: unknown): string {
  if (axios.isAxiosError<ProblemaHttp>(error)) {
    const problema = error.response?.data;
    if (problema?.errores?.length) {
      return problema.errores.join(" — ");
    }
    if (problema?.detail) {
      return problema.detail;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Ocurrio un error inesperado.";
}
