import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { listarTodasLasSesiones } from "../api/sesiones";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { formatearFecha, formatearMonto } from "../utils/formato";
import estilos from "./AdminComun.module.css";

const TAMANO_PAGINA = 10;

export function AdminSesiones() {
  return (
    <section>
      <h2 className={estilos.tituloPagina}>Sesiones activas</h2>

      <SeccionSesionesEnVivo />
      <SeccionHistorial />
    </section>
  );
}

// Auto-refresh cada 5s: es la seccion "en vivo", no tiene sentido que el
// admin tenga que recargar la pagina a mano para ver sesiones nuevas.
function SeccionSesionesEnVivo() {
  const sesiones = useQuery({
    queryKey: ["sesiones-en-vivo"],
    queryFn: () => listarTodasLasSesiones({ estado: "ACTIVA", size: 50, sort: "horaInicio,desc" }),
    refetchInterval: 5000,
  });

  return (
    <div className={estilos.seccion}>
      <h3 className={estilos.tituloSeccion}>
        <span className={estilos.puntoEnVivo} aria-hidden="true" />
        En vivo
      </h3>

      {sesiones.isPending && <p>Cargando…</p>}
      {sesiones.isError && <MensajeError mensaje={obtenerMensajeError(sesiones.error)} />}
      {sesiones.data && sesiones.data.content.length === 0 && (
        <p className={estilos.ayuda}>No hay ninguna sesión de estacionamiento activa en este momento.</p>
      )}

      {sesiones.data && sesiones.data.content.length > 0 && (
        <div className={estilos.contenedorTabla}>
          <table className={estilos.tabla}>
            <thead>
              <tr>
                <th>Patente</th>
                <th>Zona</th>
                <th>Desde</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {sesiones.data.content.map((sesion) => (
                <tr key={sesion.id}>
                  <td className={estilos.patenteCelda}>{sesion.patente}</td>
                  <td>{sesion.nombreZona}</td>
                  <td>{formatearFecha(sesion.horaInicio)}</td>
                  <td>
                    <span className={estilos.insigniaActiva}>Activa</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// El resto de la app solo pide "sesiones activas", pero el historial completo
// (activas + finalizadas, paginado) ya existia y no tiene un lugar mejor
// donde vivir — queda aca como segunda seccion de la misma pagina de sesiones.
function SeccionHistorial() {
  const [pagina, setPagina] = useState(0);
  const sesiones = useQuery({
    queryKey: ["sesiones-admin", pagina],
    queryFn: () => listarTodasLasSesiones({ page: pagina, size: TAMANO_PAGINA, sort: "horaInicio,desc" }),
  });

  return (
    <div className={estilos.seccion}>
      <h3 className={estilos.tituloSeccion}>Historial completo</h3>

      {sesiones.isPending && <p>Cargando sesiones…</p>}
      {sesiones.isError && <MensajeError mensaje={obtenerMensajeError(sesiones.error)} />}

      {sesiones.data && (
        <>
          <div className={estilos.contenedorTabla}>
            <table className={estilos.tabla}>
              <thead>
                <tr>
                  <th>Patente</th>
                  <th>Zona</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th>Estado</th>
                  <th className={estilos.colMonto}>Monto</th>
                </tr>
              </thead>
              <tbody>
                {sesiones.data.content.map((sesion) => (
                  <tr key={sesion.id}>
                    <td className={estilos.patenteCelda}>{sesion.patente}</td>
                    <td>{sesion.nombreZona}</td>
                    <td>{formatearFecha(sesion.horaInicio)}</td>
                    <td>{sesion.horaFin ? formatearFecha(sesion.horaFin) : "—"}</td>
                    <td>
                      <span
                        className={sesion.estado === "ACTIVA" ? estilos.insigniaActiva : estilos.insigniaFinalizada}
                      >
                        {sesion.estado === "ACTIVA" ? "Activa" : "Finalizada"}
                      </span>
                    </td>
                    <td className={estilos.colMonto}>
                      {sesion.montoCobrado !== null ? formatearMonto(sesion.montoCobrado) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={estilos.paginacion}>
            <button
              type="button"
              className={estilos.botonChico}
              onClick={() => setPagina((p) => p - 1)}
              disabled={sesiones.data.first}
            >
              ← Anterior
            </button>
            <span className={estilos.paginaActual}>
              Página {sesiones.data.number + 1} de {Math.max(sesiones.data.totalPages, 1)}
            </span>
            <button
              type="button"
              className={estilos.botonChico}
              onClick={() => setPagina((p) => p + 1)}
              disabled={sesiones.data.last}
            >
              Siguiente →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
