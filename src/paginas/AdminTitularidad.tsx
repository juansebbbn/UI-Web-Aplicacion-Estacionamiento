import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { transferirTitularidad } from "../api/vehiculos";
import { obtenerMensajeError } from "../api/errores";
import { useToasts } from "../contextos/contextoToasts";
import estilos from "./AdminComun.module.css";

export function AdminTitularidad() {
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
    <section>
      <h2 className={estilos.tituloPagina}>Transferir titularidad</h2>

      <div className={estilos.seccion}>
        <p className={estilos.ayuda}>Cambiá el dueño de un vehículo por su patente.</p>
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
    </section>
  );
}
