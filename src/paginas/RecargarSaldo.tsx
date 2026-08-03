import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { obtenerPerfilPropio, recargarSaldoPropio } from "../api/usuarios";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { useToasts } from "../contextos/contextoToasts";
import { formatearMonto } from "../utils/formato";
import estilos from "./RecargarSaldo.module.css";

const MONTOS_SUGERIDOS = [1000, 2000, 5000, 10000];

export function RecargarSaldo() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useToasts();
  const perfil = useQuery({ queryKey: ["perfil"], queryFn: obtenerPerfilPropio });

  const [monto, setMonto] = useState<number | "">("");

  const recarga = useMutation({
    mutationFn: recargarSaldoPropio,
    onSuccess: (usuario) => {
      mostrarExito(`Recarga acreditada. Nuevo saldo: ${formatearMonto(usuario.saldo)}.`);
      setMonto("");
      queryClient.invalidateQueries({ queryKey: ["perfil"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  function manejarSubmit(evento: FormEvent) {
    evento.preventDefault();
    if (!monto || monto <= 0) return;
    recarga.mutate({ monto });
  }

  return (
    <section>
      <h2 className={estilos.tituloPagina}>Recargar saldo</h2>

      <div className={estilos.tarjetaSaldo}>
        <span className={estilos.etiqueta}>Saldo actual</span>
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
      </div>

      <div className={estilos.tarjetaFormulario}>
        <h3 className={estilos.tituloTarjeta}>Elegí un monto</h3>

        <div className={estilos.montosSugeridos}>
          {MONTOS_SUGERIDOS.map((sugerido) => (
            <button
              key={sugerido}
              type="button"
              className={monto === sugerido ? `${estilos.chip} ${estilos.chipActivo}` : estilos.chip}
              onClick={() => setMonto(sugerido)}
            >
              {formatearMonto(sugerido)}
            </button>
          ))}
        </div>

        <form className={estilos.formulario} onSubmit={manejarSubmit}>
          <label className={estilos.campo}>
            Otro monto
            <input
              type="number"
              min={1}
              step="0.01"
              value={monto}
              onChange={(evento) => setMonto(evento.target.value === "" ? "" : Number(evento.target.value))}
              placeholder="0.00"
            />
          </label>
          <button
            type="submit"
            className={estilos.botonRecargar}
            disabled={!monto || monto <= 0 || recarga.isPending}
          >
            {recarga.isPending ? "Recargando..." : "Recargar saldo"}
          </button>
        </form>

        <p className={estilos.aviso}>
          Por ahora la recarga se acredita directo, sin pasarela de pago real: todavía no está integrado
          un medio de pago. Es una simulación para poder probar el flujo.
        </p>
      </div>
    </section>
  );
}
