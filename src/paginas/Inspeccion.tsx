import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { inspeccionarPatente } from "../api/sesiones";
import { obtenerMensajeError } from "../api/errores";
import { useToasts } from "../contextos/contextoToasts";
import { formatearFecha } from "../utils/formato";
import estilos from "./Inspeccion.module.css";

export function Inspeccion() {
  const [patente, setPatente] = useState("");
  const { mostrarError } = useToasts();

  const consulta = useMutation({
    mutationFn: inspeccionarPatente,
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    if (!patente) return;
    consulta.mutate(patente.toUpperCase());
  }

  return (
    <div className={estilos.contenedor}>
      <h2 className={estilos.tituloPagina}>Inspección</h2>
      <p className={estilos.ayuda}>Ingresá una patente para ver si tiene una sesión de estacionamiento activa.</p>

      <div className={estilos.tarjetaFormulario}>
        <form className={estilos.formulario} onSubmit={manejarEnvio}>
          <input
            value={patente}
            onChange={(evento) => setPatente(evento.target.value)}
            placeholder="Patente"
            required
          />
          <button type="submit" disabled={consulta.isPending}>
            {consulta.isPending ? "Consultando..." : "Consultar"}
          </button>
        </form>
      </div>

      {consulta.data && consulta.data.tieneSesionActiva && (
        <div className={`${estilos.resultado} ${estilos.activa}`}>
          <span className={estilos.insignia}>Sesión activa</span>
          <p className={estilos.patenteResultado}>{consulta.data.patente}</p>
          <p className={estilos.detalle}>
            Desde: {consulta.data.horaInicio ? formatearFecha(consulta.data.horaInicio) : "—"}
          </p>
        </div>
      )}

      {consulta.data && !consulta.data.tieneSesionActiva && (
        <div className={`${estilos.resultado} ${estilos.inactiva}`}>
          <span className={estilos.insignia}>Sin sesión activa</span>
          <p className={estilos.patenteResultado}>{consulta.data.patente}</p>
        </div>
      )}
    </div>
  );
}
