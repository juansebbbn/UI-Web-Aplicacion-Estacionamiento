import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { listarLineas } from "../api/lineas";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { useAutenticacion } from "../contextos/useAutenticacion";
import estilos from "./Lineas.module.css";

// Publica: no requiere estar logueado (ver App.tsx, no esta detras de RutaProtegida).
export function Lineas() {
  const { estaAutenticado } = useAutenticacion();
  const lineas = useQuery({ queryKey: ["lineas"], queryFn: listarLineas });

  return (
    <div className={estilos.pagina}>
      <div className={estilos.contenedor}>
        <Link to={estaAutenticado ? "/" : "/login"} className={estilos.volver}>
          ← Volver
        </Link>
        <h1 className={estilos.titulo}>Líneas de colectivo</h1>

        {lineas.isPending && <p>Cargando líneas…</p>}
        {lineas.isError && <MensajeError mensaje={obtenerMensajeError(lineas.error)} />}
        {lineas.data && lineas.data.length === 0 && <p>No hay líneas cargadas.</p>}

        {lineas.data && lineas.data.length > 0 && (
          <ul className={estilos.lista}>
            {lineas.data.map((linea) => (
              <li key={linea.id} className={estilos.item}>
                <span className={estilos.numero} style={{ background: linea.color }}>
                  {linea.numero}
                </span>
                <span className={estilos.nombre}>{linea.nombre}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
