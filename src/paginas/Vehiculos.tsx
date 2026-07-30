import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { darDeAltaVehiculo, eliminarVehiculo, listarVehiculosPropios } from "../api/vehiculos";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import type { TipoVehiculo } from "../tipos/vehiculo";
import estilos from "./Vehiculos.module.css";

export function Vehiculos() {
  const queryClient = useQueryClient();
  const vehiculos = useQuery({ queryKey: ["vehiculos"], queryFn: listarVehiculosPropios });

  const [patente, setPatente] = useState("");
  const [tipo, setTipo] = useState<TipoVehiculo>("AUTO");
  const [errorAlta, setErrorAlta] = useState<string | null>(null);
  const [errorBaja, setErrorBaja] = useState<string | null>(null);

  const alta = useMutation({
    mutationFn: darDeAltaVehiculo,
    onSuccess: () => {
      setPatente("");
      queryClient.invalidateQueries({ queryKey: ["vehiculos"] });
    },
  });

  const baja = useMutation({
    mutationFn: eliminarVehiculo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["vehiculos"] }),
  });

  async function manejarAlta(evento: FormEvent) {
    evento.preventDefault();
    setErrorAlta(null);
    try {
      await alta.mutateAsync({ patente: patente.toUpperCase(), tipo });
    } catch (err) {
      setErrorAlta(obtenerMensajeError(err));
    }
  }

  async function manejarBaja(patenteAEliminar: string) {
    setErrorBaja(null);
    try {
      await baja.mutateAsync(patenteAEliminar);
    } catch (err) {
      setErrorBaja(obtenerMensajeError(err));
    }
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
      <MensajeError mensaje={errorAlta} />

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
                onClick={() => manejarBaja(vehiculo.patente)}
                disabled={baja.isPending}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
      <MensajeError mensaje={errorBaja} />
    </section>
  );
}
