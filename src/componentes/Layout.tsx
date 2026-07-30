import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import { useAutenticacion } from "../contextos/useAutenticacion";
import { estaEnModoDemo } from "../api/modoDemo";
import { ROL_ADMINISTRADOR, ROL_INSPECTOR, ROL_USUARIO } from "../tipos/roles";
import estilos from "./Layout.module.css";

function claseNavLink({ isActive }: NavLinkRenderProps): string {
  return isActive ? `${estilos.navLink} ${estilos.navLinkActivo}` : estilos.navLink;
}

export function Layout() {
  const { usuario, tieneRol, cerrarSesion } = useAutenticacion();
  const navegar = useNavigate();

  async function manejarCerrarSesion() {
    await cerrarSesion();
    navegar("/login", { replace: true });
  }

  return (
    <div className={estilos.pagina}>
      {/* import.meta.env.DEV repetido a proposito (estaEnModoDemo ya lo chequea):
          escrito aca literal, el bundler puede probar que la rama es muerta y
          sacar el string del build de produccion (verificado con `npm run build`). */}
      {import.meta.env.DEV && estaEnModoDemo() && (
        <p className={estilos.avisoDemo}>MODO DEMO — datos ficticios, no hay backend real detrás.</p>
      )}
      <header className={estilos.encabezado}>
        <div className={estilos.encabezadoInterior}>
          <Link to="/" className={estilos.marca}>
            <span className={estilos.logo}>P</span>
            <span className={estilos.titulo}>Estacionamiento Tandil</span>
          </Link>
          <div className={estilos.usuario}>
            <div className={estilos.usuarioInfo}>
              <span className={estilos.usuarioNombre}>{usuario?.username}</span>
              <span className={estilos.roles}>
                {usuario?.roles.map((rol) => rol.replace("ROLE_", "")).join(" · ")}
              </span>
            </div>
            <button type="button" className={estilos.botonSalir} onClick={manejarCerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <nav className={estilos.navegacion}>
        <div className={estilos.navegacionInterior}>
          {tieneRol(ROL_USUARIO) && (
            <>
              <NavLink to="/estacionamiento" className={claseNavLink}>
                Mi estacionamiento
              </NavLink>
              <NavLink to="/vehiculos" className={claseNavLink}>
                Vehículos
              </NavLink>
              <NavLink to="/historial" className={claseNavLink}>
                Historial
              </NavLink>
            </>
          )}
          {tieneRol(ROL_INSPECTOR) && (
            <NavLink to="/inspeccion" className={claseNavLink}>
              Inspección
            </NavLink>
          )}
          {tieneRol(ROL_ADMINISTRADOR) && (
            <NavLink to="/admin" className={claseNavLink}>
              Administración
            </NavLink>
          )}
          <NavLink to="/lineas" className={claseNavLink}>
            Líneas de colectivo
          </NavLink>
        </div>
      </nav>
      <main className={estilos.contenido}>
        <div className={estilos.contenidoInterior}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
