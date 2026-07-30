import { useEffect } from "react";
import { MapContainer, Polygon, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import type { ZonaRespuesta } from "../tipos/zona";
import { formatearMonto } from "../utils/formato";
import estilos from "./MapaZonas.module.css";

const CENTRO_TANDIL: LatLngTuple = [-37.3217, -59.1332];
const COLORES_ZONA = ["#1a5fb4", "#2ec27e", "#e5a50a", "#c01c28", "#9141ac", "#0e8a7d"];

// Ajusta el encuadre del mapa a las zonas una vez que llegan de la API.
// Tiene que vivir dentro de MapContainer: useMap solo funciona ahi.
function AjustarVistaAZonas({ zonas }: { zonas: ZonaRespuesta[] }) {
  const mapa = useMap();

  useEffect(() => {
    if (zonas.length === 0) return;
    const bounds: LatLngBoundsExpression = zonas.flatMap((zona) =>
      zona.vertices.map((vertice): LatLngTuple => [vertice.latitud, vertice.longitud]),
    );
    mapa.fitBounds(bounds, { padding: [20, 20] });
  }, [zonas, mapa]);

  return null;
}

export function MapaZonas({ zonas }: { zonas: ZonaRespuesta[] }) {
  return (
    <MapContainer center={CENTRO_TANDIL} zoom={14} className={estilos.mapa}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AjustarVistaAZonas zonas={zonas} />
      {zonas.map((zona, indice) => (
        <Polygon
          key={zona.id}
          positions={zona.vertices.map((vertice): LatLngTuple => [vertice.latitud, vertice.longitud])}
          pathOptions={{ color: COLORES_ZONA[indice % COLORES_ZONA.length] }}
        >
          <Tooltip sticky>
            {zona.nombre} — {formatearMonto(zona.tarifaPorMinuto)}/min
          </Tooltip>
        </Polygon>
      ))}
    </MapContainer>
  );
}
