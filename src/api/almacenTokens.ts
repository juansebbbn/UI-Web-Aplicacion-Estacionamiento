import type { TokenRespuesta } from "../tipos/autenticacion";

// Se guardan juntos en localStorage (ver PROGRESO.md: decision de v1 sobre
// donde vive el refreshToken, sin cookies httpOnly del lado del backend).
const CLAVE_ALMACENAMIENTO = "estacionamiento_sesion";

export interface SesionAlmacenada {
  accessToken: string;
  refreshToken: string;
  username: string;
  roles: string[];
  // Sesion de src/api/modoDemo.ts: no habla con el backend real, cliente.ts
  // le sirve datos ficticios. Nunca se activa fuera de import.meta.env.DEV.
  demo?: boolean;
}

// Se dispara cada vez que la sesion guardada cambia (login, logout, refresco,
// o expulsion por refresh token invalido) para que ContextoAutenticacion
// pueda reaccionar sin acoplarse al cliente HTTP.
const EVENTO_CAMBIO_SESION = "estacionamiento:cambio-sesion";

export function guardarSesion(token: TokenRespuesta, opciones?: { demo?: boolean }): void {
  const sesion: SesionAlmacenada = {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    username: token.username,
    roles: token.roles,
    demo: opciones?.demo,
  };
  localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(sesion));
  window.dispatchEvent(new CustomEvent(EVENTO_CAMBIO_SESION));
}

export function leerSesion(): SesionAlmacenada | null {
  const crudo = localStorage.getItem(CLAVE_ALMACENAMIENTO);
  if (!crudo) return null;
  try {
    return JSON.parse(crudo) as SesionAlmacenada;
  } catch {
    return null;
  }
}

export function limpiarSesion(): void {
  localStorage.removeItem(CLAVE_ALMACENAMIENTO);
  window.dispatchEvent(new CustomEvent(EVENTO_CAMBIO_SESION));
}

export function suscribirseACambiosDeSesion(callback: () => void): () => void {
  window.addEventListener(EVENTO_CAMBIO_SESION, callback);
  return () => window.removeEventListener(EVENTO_CAMBIO_SESION, callback);
}
