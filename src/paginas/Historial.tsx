import { useQuery } from "@tanstack/react-query";
import { listarSesionesPropias } from "../api/sesiones";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { formatearFecha, formatearMonto } from "../utils/formato";
import estilos from "./Historial.module.css";

export function Historial() {
  const sesiones = useQuery({ queryKey: ["sesiones"], queryFn: listarSesionesPropias });

  return (
    <section>
      <h2>Historial de sesiones</h2>

      {sesiones.isPending && <p>Cargando historial…</p>}
      {sesiones.isError && <MensajeError mensaje={obtenerMensajeError(sesiones.error)} />}
      {sesiones.data && sesiones.data.length === 0 && <p>Todavía no tenés sesiones de estacionamiento.</p>}

      {sesiones.data && sesiones.data.length > 0 && (
        <div className={estilos.contenedorTabla}>
          <table className={estilos.tabla}>
            <thead>
              <tr>
                <th>Patente</th>
                <th>Zona</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Estado</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              {sesiones.data
                .slice()
                .sort((a, b) => b.horaInicio.localeCompare(a.horaInicio))
                .map((sesion) => (
                  <tr key={sesion.id}>
                    <td>{sesion.patente}</td>
                    <td>{sesion.nombreZona}</td>
                    <td>{formatearFecha(sesion.horaInicio)}</td>
                    <td>{sesion.horaFin ? formatearFecha(sesion.horaFin) : "—"}</td>
                    <td className={sesion.estado === "ACTIVA" ? estilos.estadoActiva : undefined}>
                      {sesion.estado === "ACTIVA" ? "Activa" : "Finalizada"}
                    </td>
                    <td>{sesion.montoCobrado !== null ? formatearMonto(sesion.montoCobrado) : "—"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
