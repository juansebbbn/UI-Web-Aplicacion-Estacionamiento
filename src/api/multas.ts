import { cliente } from "./cliente";
import type { Pagina } from "../tipos/comun";
import type { MultaAdminRespuesta, MultaAltaSolicitud, MultaRespuesta } from "../tipos/multa";

export async function listarMultasPropias(): Promise<MultaRespuesta[]> {
  const respuesta = await cliente.get<MultaRespuesta[]>("/multas");
  return respuesta.data;
}

export async function pagarMulta(id: number): Promise<MultaRespuesta> {
  const respuesta = await cliente.post<MultaRespuesta>(`/multas/${id}/pagar`);
  return respuesta.data;
}

// Las siguientes, solo INSPECTOR.

export async function crearMultaAdmin(datos: MultaAltaSolicitud): Promise<MultaAdminRespuesta> {
  const respuesta = await cliente.post<MultaAdminRespuesta>("/multas/admin", datos);
  return respuesta.data;
}

export interface ParametrosBusquedaMultas {
  patente?: string;
  username?: string;
  // true = solo patentes con vehiculo registrado, false = solo sin registrar, sin indicar = todas.
  registrado?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

// Sin filtros, lista todas las multas paginadas.
export async function buscarMultasAdmin(
  parametros: ParametrosBusquedaMultas = {},
): Promise<Pagina<MultaAdminRespuesta>> {
  const respuesta = await cliente.get<Pagina<MultaAdminRespuesta>>("/multas/admin", { params: parametros });
  return respuesta.data;
}

export async function revocarMultaAdmin(id: number): Promise<MultaAdminRespuesta> {
  const respuesta = await cliente.put<MultaAdminRespuesta>(`/multas/admin/${id}/revocar`);
  return respuesta.data;
}
