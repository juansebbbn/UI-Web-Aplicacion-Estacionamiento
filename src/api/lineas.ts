import { cliente } from "./cliente";
import type { LineaActualizacionSolicitud, LineaRespuesta, LineaSolicitud } from "../tipos/linea";

export async function listarLineas(): Promise<LineaRespuesta[]> {
  const respuesta = await cliente.get<LineaRespuesta[]>("/lineas");
  return respuesta.data;
}

// Las siguientes tres, solo ADMINISTRADOR.
export async function crearLinea(datos: LineaSolicitud): Promise<LineaRespuesta> {
  const respuesta = await cliente.post<LineaRespuesta>("/lineas", datos);
  return respuesta.data;
}

export async function actualizarLinea(id: number, datos: LineaActualizacionSolicitud): Promise<LineaRespuesta> {
  const respuesta = await cliente.put<LineaRespuesta>(`/lineas/${id}`, datos);
  return respuesta.data;
}

export async function eliminarLinea(id: number): Promise<void> {
  await cliente.delete(`/lineas/${id}`);
}
