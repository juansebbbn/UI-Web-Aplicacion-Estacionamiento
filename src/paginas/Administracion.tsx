import { useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { transferirTitularidad } from "../api/vehiculos";
import { listarTodasLasSesiones } from "../api/sesiones";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { useToasts } from "../contextos/contextoToasts";
import { formatearFecha, formatearMonto } from "../utils/formato";
import estilos from "./Administracion.module.css";

export function Administracion() {
  return (
    <section>
      <h2 className={estilos.tituloPagina}>Administración</h2>
      <SeccionTitularidad />
      <SeccionSesiones />
    </section>
  );
}

function SeccionTitularidad() {
  const { mostrarExito, mostrarError } = useToasts();
  const [patente, setPatente] = useState("");
  const [nuevoUsuarioUsername, setNuevoUsuarioUsername] = useState("");

  const transferir = useMutation({
    mutationFn: () => transferirTitularidad(patente.toUpperCase(), { nuevoUsuarioUsername }),
    onSuccess: () => {
      mostrarExito(`Vehículo ${patente.toUpperCase()} transferido a ${nuevoUsuarioUsername}.`);
      setPatente("");
      setNuevoUsuarioUsername("");
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    transferir.mutate();
  }

  return (
    <div className={estilos.seccion}>
      <h3 className={estilos.tituloSeccion}>Transferir titularidad de un vehículo</h3>
      <form className={estilos.formulario} onSubmit={manejarEnvio}>
        <label className={estilos.campo}>
          Patente
          <input value={patente} onChange={(evento) => setPatente(evento.target.value)} required />
        </label>
        <label className={estilos.campo}>
          Nuevo usuario
          <input
            value={nuevoUsuarioUsername}
            onChange={(evento) => setNuevoUsuarioUsername(evento.target.value)}
            required
          />
        </label>
        <button type="submit" className={estilos.boton} disabled={transferir.isPending}>
          {transferir.isPending ? "Transfiriendo..." : "Transferir"}
        </button>
      </form>
    </div>
  );
}

const TAMANO_PAGINA = 10;

function SeccionSesiones() {
  const [pagina, setPagina] = useState(0);
  const sesiones = useQuery({
    queryKey: ["sesiones-admin", pagina],
    queryFn: () => listarTodasLasSesiones({ page: pagina, size: TAMANO_PAGINA, sort: "horaInicio,desc" }),
  });

  return (
    <div className={estilos.seccion}>
      <h3 className={estilos.tituloSeccion}>Todas las sesiones</h3>

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
