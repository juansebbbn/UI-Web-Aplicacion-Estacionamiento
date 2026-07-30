import { cliente } from "./cliente";
import type {
  TransferenciaTitularidadSolicitud,
  VehiculoAltaSolicitud,
  VehiculoRespuesta,
} from "../tipos/vehiculo";

export async function listarVehiculosPropios(): Promise<VehiculoRespuesta[]> {
  const respuesta = await cliente.get<VehiculoRespuesta[]>("/vehiculos");
  return respuesta.data;
}

export async function darDeAltaVehiculo(datos: VehiculoAltaSolicitud): Promise<VehiculoRespuesta> {
  const respuesta = await cliente.post<VehiculoRespuesta>("/vehiculos", datos);
  return respuesta.data;
}

export async function eliminarVehiculo(patente: string): Promise<void> {
  await cliente.delete(`/vehiculos/${patente}`);
}

// Solo ADMINISTRADOR.
export async function transferirTitularidad(
  patente: string,
  datos: TransferenciaTitularidadSolicitud,
): Promise<VehiculoRespuesta> {
  const respuesta = await cliente.put<VehiculoRespuesta>(`/vehiculos/${patente}/titularidad`, datos);
  return respuesta.data;
}
