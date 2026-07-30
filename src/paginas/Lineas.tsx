import { useState } from "react";
import { Link } from "react-router-dom";
import { MapaRecorrido } from "../componentes/MapaRecorrido";
import { useAutenticacion } from "../contextos/useAutenticacion";
import { LINEAS_COLECTIVO, type LineaColectivo } from "../data/lineas";
import estilos from "./Lineas.module.css";

// Publica: no requiere estar logueado (ver App.tsx / EnvoltorioLineas). El
// wrapper decide si esto se muestra dentro del Layout (con sesion) o solo
// (sin sesion) — este componente no sabe ni le importa cual de los dos es.
//
// Los datos de las lineas viven completamente en el front (LINEAS_COLECTIVO,
// ver src/data/lineas.ts) — no hay fetch a ningun backend.
export function Lineas() {
  const { estaAutenticado } = useAutenticacion();
  const [seleccionada, setSeleccionada] = useState<LineaColectivo | null>(null);

  return (
    <div>
      {!estaAutenticado && (
        <Link to="/login" className={estilos.volver}>
          ← Volver
        </Link>
      )}
      <h2 className={estilos.titulo}>Líneas de colectivo</h2>

      {LINEAS_COLECTIVO.length === 0 && <p>No hay líneas cargadas.</p>}

      {LINEAS_COLECTIVO.length > 0 && (
        <div className={estilos.contenido}>
          <ul className={estilos.lista}>
            {LINEAS_COLECTIVO.map((linea) => (
              <li key={linea.numero}>
                <button
                  type="button"
                  className={
                    seleccionada?.numero === linea.numero
                      ? `${estilos.item} ${estilos.itemSeleccionado}`
                      : estilos.item
                  }
                  aria-pressed={seleccionada?.numero === linea.numero}
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

              {seleccionada.recorrido ? (
                <div className={estilos.tarjetaMapa}>
                  <MapaRecorrido puntos={seleccionada.recorrido} color={seleccionada.color} />
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
