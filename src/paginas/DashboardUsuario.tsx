import { useQuery } from "@tanstack/react-query";
import { obtenerPerfilPropio } from "../api/usuarios";
import { listarZonas } from "../api/zonas";
import { obtenerMensajeError } from "../api/errores";
import { MapaZonas } from "../componentes/MapaZonas";
import { MensajeError } from "../componentes/MensajeError";
import { formatearMonto } from "../utils/formato";
import estilos from "./DashboardUsuario.module.css";

export function DashboardUsuario() {
  const perfil = useQuery({ queryKey: ["perfil"], queryFn: obtenerPerfilPropio });
  const zonas = useQuery({ queryKey: ["zonas"], queryFn: listarZonas });

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

      <h3>Zonas de estacionamiento</h3>
      {zonas.isPending && <p>Cargando zonas…</p>}
      {zonas.isError && <MensajeError mensaje={obtenerMensajeError(zonas.error)} />}
      {zonas.data && <MapaZonas zonas={zonas.data} />}
    </section>
  );
}
