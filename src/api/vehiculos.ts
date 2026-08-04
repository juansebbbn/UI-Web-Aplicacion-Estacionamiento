import { cliente } from "./cliente";
import type {
  TransferenciaTitularidadSolicitud,
  VehiculoAltaSolicitud,
  VehiculoDocumentacion,
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

// multipart/form-data: axios arma el boundary solo al pasarle un FormData.
export async function subirDocumentacionVehiculo(
  patente: string,
  documentacion: VehiculoDocumentacion,
): Promise<void> {
  const formulario = new FormData();
  formulario.append("tarjetaVehiculo", documentacion.tarjetaVehiculo);
  formulario.append("dni", documentacion.dni);
  formulario.append("fotoFrente", documentacion.fotoFrente);
  await cliente.post(`/vehiculos/${patente}/documentacion`, formulario);
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
