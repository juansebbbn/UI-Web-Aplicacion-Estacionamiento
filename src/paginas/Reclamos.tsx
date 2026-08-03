import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { crearReclamo, eliminarReclamo, listarReclamosPropios } from "../api/reclamos";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { useToasts } from "../contextos/contextoToasts";
import { formatearFecha } from "../utils/formato";
import { ETIQUETA_MOTIVO_RECLAMO, type MotivoReclamo } from "../tipos/reclamo";
import estilos from "./Reclamos.module.css";

export function Reclamos() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useToasts();
  const reclamos = useQuery({ queryKey: ["reclamos"], queryFn: listarReclamosPropios });

  const [motivo, setMotivo] = useState<MotivoReclamo>("COBRO");
  const [descripcion, setDescripcion] = useState("");

  const alta = useMutation({
    mutationFn: crearReclamo,
    onSuccess: () => {
      setDescripcion("");
      setMotivo("COBRO");
      mostrarExito("Reclamo enviado. Lo vamos a revisar.");
      queryClient.invalidateQueries({ queryKey: ["reclamos"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  const eliminar = useMutation({
    mutationFn: eliminarReclamo,
    onSuccess: () => {
      mostrarExito("Reclamo eliminado.");
      queryClient.invalidateQueries({ queryKey: ["reclamos"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    alta.mutate({ motivo, descripcion: descripcion.trim() });
  }

  return (
    <section>
      <h2 className={estilos.tituloPagina}>Reclamos</h2>
      <p className={estilos.ayuda}>
        Contanos qué pasó y lo vamos a revisar. Podés cargar más de un reclamo si hace falta.
      </p>

      <div className={estilos.tarjetaFormulario}>
        <h3 className={estilos.tituloTarjeta}>Nuevo reclamo</h3>
        <form className={estilos.formulario} onSubmit={manejarEnvio}>
          <label className={estilos.campo}>
            Motivo
            <select value={motivo} onChange={(evento) => setMotivo(evento.target.value as MotivoReclamo)}>
              {(Object.keys(ETIQUETA_MOTIVO_RECLAMO) as MotivoReclamo[]).map((clave) => (
                <option key={clave} value={clave}>
                  {ETIQUETA_MOTIVO_RECLAMO[clave]}
                </option>
              ))}
            </select>
          </label>
          <label className={estilos.campo}>
            Descripción
            <textarea
              value={descripcion}
              onChange={(evento) => setDescripcion(evento.target.value)}
              required
              minLength={10}
              rows={4}
              placeholder="Contanos el detalle del reclamo…"
            />
          </label>
          <button type="submit" className={estilos.boton} disabled={alta.isPending}>
            {alta.isPending ? "Enviando..." : "Enviar reclamo"}
          </button>
        </form>
      </div>

      <h3 className={estilos.tituloSeccion}>Mis reclamos</h3>
      {reclamos.isPending && <p>Cargando reclamos…</p>}
      {reclamos.isError && <MensajeError mensaje={obtenerMensajeError(reclamos.error)} />}
      {reclamos.data && reclamos.data.length === 0 && <p className={estilos.ayuda}>Todavía no cargaste ningún reclamo.</p>}

      {reclamos.data && reclamos.data.length > 0 && (
        <ul className={estilos.lista}>
          {reclamos.data.map((reclamo) => (
            <li key={reclamo.id} className={estilos.item}>
              <div className={estilos.itemEncabezado}>
                <span className={estilos.insigniaMotivo}>{ETIQUETA_MOTIVO_RECLAMO[reclamo.motivo]}</span>
                <span className={estilos.fecha}>{formatearFecha(reclamo.fechaCreacion)}</span>
              </div>
              <p className={estilos.descripcion}>{reclamo.descripcion}</p>
              {reclamo.respuesta && <p className={estilos.respuesta}>Respuesta: "{reclamo.respuesta}"</p>}
              <button
                type="button"
                className={estilos.botonEliminar}
                onClick={() => eliminar.mutate(reclamo.id)}
                disabled={eliminar.isPending}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
