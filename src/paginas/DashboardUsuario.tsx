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
import type { ZonaRespuesta } from "../tipos/zona";
import estilos from "./DashboardUsuario.module.css";

// Punto representativo de la zona para no obligar al usuario a tocar el mapa
// o compartir su ubicación: el promedio de los vertices cae dentro del
// polígono para las zonas de esta app (todas convexas, ver V3__sembrar_zona_tandil.sql
// y las sembradas en V6). El backend igual vuelve a verificar con el
// point-in-polygon real (ver ZonaEstacionamiento.contiene).
function centroideDeZona(zona: ZonaRespuesta): Coordenada {
  const cantidad = zona.vertices.length;
  const suma = zona.vertices.reduce(
    (acumulado, vertice) => ({
      latitud: acumulado.latitud + vertice.latitud,
      longitud: acumulado.longitud + vertice.longitud,
    }),
    { latitud: 0, longitud: 0 },
  );
  return { latitud: suma.latitud / cantidad, longitud: suma.longitud / cantidad };
}

export function DashboardUsuario() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useToasts();
  const perfil = useQuery({ queryKey: ["perfil"], queryFn: obtenerPerfilPropio });
  const zonas = useQuery({ queryKey: ["zonas"], queryFn: listarZonas });
  // size grande (no paginado en la UI): esta pantalla solo necesita encontrar
  // la sesion activa, si existe — la paginacion de a 10 es para Historial.tsx.
  const sesiones = useQuery({
    queryKey: ["sesiones", "activa"],
    queryFn: () => listarSesionesPropias({ size: 50, sort: "horaInicio,desc" }),
  });
  const vehiculos = useQuery({ queryKey: ["vehiculos"], queryFn: listarVehiculosPropios });

  const sesionActiva = sesiones.data?.content.find((sesion) => sesion.estado === "ACTIVA") ?? null;

  const [patenteSeleccionada, setPatenteSeleccionada] = useState("");
  const [zonaSeleccionada, setZonaSeleccionada] = useState("");
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
      setZonaSeleccionada("");
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
        setZonaSeleccionada("");
        setCoordenadaSeleccionada({ latitud: posicion.coords.latitude, longitud: posicion.coords.longitude });
      },
      () => mostrarError("No se pudo obtener tu ubicación."),
    );
  }

  function manejarSeleccionZona(idZona: string) {
    setZonaSeleccionada(idZona);
    if (!idZona) {
      setCoordenadaSeleccionada(null);
      return;
    }
    const zona = zonas.data?.find((z) => String(z.id) === idZona);
    if (zona) setCoordenadaSeleccionada(centroideDeZona(zona));
  }

  function manejarClickMapa(coordenada: Coordenada) {
    setZonaSeleccionada("");
    setCoordenadaSeleccionada(coordenada);
  }

  return (
    <section>
      <h2 className={estilos.tituloPagina}>Mi estacionamiento</h2>

      <div className={estilos.filaResumen}>
        <div className={estilos.tarjetaStat}>
          <span className={estilos.etiqueta}>Saldo</span>
          {perfil.isPending && <span className={estilos.cifraHero}>—</span>}
          {perfil.isError && <MensajeError mensaje={obtenerMensajeError(perfil.error)} />}
          {perfil.data && (
            <span
              className={
                perfil.data.saldo < 0 ? `${estilos.cifraHero} ${estilos.cifraNegativa}` : estilos.cifraHero
              }
            >
              {formatearMonto(perfil.data.saldo)}
            </span>
          )}
          <Link to="/recargar-saldo">Recargar saldo</Link>
        </div>

        {sesionActiva && (
          <div className={estilos.tarjetaStat}>
            <span className={estilos.etiqueta}>Tiempo estacionado</span>
            <span className={estilos.cifraHero}>{formatearDuracion(tiempoTranscurridoMs)}</span>
          </div>
        )}

        {sesionActiva && costoEstimado !== null && (
          <div className={estilos.tarjetaStat}>
            <span className={estilos.etiqueta}>Costo estimado</span>
            <span className={estilos.cifraHero}>{formatearMonto(costoEstimado)}</span>
          </div>
        )}
      </div>

      {sesiones.isPending && <p>Cargando sesión…</p>}
      {sesiones.isError && <MensajeError mensaje={obtenerMensajeError(sesiones.error)} />}

      {sesionActiva && (
        <div className={estilos.tarjetaSesion}>
          <div className={estilos.tarjetaSesionEncabezado}>
            <div>
              <p className={estilos.patente}>{sesionActiva.patente}</p>
              <p className={estilos.detalleSesion}>
                {sesionActiva.nombreZona} · Desde {formatearFecha(sesionActiva.horaInicio)}
              </p>
            </div>
            <span className={estilos.insigniaActiva}>Activa</span>
          </div>
          <p className={estilos.notaCosto}>
            El monto final lo calcula el servidor al finalizar la sesión.
          </p>
          <button
            type="button"
            className={estilos.boton}
            onClick={() => finalizar.mutate(sesionActiva.id)}
            disabled={finalizar.isPending}
          >
            {finalizar.isPending ? "Finalizando..." : "Finalizar sesión"}
          </button>
        </div>
      )}

      {!sesionActiva && sesiones.data && (
        <div className={estilos.tarjetaSesion}>
          <h3 className={estilos.tituloTarjeta}>Estacionar</h3>

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
              <label className={estilos.campo}>
                Zona
                <select
                  value={zonaSeleccionada}
                  onChange={(evento) => manejarSeleccionZona(evento.target.value)}
                  disabled={!zonas.data || zonas.data.length === 0}
                >
                  <option value="">Elegí una zona</option>
                  {zonas.data?.map((zona) => (
                    <option key={zona.id} value={zona.id}>
                      {zona.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <button type="button" className={estilos.botonSecundario} onClick={usarMiUbicacion}>
                Usar mi ubicación
              </button>
            </div>
          )}

          <p className={estilos.ayuda}>
            Elegí una zona de la lista, usá tu ubicación, o tocá el mapa donde estacionaste.
          </p>

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

      <h3 className={estilos.tituloSeccion}>Zonas de estacionamiento</h3>
      {zonas.isPending && <p>Cargando zonas…</p>}
      {zonas.isError && <MensajeError mensaje={obtenerMensajeError(zonas.error)} />}
      {zonas.data && (
        <div className={estilos.tarjetaMapa}>
          <MapaZonas
            zonas={zonas.data}
            marcador={!sesionActiva ? coordenadaSeleccionada : null}
            onClickMapa={!sesionActiva ? manejarClickMapa : undefined}
          />
        </div>
      )}
    </section>
  );
}
