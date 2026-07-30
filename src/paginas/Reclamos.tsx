import { useState, type FormEvent } from "react";
import { useToasts } from "../contextos/contextoToasts";
import { formatearFecha } from "../utils/formato";
import estilos from "./Reclamos.module.css";

type MotivoReclamo = "COBRO" | "ZONA" | "APP" | "OTRO";

const ETIQUETA_MOTIVO: Record<MotivoReclamo, string> = {
  COBRO: "Cobro incorrecto",
  ZONA: "Zona / señalización",
  APP: "Problema con la app",
  OTRO: "Otro",
};

interface ReclamoLocal {
  id: number;
  motivo: MotivoReclamo;
  descripcion: string;
  fecha: string;
}

// Solo UI por ahora: el reclamo no viaja a ningún backend (no existe
// todavía un endpoint para esto). Se guarda en estado local del
// componente nada más, para poder ver el formulario funcionando — a
// definir más adelante a dónde va este dato en producción.
export function Reclamos() {
  const { mostrarExito } = useToasts();
  const [motivo, setMotivo] = useState<MotivoReclamo>("COBRO");
  const [descripcion, setDescripcion] = useState("");
  const [enviados, setEnviados] = useState<ReclamoLocal[]>([]);

  function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    const nuevo: ReclamoLocal = {
      id: Date.now(),
      motivo,
      descripcion: descripcion.trim(),
      fecha: new Date().toISOString(),
    };
    setEnviados((actuales) => [nuevo, ...actuales]);
    setDescripcion("");
    setMotivo("COBRO");
    mostrarExito("Reclamo enviado. Por ahora queda solo en esta sesión, todavía no está conectado a ningún sistema.");
  }

  return (
    <section>
      <h2 className={estilos.tituloPagina}>Reclamos</h2>
      <p className={estilos.ayuda}>
        Contanos qué pasó y lo vamos a revisar. Podés cargar más de un reclamo si hace falta.
      </p>

      <div className={estilos.tarjetaFormulario}>
        <h3 className={estilos.tituloTarjeta}>Nuevo reclamo</h3>
        <form className={estilos.formulario} onSubmit={manejarEnvio}>
          <label className={estilos.campo}>
            Motivo
            <select value={motivo} onChange={(evento) => setMotivo(evento.target.value as MotivoReclamo)}>
              {(Object.keys(ETIQUETA_MOTIVO) as MotivoReclamo[]).map((clave) => (
                <option key={clave} value={clave}>
                  {ETIQUETA_MOTIVO[clave]}
                </option>
              ))}
            </select>
          </label>
          <label className={estilos.campo}>
            Descripción
            <textarea
              value={descripcion}
              onChange={(evento) => setDescripcion(evento.target.value)}
              required
              minLength={10}
              rows={4}
              placeholder="Contanos el detalle del reclamo…"
            />
          </label>
          <button type="submit" className={estilos.boton}>
            Enviar reclamo
          </button>
        </form>
      </div>

      {enviados.length > 0 && (
        <>
          <h3 className={estilos.tituloSeccion}>Reclamos de esta sesión</h3>
          <ul className={estilos.lista}>
            {enviados.map((reclamo) => (
              <li key={reclamo.id} className={estilos.item}>
                <div className={estilos.itemEncabezado}>
                  <span className={estilos.insigniaMotivo}>{ETIQUETA_MOTIVO[reclamo.motivo]}</span>
                  <span className={estilos.fecha}>{formatearFecha(reclamo.fecha)}</span>
                </div>
                <p className={estilos.descripcion}>{reclamo.descripcion}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
