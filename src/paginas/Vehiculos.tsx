import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { darDeAltaVehiculo, eliminarVehiculo, listarVehiculosPropios } from "../api/vehiculos";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { useToasts } from "../contextos/contextoToasts";
import type { TipoVehiculo } from "../tipos/vehiculo";
import estilos from "./Vehiculos.module.css";

function IconoVehiculo({ tipo }: { tipo: TipoVehiculo }) {
  if (tipo === "MOTO") {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="5" cy="17" r="3" />
        <circle cx="19" cy="17" r="3" />
        <path d="M5 17 9 9h4l2 4h4M9 9 7 5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M4 16v-4l2-5a2 2 0 0 1 2-1h8a2 2 0 0 1 2 1l2 5v4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 16h16v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
      <circle cx="7.5" cy="16" r="1.2" />
      <circle cx="16.5" cy="16" r="1.2" />
    </svg>
  );
}

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
      <h2 className={estilos.tituloPagina}>Mis vehículos</h2>

      <div className={estilos.tarjetaFormulario}>
        <h3 className={estilos.tituloTarjeta}>Agregar vehículo</h3>
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
      </div>

      {vehiculos.isPending && <p>Cargando vehículos…</p>}
      {vehiculos.isError && <MensajeError mensaje={obtenerMensajeError(vehiculos.error)} />}
      {vehiculos.data && vehiculos.data.length === 0 && <p>Todavía no tenés vehículos.</p>}

      {vehiculos.data && vehiculos.data.length > 0 && (
        <ul className={estilos.lista}>
          {vehiculos.data.map((vehiculo) => (
            <li key={vehiculo.id} className={estilos.item}>
              <span className={estilos.icono}>
                <IconoVehiculo tipo={vehiculo.tipo} />
              </span>
              <div className={estilos.datos}>
                <span className={estilos.patente}>{vehiculo.patente}</span>
                <span className={estilos.tipo}>{vehiculo.tipo === "AUTO" ? "Auto" : "Moto"}</span>
              </div>
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
