// Espeja com.tandil.estacionamiento.lineas.dto.

export interface LineaRespuesta {
  id: number;
  numero: number;
  nombre: string;
  color: string;
}

export interface LineaSolicitud {
  numero: number;
  nombre: string;
  color: string;
}

// El numero no se puede cambiar: es el identificador natural de la linea.
export interface LineaActualizacionSolicitud {
  nombre: string;
  color: string;
}
