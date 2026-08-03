import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eliminarNotificacion, listarNotificacionesPropias, marcarNotificacionesLeidas } from "../api/notificaciones";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { useToasts } from "../contextos/contextoToasts";
import { formatearFecha } from "../utils/formato";
import estilos from "./Notificaciones.module.css";

// Polling cada 20s: es la forma simple de que el usuario se entere de una
// notificacion nueva (multa, recarga, pago, respuesta a un reclamo) sin
// tener que recargar la pagina a mano.
const INTERVALO_POLLING_MS = 20_000;

export function Notificaciones() {
  const queryClient = useQueryClient();
  const { mostrarError } = useToasts();
  const notificaciones = useQuery({
    queryKey: ["notificaciones"],
    queryFn: listarNotificacionesPropias,
    refetchInterval: INTERVALO_POLLING_MS,
  });

  const marcarLeidas = useMutation({
    mutationFn: marcarNotificacionesLeidas,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notificaciones"] }),
  });

  const eliminar = useMutation({
    mutationFn: eliminarNotificacion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notificaciones"] }),
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  const hayNoLeidas = notificaciones.data?.some((n) => !n.leida) ?? false;

  return (
    <section>
      <div className={estilos.encabezado}>
        <h2 className={estilos.tituloPagina}>Notificaciones</h2>
        {hayNoLeidas && (
          <button
            type="button"
            className={estilos.botonSecundario}
            onClick={() => marcarLeidas.mutate()}
            disabled={marcarLeidas.isPending}
          >
            {marcarLeidas.isPending ? "Marcando..." : "Marcar todas como leídas"}
          </button>
        )}
      </div>

      {notificaciones.isPending && <p>Cargando notificaciones…</p>}
      {notificaciones.isError && <MensajeError mensaje={obtenerMensajeError(notificaciones.error)} />}
      {notificaciones.data && notificaciones.data.length === 0 && (
        <p className={estilos.ayuda}>No tenés notificaciones todavía.</p>
      )}

      {notificaciones.data && notificaciones.data.length > 0 && (
        <ul className={estilos.lista}>
          {notificaciones.data.map((notificacion) => (
            <li
              key={notificacion.id}
              className={notificacion.leida ? estilos.item : `${estilos.item} ${estilos.itemNoLeida}`}
            >
              <p className={estilos.descripcion}>{notificacion.descripcion}</p>
              <div className={estilos.acciones}>
                <span className={estilos.fecha}>{formatearFecha(notificacion.fecha)}</span>
                <button
                  type="button"
                  className={estilos.botonEliminar}
                  aria-label="Eliminar notificación"
                  onClick={() => eliminar.mutate(notificacion.id)}
                  disabled={eliminar.isPending}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
