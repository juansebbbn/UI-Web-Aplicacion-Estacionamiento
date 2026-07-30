import { cliente } from "./cliente";
import type { AjusteSaldoSolicitud, UsuarioAdminRespuesta, UsuarioRespuesta } from "../tipos/usuario";

export async function obtenerPerfilPropio(): Promise<UsuarioRespuesta> {
  const respuesta = await cliente.get<UsuarioRespuesta>("/usuarios/yo");
  return respuesta.data;
}

// Las siguientes dos, solo ADMINISTRADOR.
export async function listarUsuariosAdmin(): Promise<UsuarioAdminRespuesta[]> {
  const respuesta = await cliente.get<UsuarioAdminRespuesta[]>("/usuarios/admin");
  return respuesta.data;
}

export async function ajustarSaldo(id: number, datos: AjusteSaldoSolicitud): Promise<UsuarioRespuesta> {
  const respuesta = await cliente.put<UsuarioRespuesta>(`/usuarios/admin/${id}/saldo`, datos);
  return respuesta.data;
}
