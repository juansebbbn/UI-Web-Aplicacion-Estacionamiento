import { cliente } from "./cliente";
import type { UsuarioRespuesta } from "../tipos/usuario";

export async function obtenerPerfilPropio(): Promise<UsuarioRespuesta> {
  const respuesta = await cliente.get<UsuarioRespuesta>("/usuarios/yo");
  return respuesta.data;
}
