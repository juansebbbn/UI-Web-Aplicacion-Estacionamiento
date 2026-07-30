import { useCallback, useEffect, useState, type ReactNode } from "react";
import * as authApi from "../api/auth";
import { leerSesion, suscribirseACambiosDeSesion } from "../api/almacenTokens";
import type { LoginSolicitud, RegistroSolicitud } from "../tipos/autenticacion";
import { ContextoAutenticacion, type UsuarioActual } from "./useAutenticacion";

function leerUsuarioActual(): UsuarioActual | null {
  const sesion = leerSesion();
  return sesion ? { username: sesion.username, roles: sesion.roles } : null;
}

export function ProveedorAutenticacion({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioActual | null>(leerUsuarioActual);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // El cliente HTTP puede limpiar la sesion por su cuenta (refresh token
    // invalido) sin pasar por iniciarSesion/cerrarSesion de este contexto.
    return suscribirseACambiosDeSesion(() => setUsuario(leerUsuarioActual()));
  }, []);

  const iniciarSesion = useCallback(async (datos: LoginSolicitud) => {
    setCargando(true);
    try {
      const token = await authApi.iniciarSesion(datos);
      setUsuario({ username: token.username, roles: token.roles });
    } finally {
      setCargando(false);
    }
  }, []);

  const registrarse = useCallback(async (datos: RegistroSolicitud) => {
    setCargando(true);
    try {
      const token = await authApi.registrarse(datos);
      setUsuario({ username: token.username, roles: token.roles });
    } finally {
      setCargando(false);
    }
  }, []);

  const cerrarSesion = useCallback(async () => {
    await authApi.cerrarSesion();
    setUsuario(null);
  }, []);

  const tieneRol = useCallback((rol: string) => usuario?.roles.includes(rol) ?? false, [usuario]);

  return (
    <ContextoAutenticacion.Provider
      value={{ usuario, estaAutenticado: usuario !== null, cargando, tieneRol, iniciarSesion, registrarse, cerrarSesion }}
    >
      {children}
    </ContextoAutenticacion.Provider>
  );
}
