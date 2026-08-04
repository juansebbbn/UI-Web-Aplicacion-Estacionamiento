import { useEffect, useMemo, useRef } from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import type { LatLngTuple } from "leaflet";
import type { Coordenada } from "../tipos/comun";

// Cuanto tarda un colectivo en dar una vuelta completa al circuito.
const DURACION_VUELTA_MS = 40_000;
// Por recorrido, al menos 2 colectivos circulando a la vez (repartidos en
// el circuito para que no salgan siempre juntos).
const COLECTIVOS_POR_LINEA = 2;

interface Tramo {
  desde: Coordenada;
  hasta: Coordenada;
  longitud: number;
  // Distancia acumulada (desde el inicio del circuito) hasta el final de este tramo.
  finAcumulado: number;
}

function distancia(a: Coordenada, b: Coordenada): number {
  return Math.hypot(a.latitud - b.latitud, a.longitud - b.longitud);
}

// `puntos` tiene que ser un circuito CERRADO (primer punto == último, ver
// src/data/lineas.ts) para que la vuelta sea cíclica sin salto raro al
// reiniciar: el ultimo tramo termina exactamente donde arranca el primero.
function construirTramos(puntos: Coordenada[]): { tramos: Tramo[]; longitudTotal: number } {
  const tramos: Tramo[] = [];
  let finAcumulado = 0;
  for (let i = 0; i < puntos.length - 1; i++) {
    const longitud = distancia(puntos[i], puntos[i + 1]);
    finAcumulado += longitud;
    tramos.push({ desde: puntos[i], hasta: puntos[i + 1], longitud, finAcumulado });
  }
  return { tramos, longitudTotal: finAcumulado };
}

function posicionEnCircuito(tramos: Tramo[], longitudTotal: number, distanciaRecorrida: number): LatLngTuple {
  const objetivo = ((distanciaRecorrida % longitudTotal) + longitudTotal) % longitudTotal;
  const tramo = tramos.find((t) => objetivo <= t.finAcumulado) ?? tramos[tramos.length - 1];
  const inicioTramo = tramo.finAcumulado - tramo.longitud;
  const proporcion = tramo.longitud === 0 ? 0 : (objetivo - inicioTramo) / tramo.longitud;
  return [
    tramo.desde.latitud + (tramo.hasta.latitud - tramo.desde.latitud) * proporcion,
    tramo.desde.longitud + (tramo.hasta.longitud - tramo.desde.longitud) * proporcion,
  ];
}

function crearIconoColectivo(color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;">🚌</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

interface MarcadorColectivoProps {
  tramos: Tramo[];
  longitudTotal: number;
  color: string;
  // Fracción del circuito (0..1) en la que arranca este colectivo, para que
  // los colectivos de una misma línea no salgan pegados unos a otros.
  desfase: number;
}

function MarcadorColectivo({ tramos, longitudTotal, color, desfase }: MarcadorColectivoProps) {
  const marcadorRef = useRef<L.Marker | null>(null);
  const icono = useMemo(() => crearIconoColectivo(color), [color]);
  const posicionInicial = useMemo(
    () => posicionEnCircuito(tramos, longitudTotal, desfase * longitudTotal),
    [tramos, longitudTotal, desfase],
  );

  useEffect(() => {
    const inicio = performance.now() - desfase * DURACION_VUELTA_MS;
    let idAnimacion: number;

    function animar(ahora: number) {
      const distanciaRecorrida = ((ahora - inicio) / DURACION_VUELTA_MS) * longitudTotal;
      marcadorRef.current?.setLatLng(posicionEnCircuito(tramos, longitudTotal, distanciaRecorrida));
      idAnimacion = requestAnimationFrame(animar);
    }

    idAnimacion = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(idAnimacion);
  }, [tramos, longitudTotal, desfase]);

  return <Marker ref={marcadorRef} position={posicionInicial} icon={icono} keyboard={false} />;
}

interface ColectivosAnimadosProps {
  puntos: Coordenada[];
  color: string;
}

// Simula, por cada línea, sus colectivos recorriendo el circuito en
// movimiento continuo (ver comentario sobre recorridos cerrados en
// src/data/lineas.ts). No representa posiciones reales de GPS: es
// únicamente una animación ilustrativa.
export function ColectivosAnimados({ puntos, color }: ColectivosAnimadosProps) {
  const { tramos, longitudTotal } = useMemo(() => construirTramos(puntos), [puntos]);

  if (tramos.length === 0 || longitudTotal === 0) return null;

  return (
    <>
      {Array.from({ length: COLECTIVOS_POR_LINEA }, (_, indice) => (
        <MarcadorColectivo
          key={indice}
          tramos={tramos}
          longitudTotal={longitudTotal}
          color={color}
          desfase={indice / COLECTIVOS_POR_LINEA}
        />
      ))}
    </>
  );
}
