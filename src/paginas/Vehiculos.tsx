import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  darDeAltaVehiculo,
  eliminarVehiculo,
  listarVehiculosPropios,
  subirDocumentacionVehiculo,
} from "../api/vehiculos";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { useToasts } from "../contextos/contextoToasts";
import type { TipoVehiculo } from "../tipos/vehiculo";
import estilos from "./Vehiculos.module.css";

// Cuanto se queda visible el panel "Aprobado" antes de volver a mostrar el
// formulario vacío, listo para cargar otro vehículo.
const DURACION_APROBADO_MS = 2500;

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
  const [tarjetaVehiculo, setTarjetaVehiculo] = useState<File | null>(null);
  const [dni, setDni] = useState<File | null>(null);
  const [fotoFrente, setFotoFrente] = useState<File | null>(null);
  const [aprobado, setAprobado] = useState(false);

  const alta = useMutation({
    // Dos pasos: el alta en si (JSON, como antes) y despues la documentacion
    // (multipart) contra la patente recien creada — recien ahi existe el
    // vehiculo al que asociar los archivos. El backend no hace nada con ellos
    // todavia (ver VehiculoControlador.subirDocumentacion): esto es solo para
    // que la UI muestre el flujo de "enviando" -> "aprobado".
    mutationFn: async () => {
      const vehiculo = await darDeAltaVehiculo({ patente: patente.toUpperCase(), tipo });
      await subirDocumentacionVehiculo(vehiculo.patente, {
        tarjetaVehiculo: tarjetaVehiculo as File,
        dni: dni as File,
        fotoFrente: fotoFrente as File,
      });
      return vehiculo;
    },
    onSuccess: (vehiculo) => {
      mostrarExito(`Vehículo ${vehiculo.patente} agregado.`);
      queryClient.invalidateQueries({ queryKey: ["vehiculos"] });
      setAprobado(true);
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  // Vuelve al formulario vacío despues de mostrar "Aprobado" un rato.
  useEffect(() => {
    if (!aprobado) return;
    const id = setTimeout(() => {
      setAprobado(false);
      setPatente("");
      setTipo("AUTO");
      setTarjetaVehiculo(null);
      setDni(null);
      setFotoFrente(null);
    }, DURACION_APROBADO_MS);
    return () => clearTimeout(id);
  }, [aprobado]);

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
    if (!tarjetaVehiculo || !dni || !fotoFrente) return;
    alta.mutate();
  }

  function manejarArchivo(setter: (archivo: File | null) => void) {
    return (evento: ChangeEvent<HTMLInputElement>) => setter(evento.target.files?.[0] ?? null);
  }

  return (
    <section>
      <h2 className={estilos.tituloPagina}>Mis vehículos</h2>

      <div className={estilos.tarjetaFormulario}>
        <h3 className={estilos.tituloTarjeta}>Agregar vehículo</h3>

        {aprobado ? (
          <div className={estilos.panelAprobado}>
            <span className={estilos.iconoAprobado} aria-hidden="true">
              ✓
            </span>
            <p>Documentación aprobada. Vehículo agregado correctamente.</p>
          </div>
        ) : (
          <form className={estilos.formulario} onSubmit={manejarAlta}>
            <label className={estilos.campo}>
              Patente
              <input
                value={patente}
                onChange={(evento) => setPatente(evento.target.value)}
                required
                pattern="[A-Za-z0-9]{6,10}"
                title="Entre 6 y 10 caracteres alfanuméricos"
                disabled={alta.isPending}
              />
            </label>
            <label className={estilos.campo}>
              Tipo
              <select
                value={tipo}
                onChange={(evento) => setTipo(evento.target.value as TipoVehiculo)}
                disabled={alta.isPending}
              >
                <option value="AUTO">Auto</option>
                <option value="MOTO">Moto</option>
              </select>
            </label>
            <div className={estilos.camposArchivo}>
              <label className={estilos.campo}>
                Tarjeta verde o azul
                <input
                  type="file"
                  accept="image/*"
                  required
                  disabled={alta.isPending}
                  onChange={manejarArchivo(setTarjetaVehiculo)}
                />
              </label>
              <label className={estilos.campo}>
                DNI
                <input
                  type="file"
                  accept="image/*"
                  required
                  disabled={alta.isPending}
                  onChange={manejarArchivo(setDni)}
                />
              </label>
              <label className={estilos.campo}>
                Foto delantera del auto
                <input
                  type="file"
                  accept="image/*"
                  required
                  disabled={alta.isPending}
                  onChange={manejarArchivo(setFotoFrente)}
                />
              </label>
            </div>
            <button type="submit" className={estilos.botonAgregar} disabled={alta.isPending}>
              {alta.isPending && <span className={estilos.spinner} aria-hidden="true" />}
              {alta.isPending ? "Enviando documentación..." : "Agregar vehículo"}
            </button>
          </form>
        )}
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
