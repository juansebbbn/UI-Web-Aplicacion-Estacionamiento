import type { Coordenada } from "../tipos/comun";

// Recorridos de líneas de colectivo, a pedido del usuario: viven acá (front,
// hardcodeados) en vez de venir del backend, porque LineaRespuesta no trae
// geometría de recorrido y no tiene sentido fetchear esto en cada visita —
// no cambia salvo que alguien edite este archivo.
//
// Clave: `numero` de la línea (identificador natural e inmutable, ver
// tipos/linea.ts), no `id`.
//
// IMPORTANTE — estas coordenadas son ILUSTRATIVAS, armadas a mano cerca del
// centro de Tandil para poder mostrar la funcionalidad. No son un relevamiento
// real de los recorridos: reemplazar por trazas GPS reales de cada línea
// cuando existan. Una línea sin entrada acá simplemente no tiene recorrido
// para mostrar (la UI lo maneja mostrando un aviso, no rompe).
export const RECORRIDOS_LINEAS: Record<number, Coordenada[]> = {
  500: [
    { latitud: -37.341, longitud: -59.152 },
    { latitud: -37.336, longitud: -59.146 },
    { latitud: -37.329, longitud: -59.139 },
    { latitud: -37.3217, longitud: -59.1332 },
    { latitud: -37.314, longitud: -59.128 },
    { latitud: -37.308, longitud: -59.123 },
  ],
  501: [
    { latitud: -37.333, longitud: -59.175 },
    { latitud: -37.33, longitud: -59.16 },
    { latitud: -37.326, longitud: -59.145 },
    { latitud: -37.3217, longitud: -59.1332 },
  ],
};
