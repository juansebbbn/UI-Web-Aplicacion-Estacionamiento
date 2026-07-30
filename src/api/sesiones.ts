import { cliente } from "./cliente";
import type { Pagina } from "../tipos/comun";
import type { EstadoSesion, IniciarSesionSolicitud, InspeccionRespuesta, SesionRespuesta } from "../tipos/sesion";

export async function iniciarSesionEstacionamiento(datos: IniciarSesionSolicitud): Promise<SesionRespuesta> {
  const respuesta = await cliente.post<SesionRespuesta>("/sesiones", datos);
  return respuesta.data;
}

export async function finalizarSesionEstacionamiento(id: number): Promise<SesionRespuesta> {
  const respuesta = await cliente.post<SesionRespuesta>(`/sesiones/${id}/finalizar`);
  return respuesta.data;
}

export async function listarSesionesPropias(): Promise<SesionRespuesta[]> {
  const respuesta = await cliente.get<SesionRespuesta[]>("/sesiones");
  return respuesta.data;
}

// Solo ADMINISTRADOR (el rol INSPECTOR se eliminó, ver PROGRESO.md).
export async function inspeccionarPatente(patente: string): Promise<InspeccionRespuesta> {
  const respuesta = await cliente.get<InspeccionRespuesta>(`/sesiones/inspeccion/${patente}`);
  return respuesta.data;
}

export interface ParametrosPaginacion {
  page?: number;
  size?: number;
  sort?: string;
  estado?: EstadoSesion;
}

// Solo ADMINISTRADOR.
export async function listarTodasLasSesiones(
  parametros: ParametrosPaginacion = {},
): Promise<Pagina<SesionRespuesta>> {
  const respuesta = await cliente.get<Pagina<SesionRespuesta>>("/sesiones/admin", { params: parametros });
  return respuesta.data;
}
