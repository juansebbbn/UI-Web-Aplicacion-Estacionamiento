import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAutenticacion } from "../contextos/useAutenticacion";
import { ROL_USUARIO } from "../tipos/roles";
import estilos from "./Layout.module.css";

export function Layout() {
  const { usuario, tieneRol, cerrarSesion } = useAutenticacion();
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
      <nav className={estilos.navegacion}>
        {tieneRol(ROL_USUARIO) && (
          <>
            <Link to="/estacionamiento">Mi estacionamiento</Link>
            <Link to="/vehiculos">Vehículos</Link>
            <Link to="/historial">Historial</Link>
          </>
        )}
        <Link to="/lineas">Líneas de colectivo</Link>
      </nav>
      <main className={estilos.contenido}>
        <Outlet />
      </main>
    </div>
  );
}
