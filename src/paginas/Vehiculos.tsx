import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { darDeAltaVehiculo, eliminarVehiculo, listarVehiculosPropios } from "../api/vehiculos";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { useToasts } from "../contextos/contextoToasts";
import type { TipoVehiculo } from "../tipos/vehiculo";
import estilos from "./Vehiculos.module.css";

export function Vehiculos() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useToasts();
  const vehiculos = useQuery({ queryKey: ["vehiculos"], queryFn: listarVehiculosPropios });

  const [patente, setPatente] = useState("");
  const [tipo, setTipo] = useState<TipoVehiculo>("AUTO");

  const alta = useMutation({
    mutationFn: darDeAltaVehiculo,
    onSuccess: (vehiculo) => {
      setPatente("");
      mostrarExito(`Vehículo ${vehiculo.patente} agregado.`);
      queryClient.invalidateQueries({ queryKey: ["vehiculos"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  const baja = useMutation({
    mutationFn: eliminarVehiculo,
    onSuccess: (_datos, patenteEliminada) => {
      mostrarExito(`Vehículo ${patenteEliminada} eliminado.`);
      queryClient.invalidateQueries({ queryKey: ["vehiculos"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  function manejarAlta(evento: FormEvent) {
    evento.preventDefault();
    alta.mutate({ patente: patente.toUpperCase(), tipo });
  }

  return (
    <section>
      <h2>Mis vehículos</h2>

      <form className={estilos.formulario} onSubmit={manejarAlta}>
        <label className={estilos.campo}>
          Patente
          <input
            value={patente}
            onChange={(evento) => setPatente(evento.target.value)}
            required
            pattern="[A-Za-z0-9]{6,10}"
            title="Entre 6 y 10 caracteres alfanuméricos"
          />
        </label>
        <label className={estilos.campo}>
          Tipo
          <select value={tipo} onChange={(evento) => setTipo(evento.target.value as TipoVehiculo)}>
            <option value="AUTO">Auto</option>
            <option value="MOTO">Moto</option>
          </select>
        </label>
        <button type="submit" className={estilos.botonAgregar} disabled={alta.isPending}>
          {alta.isPending ? "Agregando..." : "Agregar vehículo"}
        </button>
      </form>

      {vehiculos.isPending && <p>Cargando vehículos…</p>}
      {vehiculos.isError && <MensajeError mensaje={obtenerMensajeError(vehiculos.error)} />}
      {vehiculos.data && vehiculos.data.length === 0 && <p>Todavía no tenés vehículos.</p>}

      {vehiculos.data && vehiculos.data.length > 0 && (
        <ul className={estilos.lista}>
          {vehiculos.data.map((vehiculo) => (
            <li key={vehiculo.id} className={estilos.item}>
              <span>
                {vehiculo.patente} — {vehiculo.tipo === "AUTO" ? "Auto" : "Moto"}
              </span>
              <button
                type="button"
                className={estilos.botonEliminar}
                onClick={() => baja.mutate(vehiculo.patente)}
                disabled={baja.isPending}
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
