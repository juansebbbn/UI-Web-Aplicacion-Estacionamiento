import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { actualizarLinea, crearLinea, eliminarLinea, listarLineas } from "../api/lineas";
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
      <SeccionLineas />
      <SeccionTitularidad />
      <SeccionSesiones />
    </section>
  );
}

function SeccionLineas() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useToasts();
  const lineas = useQuery({ queryKey: ["lineas"], queryFn: listarLineas });

  const [numero, setNumero] = useState("");
  const [nombre, setNombre] = useState("");
  const [color, setColor] = useState("#1a5fb4");
  const [edicion, setEdicion] = useState<{ id: number; nombre: string; color: string } | null>(null);

  const crear = useMutation({
    mutationFn: crearLinea,
    onSuccess: (linea) => {
      setNumero("");
      setNombre("");
      mostrarExito(`Línea ${linea.numero} creada.`);
      queryClient.invalidateQueries({ queryKey: ["lineas"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  const actualizar = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: { nombre: string; color: string } }) =>
      actualizarLinea(id, datos),
    onSuccess: (linea) => {
      setEdicion(null);
      mostrarExito(`Línea ${linea.numero} actualizada.`);
      queryClient.invalidateQueries({ queryKey: ["lineas"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  const eliminar = useMutation({
    mutationFn: eliminarLinea,
    onSuccess: () => {
      mostrarExito("Línea eliminada.");
      queryClient.invalidateQueries({ queryKey: ["lineas"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  function manejarCrear(evento: FormEvent) {
    evento.preventDefault();
    crear.mutate({ numero: Number(numero), nombre, color });
  }

  function manejarActualizar(evento: FormEvent) {
    evento.preventDefault();
    if (!edicion) return;
    actualizar.mutate({ id: edicion.id, datos: { nombre: edicion.nombre, color: edicion.color } });
  }

  return (
    <div className={estilos.seccion}>
      <h3 className={estilos.tituloSeccion}>Líneas de colectivo</h3>

      <form className={estilos.formulario} onSubmit={manejarCrear}>
        <label className={estilos.campo}>
          Número
          <input
            type="number"
            min={1}
            value={numero}
            onChange={(evento) => setNumero(evento.target.value)}
            required
          />
        </label>
        <label className={estilos.campo}>
          Nombre
          <input value={nombre} onChange={(evento) => setNombre(evento.target.value)} required />
        </label>
        <label className={estilos.campo}>
          Color
          <input
            type="color"
            className={estilos.campoColor}
            value={color}
            onChange={(evento) => setColor(evento.target.value)}
          />
        </label>
        <button type="submit" className={estilos.boton} disabled={crear.isPending}>
          {crear.isPending ? "Creando..." : "Crear línea"}
        </button>
      </form>

      {lineas.isPending && <p>Cargando líneas…</p>}
      {lineas.isError && <MensajeError mensaje={obtenerMensajeError(lineas.error)} />}

      {lineas.data && (
        <ul className={estilos.lista}>
          {lineas.data.map((linea) =>
            edicion?.id === linea.id ? (
              <li key={linea.id} className={estilos.item}>
                <form className={estilos.formularioInline} onSubmit={manejarActualizar}>
                  <span className={estilos.numero} style={{ background: linea.color }}>
                    {linea.numero}
                  </span>
                  <input
                    value={edicion.nombre}
                    onChange={(evento) => setEdicion({ ...edicion, nombre: evento.target.value })}
                    required
                  />
                  <input
                    type="color"
                    className={estilos.campoColor}
                    value={edicion.color}
                    onChange={(evento) => setEdicion({ ...edicion, color: evento.target.value })}
                  />
                  <button type="submit" className={estilos.botonChico} disabled={actualizar.isPending}>
                    Guardar
                  </button>
                  <button type="button" className={estilos.botonChico} onClick={() => setEdicion(null)}>
                    Cancelar
                  </button>
                </form>
              </li>
            ) : (
              <li key={linea.id} className={estilos.item}>
                <span className={estilos.numero} style={{ background: linea.color }}>
                  {linea.numero}
                </span>
                <span className={estilos.nombreLinea}>{linea.nombre}</span>
                <div className={estilos.acciones}>
                  <button
                    type="button"
                    className={estilos.botonChico}
                    onClick={() => setEdicion({ id: linea.id, nombre: linea.nombre, color: linea.color })}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className={estilos.botonPeligro}
                    onClick={() => eliminar.mutate(linea.id)}
                    disabled={eliminar.isPending}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
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
