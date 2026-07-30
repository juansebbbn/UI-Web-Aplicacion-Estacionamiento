import { cliente } from "./cliente";
import type { Coordenada } from "../tipos/comun";
import type { VerificacionZonaRespuesta, ZonaRespuesta } from "../tipos/zona";

export async function listarZonas(): Promise<ZonaRespuesta[]> {
  const respuesta = await cliente.get<ZonaRespuesta[]>("/zonas");
  return respuesta.data;
}

export async function verificarCoordenada(coordenada: Coordenada): Promise<VerificacionZonaRespuesta> {
  const respuesta = await cliente.post<VerificacionZonaRespuesta>("/zonas/verificacion", coordenada);
  return respuesta.data;
}
