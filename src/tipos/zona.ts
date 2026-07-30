// Espeja com.tandil.estacionamiento.zonas.dto.
import type { Coordenada } from "./comun";

export interface ZonaRespuesta {
  id: number;
  nombre: string;
  tarifaPorMinuto: number;
  vertices: Coordenada[];
}

export interface VerificacionZonaRespuesta {
  dentroDeZona: boolean;
  zonaId: number | null;
  nombreZona: string | null;
}
