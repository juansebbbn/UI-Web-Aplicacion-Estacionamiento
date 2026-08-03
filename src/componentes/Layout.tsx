import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAutenticacion } from "../contextos/useAutenticacion";
import { estaEnModoDemo } from "../api/modoDemo";
import { listarNotificacionesPropias } from "../api/notificaciones";
import { ConmutadorTema } from "./ConmutadorTema";
import { ROL_ADMINISTRADOR, ROL_INSPECTOR, ROL_USUARIO } from "../tipos/roles";
import estilos from "./Layout.module.css";

// Mismo intervalo que la pagina de Notificaciones: el badge del sidebar
// necesita enterarse de notificaciones nuevas aunque el usuario no este
// parado en esa pagina.
const INTERVALO_POLLING_NOTIFICACIONES_MS = 20_000;

function claseNavLink({ isActive }: NavLinkRenderProps): string {
  return isActive ? `${estilos.navLink} ${estilos.navLinkActivo}` : estilos.navLink;
}

function claseBotonNotificaciones({ isActive }: NavLinkRenderProps): string {
  return isActive
    ? `${estilos.botonNotificaciones} ${estilos.botonNotificacionesActivo}`
    : estilos.botonNotificaciones;
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

function IconoRecarga() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <path d="M3 10h18" strokeLinecap="round" />
      <path d="M12 14v3M10.5 15.5h3" strokeLinecap="round" />
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

function IconoUsuarios() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      <circle cx="17.5" cy="8.5" r="2.3" />
      <path d="M16.5 14.2c2.4.3 4.2 2.4 4.2 5" strokeLinecap="round" />
    </svg>
  );
}

function IconoSesionesActivas() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconoTitularidad() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 8h13M17 8l-3-3M17 8l-3 3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 16H7M7 16l3-3M7 16l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconoNotificaciones({ sonando }: { sonando?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={sonando ? estilos.campanaSonando : undefined}
    >
      <path
        d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z"
        strokeLinejoin="round"
      />
      <path d="M10 18.5a2 2 0 0 0 4 0" strokeLinecap="round" />
    </svg>
  );
}

function IconoMultas() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3 3 8v3c0 5 3.8 8.5 9 10 5.2-1.5 9-5 9-10V8Z" strokeLinejoin="round" />
      <path d="M12 8v5" strokeLinecap="round" />
      <circle cx="12" cy="16" r="0.9" fill="currentColor" stroke="none" />
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

function IconoMetricas() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 20V10M11 20V4M18 20v-7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 20h18" strokeLinecap="round" />
    </svg>
  );
}

export function Layout() {
  const { usuario, tieneRol, cerrarSesion } = useAutenticacion();
  const navegar = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const notificaciones = useQuery({
    queryKey: ["notificaciones"],
    queryFn: listarNotificacionesPropias,
    enabled: tieneRol(ROL_USUARIO),
    refetchInterval: INTERVALO_POLLING_NOTIFICACIONES_MS,
  });
  const notificacionesNoLeidas = notificaciones.data?.filter((n) => !n.leida).length ?? 0;

  // Detecta notificaciones nuevas entre un poll y el siguiente (por id, no
  // por cantidad: si el usuario borra una y llega otra el conteo puede dar
  // igual) para animar la campanita un rato y que se note que llegó algo,
  // sin depender de que el usuario este parado en /notificaciones.
  const [huboNotificacionNueva, setHuboNotificacionNueva] = useState(false);
  const idsConocidosRef = useRef<Set<number> | null>(null);

  useEffect(() => {
    if (!notificaciones.data) return;
    const idsActuales = new Set(notificaciones.data.map((n) => n.id));
    const idsAnteriores = idsConocidosRef.current;
    idsConocidosRef.current = idsActuales;

    if (idsAnteriores && [...idsActuales].some((id) => !idsAnteriores.has(id))) {
      setHuboNotificacionNueva(true);
      const temporizador = setTimeout(() => setHuboNotificacionNueva(false), 1600);
      return () => clearTimeout(temporizador);
    }
  }, [notificaciones.data]);

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
                <NavLink to="/recargar-saldo" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoRecarga />
                  Recargar saldo
                </NavLink>
                <NavLink to="/historial" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoHistorial />
                  Historial
                </NavLink>
                <NavLink to="/reclamos" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoReclamos />
                  Reclamos
                </NavLink>
                <NavLink to="/multas" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoMultas />
                  Multas
                </NavLink>
                <NavLink to="/lineas" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoLineas />
                  Líneas de colectivo
                </NavLink>
              </>
            )}
            {tieneRol(ROL_INSPECTOR) && (
              <>
                <NavLink to="/admin/usuarios" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoUsuarios />
                  Usuarios
                </NavLink>
                <NavLink to="/admin/reclamos" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoReclamos />
                  Reclamos
                </NavLink>
                <NavLink to="/admin/multas" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoMultas />
                  Multas
                </NavLink>
                <NavLink to="/admin/sesiones" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoSesionesActivas />
                  Sesiones activas
                </NavLink>
                <NavLink to="/inspeccion" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoInspeccion />
                  Inspección
                </NavLink>
                <NavLink to="/admin/titularidad" className={claseNavLink} onClick={cerrarMenu}>
                  <IconoTitularidad />
                  Transferir titularidad
                </NavLink>
              </>
            )}
            {tieneRol(ROL_ADMINISTRADOR) && (
              <NavLink to="/metricas" className={claseNavLink} onClick={cerrarMenu}>
                <IconoMetricas />
                Métricas
              </NavLink>
            )}
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
              {tieneRol(ROL_USUARIO) && (
                <NavLink
                  to="/notificaciones"
                  className={claseBotonNotificaciones}
                  aria-label="Notificaciones"
                  onClick={cerrarMenu}
                >
                  <IconoNotificaciones sonando={huboNotificacionNueva} />
                  {notificacionesNoLeidas > 0 && (
                    <span className={estilos.badgeNotificaciones}>{notificacionesNoLeidas}</span>
                  )}
                </NavLink>
              )}
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
