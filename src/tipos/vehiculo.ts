// Espeja com.tandil.estacionamiento.vehiculos.

export type TipoVehiculo = "AUTO" | "MOTO";

export interface VehiculoRespuesta {
  id: number;
  patente: string;
  tipo: TipoVehiculo;
}

export interface VehiculoAltaSolicitud {
  patente: string;
  tipo: TipoVehiculo;
}

// Documentacion de respaldo pedida al agregar un vehiculo (tarjeta verde o
// azul, DNI, foto del frente del auto). El backend por ahora no la procesa
// ni la persiste — ver VehiculoControlador.subirDocumentacion — pero igual
// hay que enviarla para completar el alta.
export interface VehiculoDocumentacion {
  tarjetaVehiculo: File;
  dni: File;
  fotoFrente: File;
}

export interface TransferenciaTitularidadSolicitud {
  nuevoUsuarioUsername: string;
}
