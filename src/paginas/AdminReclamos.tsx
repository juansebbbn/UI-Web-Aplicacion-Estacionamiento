import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { eliminarReclamoAdmin, listarTodosLosReclamos, revisarReclamo } from "../api/reclamos";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { useToasts } from "../contextos/contextoToasts";
import { formatearFecha } from "../utils/formato";
import { ETIQUETA_MOTIVO_RECLAMO } from "../tipos/reclamo";
import estilos from "./AdminComun.module.css";

const TAMANO_PAGINA = 10;

export function AdminReclamos() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useToasts();
  const [pagina, setPagina] = useState(0);
  const reclamos = useQuery({
    queryKey: ["reclamos-admin", pagina],
    queryFn: () => listarTodosLosReclamos({ page: pagina, size: TAMANO_PAGINA, sort: "fechaCreacion,desc" }),
  });

  const [edicionId, setEdicionId] = useState<number | null>(null);
  const [respuesta, setRespuesta] = useState("");

  const revisar = useMutation({
    mutationFn: ({ id, respuesta: texto }: { id: number; respuesta: string }) =>
      revisarReclamo(id, { respuesta: texto }),
    onSuccess: (reclamo) => {
      setEdicionId(null);
      setRespuesta("");
      mostrarExito(`Reclamo de ${reclamo.username} marcado como revisado.`);
      queryClient.invalidateQueries({ queryKey: ["reclamos-admin"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  const eliminar = useMutation({
    mutationFn: eliminarReclamoAdmin,
    onSuccess: () => {
      mostrarExito("Reclamo eliminado.");
      queryClient.invalidateQueries({ queryKey: ["reclamos-admin"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  function abrirRespuesta(id: number) {
    setEdicionId(id);
    setRespuesta("");
  }

  function manejarRespuesta(evento: FormEvent, id: number) {
    evento.preventDefault();
    if (!respuesta.trim()) return;
    revisar.mutate({ id, respuesta: respuesta.trim() });
  }

  return (
    <section>
      <h2 className={estilos.tituloPagina}>Reclamos</h2>

      <div className={estilos.seccion}>
        {reclamos.isPending && <p>Cargando reclamos…</p>}
        {reclamos.isError && <MensajeError mensaje={obtenerMensajeError(reclamos.error)} />}
        {reclamos.data && reclamos.data.content.length === 0 && <p className={estilos.ayuda}>No hay reclamos cargados.</p>}

        {reclamos.data && reclamos.data.content.length > 0 && (
          <>
            <ul className={estilos.listaUsuarios}>
              {reclamos.data.content.map((reclamo) => (
                <li key={reclamo.id} className={estilos.tarjetaUsuario}>
                  <div className={estilos.usuarioEncabezado}>
                    <div>
                      <span className={estilos.usuarioNombre}>{reclamo.username}</span>{" "}
                      <span className={estilos.usuarioMeta}>
                        {ETIQUETA_MOTIVO_RECLAMO[reclamo.motivo]} · {formatearFecha(reclamo.fechaCreacion)}
                      </span>
                      <p className={estilos.ayuda}>{reclamo.descripcion}</p>
                      {reclamo.respuesta && (
                        <p className={estilos.ayuda}>Respuesta: "{reclamo.respuesta}"</p>
                      )}
                    </div>
                    <div className={estilos.saldoAcciones}>
                      {reclamo.revisado ? (
                        <span className={estilos.insigniaFinalizada}>Revisado</span>
                      ) : (
                        <>
                          <span className={estilos.insigniaActiva}>Pendiente</span>
                          <button
                            type="button"
                            className={estilos.botonChico}
                            onClick={() => abrirRespuesta(reclamo.id)}
                          >
                            Responder
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className={estilos.botonChico}
                        onClick={() => eliminar.mutate(reclamo.id)}
                        disabled={eliminar.isPending}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {edicionId === reclamo.id && (
                    <form className={estilos.formularioAjuste} onSubmit={(evento) => manejarRespuesta(evento, reclamo.id)}>
                      <label className={estilos.campo}>
                        Respuesta (el usuario la ve en su sección de Reclamos)
                        <input
                          value={respuesta}
                          onChange={(evento) => setRespuesta(evento.target.value)}
                          placeholder="ej. ya arreglamos el cartel de esa zona"
                          required
                        />
                      </label>
                      <button type="submit" className={estilos.botonChico} disabled={revisar.isPending}>
                        {revisar.isPending ? "Enviando..." : "Enviar y marcar revisado"}
                      </button>
                      <button type="button" className={estilos.botonChico} onClick={() => setEdicionId(null)}>
                        Cancelar
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
            <div className={estilos.paginacion}>
              <button
                type="button"
                className={estilos.botonChico}
                onClick={() => setPagina((p) => p - 1)}
                disabled={reclamos.data.first}
              >
                ← Anterior
              </button>
              <span className={estilos.paginaActual}>
                Página {reclamos.data.number + 1} de {Math.max(reclamos.data.totalPages, 1)}
              </span>
              <button
                type="button"
                className={estilos.botonChico}
                onClick={() => setPagina((p) => p + 1)}
                disabled={reclamos.data.last}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
