import { cliente } from "./cliente";
import { guardarSesion, limpiarSesion, leerSesion } from "./almacenTokens";
import type { LoginSolicitud, RegistroSolicitud, TokenRespuesta } from "../tipos/autenticacion";

export async function registrarse(datos: RegistroSolicitud): Promise<TokenRespuesta> {
  const respuesta = await cliente.post<TokenRespuesta>("/auth/registro", datos);
  guardarSesion(respuesta.data);
  return respuesta.data;
}

export async function iniciarSesion(datos: LoginSolicitud): Promise<TokenRespuesta> {
  const respuesta = await cliente.post<TokenRespuesta>("/auth/login", datos);
  guardarSesion(respuesta.data);
  return respuesta.data;
}

export async function cerrarSesion(): Promise<void> {
  const sesion = leerSesion();
  if (sesion?.refreshToken) {
    // Best-effort: si falla (red caida, token ya vencido) igual limpiamos
    // la sesion local, que es lo que le importa al usuario.
    await cliente.post("/auth/logout", { refreshToken: sesion.refreshToken }).catch(() => undefined);
  }
  limpiarSesion();
}
