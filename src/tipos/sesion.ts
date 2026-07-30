// Espeja com.tandil.estacionamiento.sesiones.dto.
// horaInicio/horaFin llegan como LocalDateTime serializado (string ISO sin offset).
import type { Coordenada } from "./comun";

export type EstadoSesion = "ACTIVA" | "FINALIZADA";

export interface SesionRespuesta {
  id: number;
  patente: string;
  nombreZona: string;
  coordenada: Coordenada;
  horaInicio: string;
  horaFin: string | null;
  estado: EstadoSesion;
  montoCobrado: number | null;
}

export interface IniciarSesionSolicitud {
  patente: string;
  coordenada: Coordenada;
}

export interface InspeccionRespuesta {
  patente: string;
  tieneSesionActiva: boolean;
  horaInicio: string | null;
}
