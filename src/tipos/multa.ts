// Espeja com.tandil.estacionamiento.multas.dto.MultaRespuesta.
export interface MultaRespuesta {
  id: number;
  precio: number;
  fecha: string;
  fuePagada: boolean;
  fechaPago: string | null;
  revocada: boolean;
  razon: string;
  patente: string;
}

// Espeja com.tandil.estacionamiento.multas.dto.MultaAdminRespuesta.
// username es null cuando la patente todavia no tiene un vehiculo
// registrado (ver MultaServicio.crear).
export interface MultaAdminRespuesta extends MultaRespuesta {
  username: string | null;
  vehiculoRegistrado: boolean;
}

// Espeja com.tandil.estacionamiento.multas.dto.MultaAltaSolicitud.
// Solo hace falta la patente: si esta registrada se vincula el vehiculo (y
// su dueño) automaticamente, si no, la multa queda "huerfana" hasta que
// alguien registre esa patente.
export interface MultaAltaSolicitud {
  patente: string;
  precio: number;
  razon: string;
}
