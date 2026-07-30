import { Outlet } from "react-router-dom";
import { useAutenticacion } from "../contextos/useAutenticacion";
import { ConmutadorTema } from "./ConmutadorTema";
import { Layout } from "./Layout";
import estilos from "./EnvoltorioLineas.module.css";

// "/lineas" es pública (accesible sin login, ver App.tsx), pero si quien la
// visita ya tiene sesión iniciada queremos que se vea dentro del Layout de
// siempre (sidebar + topbar) en vez de como una página suelta aparte — eso
// era lo que generaba el salto a una pantalla distinta al clickear el link
// del sidebar. Sin sesión, cae al wrapper standalone de más abajo (mismo
// toggle de tema flotante que login/registro).
export function EnvoltorioLineas() {
  const { estaAutenticado } = useAutenticacion();

  if (estaAutenticado) {
    return <Layout />;
  }

  return (
    <div className={estilos.pagina}>
      <ConmutadorTema variante="flotante" />
      <div className={estilos.contenedor}>
        <Outlet />
      </div>
    </div>
  );
}
