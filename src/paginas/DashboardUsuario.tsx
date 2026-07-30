import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { obtenerPerfilPropio } from "../api/usuarios";
import { listarZonas, verificarCoordenada } from "../api/zonas";
import { listarVehiculosPropios } from "../api/vehiculos";
import {
  finalizarSesionEstacionamiento,
  iniciarSesionEstacionamiento,
  listarSesionesPropias,
} from "../api/sesiones";
import { obtenerMensajeError } from "../api/errores";
import { MapaZonas } from "../componentes/MapaZonas";
import { MensajeError } from "../componentes/MensajeError";
import { useToasts } from "../contextos/contextoToasts";
import { formatearDuracion, formatearFecha, formatearMonto } from "../utils/formato";
import { useTiempoTranscurrido } from "../utils/useTiempoTranscurrido";
import type { Coordenada } from "../tipos/comun";
import estilos from "./DashboardUsuario.module.css";

export function DashboardUsuario() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useToasts();
  const perfil = useQuery({ queryKey: ["perfil"], queryFn: obtenerPerfilPropio });
  const zonas = useQuery({ queryKey: ["zonas"], queryFn: listarZonas });
  const sesiones = useQuery({ queryKey: ["sesiones"], queryFn: listarSesionesPropias });
  const vehiculos = useQuery({ queryKey: ["vehiculos"], queryFn: listarVehiculosPropios });

  const sesionActiva = sesiones.data?.find((sesion) => sesion.estado === "ACTIVA") ?? null;

  const [patenteSeleccionada, setPatenteSeleccionada] = useState("");
  const [coordenadaSeleccionada, setCoordenadaSeleccionada] = useState<Coordenada | null>(null);

  // Siempre se llama (regla de los hooks): sin sesion activa, el resultado
  // no se usa en ningun lado.
  const tiempoTranscurridoMs = useTiempoTranscurrido(sesionActiva?.horaInicio ?? new Date().toISOString());
  const tarifaZonaActiva = zonas.data?.find((zona) => zona.nombre === sesionActiva?.nombreZona)?.tarifaPorMinuto;
  const costoEstimado =
    sesionActiva && tarifaZonaActiva !== undefined ? (tiempoTranscurridoMs / 60_000) * tarifaZonaActiva : null;

  const verificacion = useQuery({
    queryKey: ["verificacion-zona", coordenadaSeleccionada],
    queryFn: () => verificarCoordenada(coordenadaSeleccionada as Coordenada),
    enabled: coordenadaSeleccionada !== null,
  });

  const iniciar = useMutation({
    mutationFn: iniciarSesionEstacionamiento,
    onSuccess: () => {
      setCoordenadaSeleccionada(null);
      mostrarExito("Sesión de estacionamiento iniciada.");
      queryClient.invalidateQueries({ queryKey: ["sesiones"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  const finalizar = useMutation({
    mutationFn: finalizarSesionEstacionamiento,
    onSuccess: (sesion) => {
      mostrarExito(
        `Sesión de ${sesion.patente} finalizada. Se cobraron ${
          sesion.montoCobrado !== null ? formatearMonto(sesion.montoCobrado) : "—"
        }.`,
      );
      queryClient.invalidateQueries({ queryKey: ["sesiones"] });
      queryClient.invalidateQueries({ queryKey: ["perfil"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  function manejarIniciar() {
    if (!patenteSeleccionada || !coordenadaSeleccionada) return;
    iniciar.mutate({ patente: patenteSeleccionada, coordenada: coordenadaSeleccionada });
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) {
      mostrarError("Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        setCoordenadaSeleccionada({ latitud: posicion.coords.latitude, longitud: posicion.coords.longitude });
      },
      () => mostrarError("No se pudo obtener tu ubicación."),
    );
  }

  return (
    <section>
      <h2>Mi estacionamiento</h2>

      <div className={estilos.saldo}>
        <span>Saldo:</span>
        {perfil.isPending && <span>Cargando…</span>}
        {perfil.isError && <MensajeError mensaje={obtenerMensajeError(perfil.error)} />}
        {perfil.data && (
          <span
            className={perfil.data.saldo < 0 ? `${estilos.saldoMonto} ${estilos.saldoNegativo}` : estilos.saldoMonto}
          >
            {formatearMonto(perfil.data.saldo)}
          </span>
        )}
      </div>

      {sesiones.isPending && <p>Cargando sesión…</p>}
      {sesiones.isError && <MensajeError mensaje={obtenerMensajeError(sesiones.error)} />}

      {sesionActiva && (
        <div className={estilos.tarjetaSesion}>
          <h3>Sesión activa</h3>
          <p>
            {sesionActiva.patente} — {sesionActiva.nombreZona}
            <br />
            Desde: {formatearFecha(sesionActiva.horaInicio)}
          </p>
          <p className={estilos.cronometro}>{formatearDuracion(tiempoTranscurridoMs)}</p>
          {costoEstimado !== null && (
            <p className={estilos.costoEstimado}>
              Costo estimado: {formatearMonto(costoEstimado)} (el monto final lo calcula el servidor al finalizar)
            </p>
          )}
          <button type="button" className={estilos.boton} onClick={() => finalizar.mutate(sesionActiva.id)} disabled={finalizar.isPending}>
            {finalizar.isPending ? "Finalizando..." : "Finalizar sesión"}
          </button>
        </div>
      )}

      {!sesionActiva && sesiones.data && (
        <div className={estilos.tarjetaSesion}>
          <h3>Estacionar</h3>

          {vehiculos.data && vehiculos.data.length === 0 && (
            <p>
              Todavía no tenés vehículos. <Link to="/vehiculos">Dar de alta uno</Link>.
            </p>
          )}

          {vehiculos.data && vehiculos.data.length > 0 && (
            <div className={estilos.controles}>
              <label className={estilos.campo}>
                Vehículo
                <select
                  value={patenteSeleccionada}
                  onChange={(evento) => setPatenteSeleccionada(evento.target.value)}
                >
                  <option value="">Elegí un vehículo</option>
                  {vehiculos.data.map((vehiculo) => (
                    <option key={vehiculo.id} value={vehiculo.patente}>
                      {vehiculo.patente} ({vehiculo.tipo === "AUTO" ? "Auto" : "Moto"})
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className={estilos.botonSecundario} onClick={usarMiUbicacion}>
                Usar mi ubicación
              </button>
            </div>
          )}

          <p>Tocá el mapa donde estacionaste para elegir el lugar.</p>

          {coordenadaSeleccionada && (
            <p className={estilos.mensajeVerificacion}>
              {verificacion.isPending && "Verificando zona…"}
              {verificacion.data?.dentroDeZona && (
                <span className={estilos.dentroDeZona}>Dentro de la zona "{verificacion.data.nombreZona}".</span>
              )}
              {verificacion.data && !verificacion.data.dentroDeZona && (
                <span className={estilos.fueraDeZona}>Ese punto está fuera de cualquier zona de estacionamiento.</span>
              )}
            </p>
          )}

          <button
            type="button"
            className={estilos.boton}
            onClick={manejarIniciar}
            disabled={
              !patenteSeleccionada || !verificacion.data?.dentroDeZona || iniciar.isPending
            }
          >
            {iniciar.isPending ? "Iniciando..." : "Estacionar acá"}
          </button>
        </div>
      )}

      <h3>Zonas de estacionamiento</h3>
      {zonas.isPending && <p>Cargando zonas…</p>}
      {zonas.isError && <MensajeError mensaje={obtenerMensajeError(zonas.error)} />}
      {zonas.data && (
        <MapaZonas
          zonas={zonas.data}
          marcador={!sesionActiva ? coordenadaSeleccionada : null}
          onClickMapa={!sesionActiva ? setCoordenadaSeleccionada : undefined}
        />
      )}
    </section>
  );
}
