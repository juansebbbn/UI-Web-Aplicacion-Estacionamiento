import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listarMultasPropias, pagarMulta } from "../api/multas";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { useToasts } from "../contextos/contextoToasts";
import { formatearFecha, formatearMonto } from "../utils/formato";
import estilos from "./Multas.module.css";

export function Multas() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useToasts();
  const multas = useQuery({ queryKey: ["multas"], queryFn: listarMultasPropias });

  const pagar = useMutation({
    mutationFn: pagarMulta,
    onSuccess: (multa) => {
      mostrarExito(`Multa pagada: ${formatearMonto(multa.precio)}.`);
      queryClient.invalidateQueries({ queryKey: ["multas"] });
      queryClient.invalidateQueries({ queryKey: ["perfil"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  return (
    <section>
      <h2 className={estilos.tituloPagina}>Multas</h2>

      {multas.isPending && <p>Cargando multas…</p>}
      {multas.isError && <MensajeError mensaje={obtenerMensajeError(multas.error)} />}
      {multas.data && multas.data.length === 0 && <p className={estilos.ayuda}>No tenés multas registradas.</p>}

      {multas.data && multas.data.length > 0 && (
        <ul className={estilos.lista}>
          {multas.data.map((multa) => (
            <li key={multa.id} className={estilos.item}>
              <div className={estilos.itemEncabezado}>
                <div>
                  <p className={estilos.razon}>{multa.razon}</p>
                  <p className={estilos.detalle}>
                    {formatearFecha(multa.fecha)}
                    {multa.patente ? ` · ${multa.patente}` : ""}
                  </p>
                </div>
                <span className={estilos.precio}>{formatearMonto(multa.precio)}</span>
              </div>

              <div className={estilos.pie}>
                {multa.revocada && <span className={estilos.insigniaRevocada}>Revocada</span>}
                {!multa.revocada && multa.fuePagada && (
                  <span className={estilos.insigniaPagada}>
                    Pagada {multa.fechaPago ? `el ${formatearFecha(multa.fechaPago)}` : ""}
                  </span>
                )}
                {!multa.revocada && !multa.fuePagada && (
                  <>
                    <span className={estilos.insigniaPendiente}>Pendiente</span>
                    <button
                      type="button"
                      className={estilos.botonPagar}
                      onClick={() => pagar.mutate(multa.id)}
                      disabled={pagar.isPending}
                    >
                      {pagar.isPending ? "Pagando..." : "Pagar"}
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
