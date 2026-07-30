import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import { useAutenticacion } from "../contextos/useAutenticacion";
import { estaEnModoDemo } from "../api/modoDemo";
import { ConmutadorTema } from "./ConmutadorTema";
import { ROL_ADMINISTRADOR, ROL_USUARIO } from "../tipos/roles";
import estilos from "./Layout.module.css";

function claseNavLink({ isActive }: NavLinkRenderProps): string {
  return isActive ? `${estilos.navLink} ${estilos.navLinkActivo}` : estilos.navLink;
}

function IconoMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
    </svg>
  );
}

function IconoEstacionamiento() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  );
}

function IconoVehiculos() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M4 16v-4l2-5a2 2 0 0 1 2-1h8a2 2 0 0 1 2 1l2 5v4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M4 16h16v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H8v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
      <circle cx="7.5" cy="16" r="1.2" />
      <circle cx="16.5" cy="16" r="1.2" />
    </svg>
  );
}

function IconoHistorial() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconoInspeccion() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m20 20-4.35-4.35" strokeLinecap="round" />
    </svg>
  );
}

function IconoAdministracion() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path
        d="M19.4 13a7.7 7.7 0 0 0 0-2l2-1.5-2-3.4-2.3.9a7.7 7.7 0 0 0-1.7-1L15 3.5h-4l-.4 2.5a7.7 7.7 0 0 0-1.7 1l-2.3-.9-2 3.4L6.6 11a7.7 7.7 0 0 0 0 2l-2 1.5 2 3.4 2.3-.9a7.7 7.7 0 0 0 1.7 1l.4 2.5h4l.4-2.5a7.7 7.7 0 0 0 1.7-1l2.3.9 2-3.4Z"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconoReclamos() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path
        d="M4 5h16v11H8l-4 4Z"
        strokeLinejoin="round"
      />
      <path d="M12 9v3.5" strokeLinecap="round" />
      <circle cx="12" cy="15" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconoLineas() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="13" rx="2.5" />
      <path d="M4 10h16M8 17v2M16 17v2" strokeLinecap="round" />
      <circle cx="8.5" cy="13.5" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="13.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Layout() {
  const { usuario, tieneRol, cerrarSesion } = useAutenticacion();
  const navegar = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  async function manejarCerrarSesion() {
    await cerrarSesion();
    navegar("/login", { replace: true });
  }

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  return (
    <div className={estilos.pagina}>
      {/* import.meta.env.DEV repetido a proposito (estaEnModoDemo ya lo chequea):
          escrito aca literal, el bundler puede probar que la rama es muerta y
          sacar el string del build de produccion (verificado con `npm run build`). */}
      {import.meta.env.DEV && estaEnModoDemo() && (
        <p className={estilos.avisoDemo}>MODO DEMO — datos ficticios, no hay backend real detrás.</p>
      )}
      <div className={estilos.app}>
        <aside className={menuAbierto ? `${estilos.sidebar} ${estilos.sidebarAbierto}` : estilos.sidebar}>
          <Link to="/" className={estilos.marca} onClick={cerrarMenu}>
            <span className={estilos.logo}>P</span>
            <span className={estilos.titulo}>Estacionamiento Tandil</span>
          </Link>
          <nav className={estilos.navegacion}>
            {tieneRol(ROL_USUARIO) && (
              <>
                <NavLink to="/estacionamiento" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoEstacionamiento />
                  Mi estacionamiento
                </NavLink>
                <NavLink to="/vehiculos" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoVehiculos />
                  Vehículos
                </NavLink>
                <NavLink to="/historial" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoHistorial />
                  Historial
                </NavLink>
                <NavLink to="/reclamos" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoReclamos />
                  Reclamos
                </NavLink>
              </>
            )}
            {tieneRol(ROL_ADMINISTRADOR) && (
              <>
                <NavLink to="/admin" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoAdministracion />
                  Administración
                </NavLink>
                <NavLink to="/inspeccion" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoInspeccion />
                  Inspección
                </NavLink>
              </>
            )}
            <NavLink to="/lineas" className={claseNavLink} onClick={cerrarMenu}>
              <IconoLineas />
              Líneas de colectivo
            </NavLink>
          </nav>

          <div className={estilos.sidebarFooter}>
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
        </aside>

        {menuAbierto && (
          <button
            type="button"
            className={estilos.overlay}
            aria-label="Cerrar menú"
            onClick={cerrarMenu}
          />
        )}

        <div className={estilos.areaPrincipal}>
          <header className={estilos.encabezado}>
            <button
              type="button"
              className={estilos.botonMenu}
              aria-label="Abrir menú"
              onClick={() => setMenuAbierto(true)}
            >
              <IconoMenu />
            </button>
            <div className={estilos.encabezadoAcciones}>
              <ConmutadorTema variante="inline" />
            </div>
          </header>
          <main className={estilos.contenido}>
            <div className={estilos.contenidoInterior}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
