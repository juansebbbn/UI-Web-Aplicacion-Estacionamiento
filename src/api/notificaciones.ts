import { cliente } from "./cliente";
import type { NotificacionRespuesta } from "../tipos/notificacion";

export async function listarNotificacionesPropias(): Promise<NotificacionRespuesta[]> {
  const respuesta = await cliente.get<NotificacionRespuesta[]>("/notificaciones");
  return respuesta.data;
}

export async function marcarNotificacionesLeidas(): Promise<void> {
  await cliente.post("/notificaciones/marcar-leidas");
}

export async function eliminarNotificacion(id: number): Promise<void> {
  await cliente.delete(`/notificaciones/${id}`);
}
