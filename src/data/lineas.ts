import type { Coordenada } from "../tipos/comun";

export interface LineaColectivo {
  // Identificador natural: no hay id de base de datos, esto vive
  // completamente en el front (ver PROGRESO.md — a pedido del usuario,
  // se eliminó el módulo "lineas" del backend por completo).
  numero: number;
  nombre: string;
  color: string;
  // Opcional: no todas las líneas necesitan tener un recorrido cargado.
  recorrido?: Coordenada[];
}

// Líneas de colectivo de Tandil, hardcodeadas en el frontend: no hay
// endpoint de backend para esto (se borró junto con el resto del módulo
// "lineas" — controlador, servicio, repositorio, entidad y la tabla de
// base de datos), así que agregar o editar una línea es directamente
// editar este archivo.
//
// IMPORTANTE — los `recorrido` son coordenadas ILUSTRATIVAS armadas a mano
// cerca del centro de Tandil para poder mostrar la funcionalidad en el
// mapa. No son un relevamiento real de los recorridos: reemplazar por
// trazas GPS reales cuando existan.
export const LINEAS_COLECTIVO: LineaColectivo[] = [
  {
    numero: 500,
    nombre: "Terminal — Hospital",
    color: "#1a5fb4",
    recorrido: [
      { latitud: -37.341, longitud: -59.152 },
      { latitud: -37.336, longitud: -59.146 },
      { latitud: -37.329, longitud: -59.139 },
      { latitud: -37.3217, longitud: -59.1332 },
      { latitud: -37.314, longitud: -59.128 },
      { latitud: -37.308, longitud: -59.123 },
    ],
  },
  {
    numero: 501,
    nombre: "Barrio Movediza — Centro",
    color: "#2ec27e",
    recorrido: [
      { latitud: -37.333, longitud: -59.175 },
      { latitud: -37.33, longitud: -59.16 },
      { latitud: -37.326, longitud: -59.145 },
      { latitud: -37.3217, longitud: -59.1332 },
    ],
  },
];
