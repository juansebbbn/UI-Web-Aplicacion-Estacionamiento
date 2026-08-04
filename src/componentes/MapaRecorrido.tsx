import { useEffect } from "react";
import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import type { Coordenada } from "../tipos/comun";
import { ColectivosAnimados } from "./ColectivosAnimados";
import estilos from "./MapaRecorrido.module.css";

const CENTRO_TANDIL: LatLngTuple = [-37.3217, -59.1332];

function AjustarVistaARecorrido({ puntos }: { puntos: Coordenada[] }) {
  const mapa = useMap();

  useEffect(() => {
    if (puntos.length === 0) return;
    const bounds: LatLngBoundsExpression = puntos.map((punto): LatLngTuple => [punto.latitud, punto.longitud]);
    mapa.fitBounds(bounds, { padding: [24, 24] });
    // Recalcula el encuadre cada vez que cambia la linea seleccionada (nueva
    // referencia de `puntos`, ver RECORRIDOS_LINEAS).
  }, [puntos, mapa]);

  return null;
}

interface MapaRecorridoProps {
  puntos: Coordenada[];
  color: string;
}

export function MapaRecorrido({ puntos, color }: MapaRecorridoProps) {
  return (
    <MapContainer center={CENTRO_TANDIL} zoom={13} className={estilos.mapa}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AjustarVistaARecorrido puntos={puntos} />
      <Polyline
        positions={puntos.map((punto): LatLngTuple => [punto.latitud, punto.longitud])}
        pathOptions={{ color, weight: 5 }}
      />
      <ColectivosAnimados puntos={puntos} color={color} />
    </MapContainer>
  );
}
