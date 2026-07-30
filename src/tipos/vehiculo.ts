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

export interface TransferenciaTitularidadSolicitud {
  nuevoUsuarioUsername: string;
}
