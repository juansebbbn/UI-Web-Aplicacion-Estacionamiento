import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { inspeccionarPatente } from "../api/sesiones";
import { crearMultaAdmin } from "../api/multas";
import { obtenerMensajeError } from "../api/errores";
import { useToasts } from "../contextos/contextoToasts";
import { formatearFecha } from "../utils/formato";
import estilos from "./Inspeccion.module.css";

export function Inspeccion() {
  const [patente, setPatente] = useState("");
  const { mostrarExito, mostrarError } = useToasts();

  const consulta = useMutation({
    mutationFn: inspeccionarPatente,
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  const [mostrarFormularioMulta, setMostrarFormularioMulta] = useState(false);
  const [precioMulta, setPrecioMulta] = useState("");
  const [razonMulta, setRazonMulta] = useState("");

  const multar = useMutation({
    mutationFn: crearMultaAdmin,
    onSuccess: (multa) => {
      mostrarExito(
        multa.vehiculoRegistrado
          ? `Multa creada para ${multa.patente} (${multa.username}).`
          : `Multa creada para ${multa.patente} (patente no registrada todavía).`,
      );
      setMostrarFormularioMulta(false);
      setPrecioMulta("");
      setRazonMulta("");
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    if (!patente) return;
    setMostrarFormularioMulta(false);
    consulta.mutate(patente.toUpperCase());
  }

  function manejarMulta(evento: FormEvent) {
    evento.preventDefault();
    const precioNumerico = Number(precioMulta);
    if (!consulta.data || !precioNumerico || !razonMulta.trim()) return;
    multar.mutate({ patente: consulta.data.patente, precio: precioNumerico, razon: razonMulta.trim() });
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

          {!mostrarFormularioMulta && (
            <button
              type="button"
              className={estilos.botonMultar}
              onClick={() => setMostrarFormularioMulta(true)}
            >
              Multar
            </button>
          )}

          {mostrarFormularioMulta && (
            <form className={estilos.formularioMulta} onSubmit={manejarMulta}>
              <label className={estilos.campoMulta}>
                Precio
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={precioMulta}
                  onChange={(evento) => setPrecioMulta(evento.target.value)}
                  placeholder="ej. 5000"
                  required
                />
              </label>
              <label className={estilos.campoMulta}>
                Razón
                <input
                  value={razonMulta}
                  onChange={(evento) => setRazonMulta(evento.target.value)}
                  placeholder="ej. estacionar sin pagar"
                  required
                />
              </label>
              <div className={estilos.accionesMulta}>
                <button type="submit" className={estilos.botonMultar} disabled={multar.isPending}>
                  {multar.isPending ? "Multando..." : "Confirmar multa"}
                </button>
                <button
                  type="button"
                  className={estilos.botonCancelarMulta}
                  onClick={() => setMostrarFormularioMulta(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
