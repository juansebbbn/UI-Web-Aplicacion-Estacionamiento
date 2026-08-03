// Espeja com.tandil.estacionamiento.reclamos.MotivoReclamo.
export type MotivoReclamo = "COBRO" | "ZONA" | "APP" | "OTRO";

export const ETIQUETA_MOTIVO_RECLAMO: Record<MotivoReclamo, string> = {
  COBRO: "Cobro incorrecto",
  ZONA: "Zona / señalización",
  APP: "Problema con la app",
  OTRO: "Otro",
};

// Espeja com.tandil.estacionamiento.reclamos.dto.ReclamoAltaSolicitud.
export interface ReclamoAltaSolicitud {
  motivo: MotivoReclamo;
  descripcion: string;
}

// Espeja com.tandil.estacionamiento.reclamos.dto.ReclamoRespuesta.
export interface ReclamoRespuesta {
  id: number;
  motivo: MotivoReclamo;
  descripcion: string;
  fechaCreacion: string;
  revisado: boolean;
  respuesta: string | null;
}

// Espeja com.tandil.estacionamiento.reclamos.dto.ReclamoAdminRespuesta.
export interface ReclamoAdminRespuesta {
  id: number;
  username: string;
  motivo: MotivoReclamo;
  descripcion: string;
  fechaCreacion: string;
  revisado: boolean;
  respuesta: string | null;
}

// Espeja com.tandil.estacionamiento.reclamos.dto.ReclamoRevisarSolicitud.
export interface ReclamoRevisarSolicitud {
  respuesta: string;
}
