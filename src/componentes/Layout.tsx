import { Outlet, useNavigate } from "react-router-dom";
import { useAutenticacion } from "../contextos/useAutenticacion";
import estilos from "./Layout.module.css";

export function Layout() {
  const { usuario, cerrarSesion } = useAutenticacion();
  const navegar = useNavigate();

  async function manejarCerrarSesion() {
    await cerrarSesion();
    navegar("/login", { replace: true });
  }

  return (
    <div>
      <header className={estilos.encabezado}>
        <h1 className={estilos.titulo}>Estacionamiento Tandil</h1>
        <div className={estilos.usuario}>
          <span>
            {usuario?.username}{" "}
            <span className={estilos.roles}>
              ({usuario?.roles.map((rol) => rol.replace("ROLE_", "")).join(", ")})
            </span>
          </span>
          <button type="button" className={estilos.botonSalir} onClick={manejarCerrarSesion}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className={estilos.contenido}>
        <Outlet />
      </main>
    </div>
  );
}
