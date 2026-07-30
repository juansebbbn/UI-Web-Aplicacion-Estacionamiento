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
      <h2>Inspección</h2>
      <p>Ingresá una patente para ver si tiene una sesión de estacionamiento activa.</p>

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

      {consulta.data && consulta.data.tieneSesionActiva && (
        <p className={`${estilos.resultado} ${estilos.activa}`}>
          <strong>{consulta.data.patente}</strong> tiene una sesión activa
          <br />
          Desde: {consulta.data.horaInicio ? formatearFecha(consulta.data.horaInicio) : "—"}
        </p>
      )}

      {consulta.data && !consulta.data.tieneSesionActiva && (
        <p className={`${estilos.resultado} ${estilos.inactiva}`}>
          <strong>{consulta.data.patente}</strong> no tiene una sesión activa.
        </p>
      )}
    </div>
  );
}
