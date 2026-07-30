import { useEffect, useRef } from "react";
import { MapContainer, Marker, Polygon, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { LatLngBoundsExpression, LatLngTuple } from "leaflet";
import iconoMarcador2x from "leaflet/dist/images/marker-icon-2x.png";
import iconoMarcador from "leaflet/dist/images/marker-icon.png";
import sombraMarcador from "leaflet/dist/images/marker-shadow.png";
import type { Coordenada } from "../tipos/comun";
import type { ZonaRespuesta } from "../tipos/zona";
import { formatearMonto } from "../utils/formato";
import estilos from "./MapaZonas.module.css";

// El icono default de Leaflet referencia URLs relativas que no resuelven
// empaquetadas con Vite: hay que pisarlas con las que Vite sirve.
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconoMarcador2x,
  iconUrl: iconoMarcador,
  shadowUrl: sombraMarcador,
});

const CENTRO_TANDIL: LatLngTuple = [-37.3217, -59.1332];
const COLORES_ZONA = ["#1a5fb4", "#2ec27e", "#e5a50a", "#c01c28", "#9141ac", "#0e8a7d"];

// Ajusta el encuadre del mapa a las zonas la primera vez que llegan de la
// API. Solo una vez (con un ref, no en cada cambio de referencia del array):
// si se repitiera en cada refetch de React Query se lo llevaria puesto al
// usuario mientras esta eligiendo donde estacionar.
function AjustarVistaAZonas({ zonas }: { zonas: ZonaRespuesta[] }) {
  const mapa = useMap();
  const yaAjustado = useRef(false);

  useEffect(() => {
    if (yaAjustado.current || zonas.length === 0) return;
    yaAjustado.current = true;
    const bounds: LatLngBoundsExpression = zonas.flatMap((zona) =>
      zona.vertices.map((vertice): LatLngTuple => [vertice.latitud, vertice.longitud]),
    );
    mapa.fitBounds(bounds, { padding: [20, 20] });
  }, [zonas, mapa]);

  return null;
}

function CentrarEnMarcador({ punto }: { punto: Coordenada }) {
  const mapa = useMap();

  useEffect(() => {
    mapa.flyTo([punto.latitud, punto.longitud], mapa.getZoom());
    // Solo cuando cambia el punto: no queremos volver a centrar en cada
    // render por otro motivo (ej. re-render del padre).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [punto.latitud, punto.longitud]);

  return null;
}

function ManejarClicksDeMapa({ onClickMapa }: { onClickMapa: (coordenada: Coordenada) => void }) {
  useMapEvents({
    click(evento) {
      onClickMapa({ latitud: evento.latlng.lat, longitud: evento.latlng.lng });
    },
  });
  return null;
}

interface MapaZonasProps {
  zonas: ZonaRespuesta[];
  // Si se pasan, el mapa se vuelve interactivo: click para elegir un punto.
  marcador?: Coordenada | null;
  onClickMapa?: (coordenada: Coordenada) => void;
}

export function MapaZonas({ zonas, marcador, onClickMapa }: MapaZonasProps) {
  return (
    <MapContainer center={CENTRO_TANDIL} zoom={14} className={estilos.mapa}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <AjustarVistaAZonas zonas={zonas} />
      {onClickMapa && <ManejarClicksDeMapa onClickMapa={onClickMapa} />}
      {marcador && <CentrarEnMarcador punto={marcador} />}
      {marcador && <Marker position={[marcador.latitud, marcador.longitud]} />}
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
