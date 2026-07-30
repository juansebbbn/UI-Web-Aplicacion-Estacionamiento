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
import { formatearFecha, formatearMonto } from "../utils/formato";
import type { Coordenada } from "../tipos/comun";
import type { SesionRespuesta } from "../tipos/sesion";
import estilos from "./DashboardUsuario.module.css";

export function DashboardUsuario() {
  const queryClient = useQueryClient();
  const perfil = useQuery({ queryKey: ["perfil"], queryFn: obtenerPerfilPropio });
  const zonas = useQuery({ queryKey: ["zonas"], queryFn: listarZonas });
  const sesiones = useQuery({ queryKey: ["sesiones"], queryFn: listarSesionesPropias });
  const vehiculos = useQuery({ queryKey: ["vehiculos"], queryFn: listarVehiculosPropios });

  const sesionActiva = sesiones.data?.find((sesion) => sesion.estado === "ACTIVA") ?? null;

  const [patenteSeleccionada, setPatenteSeleccionada] = useState("");
  const [coordenadaSeleccionada, setCoordenadaSeleccionada] = useState<Coordenada | null>(null);
  const [errorGeolocalizacion, setErrorGeolocalizacion] = useState<string | null>(null);
  const [errorIniciar, setErrorIniciar] = useState<string | null>(null);
  const [errorFinalizar, setErrorFinalizar] = useState<string | null>(null);
  const [ultimaFinalizada, setUltimaFinalizada] = useState<SesionRespuesta | null>(null);

  const verificacion = useQuery({
    queryKey: ["verificacion-zona", coordenadaSeleccionada],
    queryFn: () => verificarCoordenada(coordenadaSeleccionada as Coordenada),
    enabled: coordenadaSeleccionada !== null,
  });

  const iniciar = useMutation({
    mutationFn: iniciarSesionEstacionamiento,
    onSuccess: () => {
      setCoordenadaSeleccionada(null);
      queryClient.invalidateQueries({ queryKey: ["sesiones"] });
    },
  });

  const finalizar = useMutation({
    mutationFn: finalizarSesionEstacionamiento,
    onSuccess: (sesion) => {
      setUltimaFinalizada(sesion);
      queryClient.invalidateQueries({ queryKey: ["sesiones"] });
      queryClient.invalidateQueries({ queryKey: ["perfil"] });
    },
  });

  async function manejarIniciar() {
    if (!patenteSeleccionada || !coordenadaSeleccionada) return;
    setErrorIniciar(null);
    try {
      await iniciar.mutateAsync({ patente: patenteSeleccionada, coordenada: coordenadaSeleccionada });
    } catch (err) {
      setErrorIniciar(obtenerMensajeError(err));
    }
  }

  async function manejarFinalizar() {
    if (!sesionActiva) return;
    setErrorFinalizar(null);
    try {
      await finalizar.mutateAsync(sesionActiva.id);
    } catch (err) {
      setErrorFinalizar(obtenerMensajeError(err));
    }
  }

  function usarMiUbicacion() {
    setErrorGeolocalizacion(null);
    if (!navigator.geolocation) {
      setErrorGeolocalizacion("Tu navegador no soporta geolocalización.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        setCoordenadaSeleccionada({ latitud: posicion.coords.latitude, longitud: posicion.coords.longitude });
      },
      () => setErrorGeolocalizacion("No se pudo obtener tu ubicación."),
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

      {ultimaFinalizada && (
        <p className={estilos.resultadoExito}>
          Sesión de {ultimaFinalizada.patente} finalizada. Se cobraron{" "}
          {ultimaFinalizada.montoCobrado !== null ? formatearMonto(ultimaFinalizada.montoCobrado) : "—"}.
        </p>
      )}

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
          <button type="button" className={estilos.boton} onClick={manejarFinalizar} disabled={finalizar.isPending}>
            {finalizar.isPending ? "Finalizando..." : "Finalizar sesión"}
          </button>
          <MensajeError mensaje={errorFinalizar} />
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
          <MensajeError mensaje={errorGeolocalizacion} />

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
          <MensajeError mensaje={errorIniciar} />
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
