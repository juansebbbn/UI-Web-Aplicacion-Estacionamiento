import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listarLineas } from "../api/lineas";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { MapaRecorrido } from "../componentes/MapaRecorrido";
import { useAutenticacion } from "../contextos/useAutenticacion";
import { RECORRIDOS_LINEAS } from "../data/recorridosLineas";
import type { LineaRespuesta } from "../tipos/linea";
import estilos from "./Lineas.module.css";

// Publica: no requiere estar logueado (ver App.tsx / EnvoltorioLineas). El
// wrapper decide si esto se muestra dentro del Layout (con sesion) o solo
// (sin sesion) — este componente no sabe ni le importa cual de los dos es.
export function Lineas() {
  const { estaAutenticado } = useAutenticacion();
  const lineas = useQuery({ queryKey: ["lineas"], queryFn: listarLineas });
  const [seleccionada, setSeleccionada] = useState<LineaRespuesta | null>(null);

  const recorrido = seleccionada ? RECORRIDOS_LINEAS[seleccionada.numero] : undefined;

  return (
    <div>
      {!estaAutenticado && (
        <Link to="/login" className={estilos.volver}>
          ← Volver
        </Link>
      )}
      <h2 className={estilos.titulo}>Líneas de colectivo</h2>

      {lineas.isPending && <p>Cargando líneas…</p>}
      {lineas.isError && <MensajeError mensaje={obtenerMensajeError(lineas.error)} />}
      {lineas.data && lineas.data.length === 0 && <p>No hay líneas cargadas.</p>}

      {lineas.data && lineas.data.length > 0 && (
        <div className={estilos.contenido}>
          <ul className={estilos.lista}>
            {lineas.data.map((linea) => (
              <li key={linea.id}>
                <button
                  type="button"
                  className={
                    seleccionada?.id === linea.id ? `${estilos.item} ${estilos.itemSeleccionado}` : estilos.item
                  }
                  aria-pressed={seleccionada?.id === linea.id}
                  onClick={() => setSeleccionada(linea)}
                >
                  <span className={estilos.numero} style={{ background: linea.color }}>
                    {linea.numero}
                  </span>
                  <span className={estilos.nombre}>{linea.nombre}</span>
                </button>
              </li>
            ))}
          </ul>

          {seleccionada && (
            <div className={estilos.detalle}>
              <div className={estilos.detalleEncabezado}>
                <span className={estilos.numeroGrande} style={{ background: seleccionada.color }}>
                  {seleccionada.numero}
                </span>
                <div>
                  <p className={estilos.detalleNombre}>{seleccionada.nombre}</p>
                  <p className={estilos.detalleEtiqueta}>Línea {seleccionada.numero}</p>
                </div>
              </div>

              {recorrido ? (
                <div className={estilos.tarjetaMapa}>
                  <MapaRecorrido puntos={recorrido} color={seleccionada.color} />
                </div>
              ) : (
                <p className={estilos.sinRecorrido}>Todavía no hay un recorrido cargado para esta línea.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
