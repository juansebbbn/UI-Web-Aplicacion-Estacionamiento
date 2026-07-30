import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transferirTitularidad } from "../api/vehiculos";
import { listarTodasLasSesiones } from "../api/sesiones";
import { ajustarSaldo, listarUsuariosAdmin } from "../api/usuarios";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { useToasts } from "../contextos/contextoToasts";
import { formatearFecha, formatearMonto } from "../utils/formato";
import estilos from "./Administracion.module.css";

export function Administracion() {
  return (
    <section>
      <h2 className={estilos.tituloPagina}>Administración</h2>
      <SeccionSesionesEnVivo />
      <SeccionUsuarios />
      <SeccionTitularidad />
      <SeccionSesiones />
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
        Sesiones en vivo
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

function SeccionUsuarios() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useToasts();
  const usuarios = useQuery({ queryKey: ["usuarios-admin"], queryFn: listarUsuariosAdmin });

  const [edicionId, setEdicionId] = useState<number | null>(null);
  const [monto, setMonto] = useState("");
  const [motivo, setMotivo] = useState("");

  const ajuste = useMutation({
    mutationFn: ({ id, monto: montoAjuste, motivo: motivoAjuste }: { id: number; monto: number; motivo: string }) =>
      ajustarSaldo(id, { monto: montoAjuste, motivo: motivoAjuste }),
    onSuccess: (usuario) => {
      setEdicionId(null);
      setMonto("");
      setMotivo("");
      mostrarExito(`Saldo de ${usuario.username} actualizado a ${formatearMonto(usuario.saldo)}.`);
      queryClient.invalidateQueries({ queryKey: ["usuarios-admin"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  function abrirAjuste(id: number) {
    setEdicionId(id);
    setMonto("");
    setMotivo("");
  }

  function manejarAjuste(evento: FormEvent, id: number) {
    evento.preventDefault();
    const montoNumerico = Number(monto);
    if (!montoNumerico) return;
    ajuste.mutate({ id, monto: montoNumerico, motivo });
  }

  return (
    <div className={estilos.seccion}>
      <h3 className={estilos.tituloSeccion}>Usuarios</h3>

      {usuarios.isPending && <p>Cargando usuarios…</p>}
      {usuarios.isError && <MensajeError mensaje={obtenerMensajeError(usuarios.error)} />}
      {usuarios.data && usuarios.data.length === 0 && <p>No hay usuarios registrados.</p>}

      {usuarios.data && usuarios.data.length > 0 && (
        <ul className={estilos.listaUsuarios}>
          {usuarios.data.map((usuario) => (
            <li key={usuario.id} className={estilos.tarjetaUsuario}>
              <div className={estilos.usuarioEncabezado}>
                <div>
                  <span className={estilos.usuarioNombre}>{usuario.username}</span>{" "}
                  <span className={estilos.usuarioMeta}>DNI {usuario.dni}</span>
                  <div className={estilos.rolesUsuario}>
                    {usuario.roles.map((rol) => (
                      <span key={rol} className={estilos.insigniaRol}>
                        {rol.replace("ROLE_", "")}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={estilos.saldoAcciones}>
                  <span className={usuario.saldo < 0 ? `${estilos.usuarioSaldo} ${estilos.saldoNegativo}` : estilos.usuarioSaldo}>
                    {formatearMonto(usuario.saldo)}
                  </span>
                  <button type="button" className={estilos.botonChico} onClick={() => abrirAjuste(usuario.id)}>
                    Ajustar saldo
                  </button>
                </div>
              </div>

              {usuario.vehiculos.length > 0 && (
                <div className={estilos.vehiculosUsuario}>
                  {usuario.vehiculos.map((vehiculo) => (
                    <span key={vehiculo.id} className={estilos.chipVehiculo}>
                      {vehiculo.patente} · {vehiculo.tipo === "AUTO" ? "Auto" : "Moto"}
                    </span>
                  ))}
                </div>
              )}
              {usuario.vehiculos.length === 0 && (
                <p className={estilos.sinVehiculos}>Sin vehículos registrados.</p>
              )}

              {edicionId === usuario.id && (
                <form className={estilos.formularioAjuste} onSubmit={(evento) => manejarAjuste(evento, usuario.id)}>
                  <label className={estilos.campo}>
                    Monto (+/-)
                    <input
                      type="number"
                      step="0.01"
                      value={monto}
                      onChange={(evento) => setMonto(evento.target.value)}
                      placeholder="ej. 500 o -500"
                      required
                    />
                  </label>
                  <label className={estilos.campo}>
                    Motivo
                    <input
                      value={motivo}
                      onChange={(evento) => setMotivo(evento.target.value)}
                      placeholder="ej. compensación por error de cobro"
                      required
                    />
                  </label>
                  <button type="submit" className={estilos.botonChico} disabled={ajuste.isPending}>
                    {ajuste.isPending ? "Aplicando..." : "Aplicar"}
                  </button>
                  <button type="button" className={estilos.botonChico} onClick={() => setEdicionId(null)}>
                    Cancelar
                  </button>
                </form>
              )}
            </li>
          ))}
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
      <h3 className={estilos.tituloSeccion}>Historial de todas las sesiones</h3>

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
