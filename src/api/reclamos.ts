import { cliente } from "./cliente";
import type { Pagina } from "../tipos/comun";
import type {
  ReclamoAdminRespuesta,
  ReclamoAltaSolicitud,
  ReclamoRespuesta,
  ReclamoRevisarSolicitud,
} from "../tipos/reclamo";

export async function crearReclamo(datos: ReclamoAltaSolicitud): Promise<ReclamoRespuesta> {
  const respuesta = await cliente.post<ReclamoRespuesta>("/reclamos", datos);
  return respuesta.data;
}

export async function listarReclamosPropios(): Promise<ReclamoRespuesta[]> {
  const respuesta = await cliente.get<ReclamoRespuesta[]>("/reclamos");
  return respuesta.data;
}

export async function eliminarReclamo(id: number): Promise<void> {
  await cliente.delete(`/reclamos/${id}`);
}

export interface ParametrosPaginacionReclamos {
  page?: number;
  size?: number;
  sort?: string;
}

// Solo ADMINISTRADOR.
export async function listarTodosLosReclamos(
  parametros: ParametrosPaginacionReclamos = {},
): Promise<Pagina<ReclamoAdminRespuesta>> {
  const respuesta = await cliente.get<Pagina<ReclamoAdminRespuesta>>("/reclamos/admin", { params: parametros });
  return respuesta.data;
}

// Las siguientes, solo ADMINISTRADOR/INSPECTOR.

// Marca el reclamo como revisado, guarda "respuesta" en el propio reclamo (la
// ve el dueño en su pagina de Reclamos) y dispara una notificacion generica
// de aviso (sin el texto) para el usuario dueño.
export async function revisarReclamo(id: number, datos: ReclamoRevisarSolicitud): Promise<ReclamoAdminRespuesta> {
  const respuesta = await cliente.put<ReclamoAdminRespuesta>(`/reclamos/admin/${id}/revisar`, datos);
  return respuesta.data;
}

export async function eliminarReclamoAdmin(id: number): Promise<void> {
  await cliente.delete(`/reclamos/admin/${id}`);
}
