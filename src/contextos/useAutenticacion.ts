import { createContext, useContext } from "react";
import type { LoginSolicitud, RegistroSolicitud } from "../tipos/autenticacion";

export interface UsuarioActual {
  username: string;
  roles: string[];
}

export interface ContextoAutenticacionValor {
  usuario: UsuarioActual | null;
  estaAutenticado: boolean;
  cargando: boolean;
  tieneRol: (rol: string) => boolean;
  iniciarSesion: (datos: LoginSolicitud) => Promise<void>;
  registrarse: (datos: RegistroSolicitud) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

export const ContextoAutenticacion = createContext<ContextoAutenticacionValor | null>(null);

export function useAutenticacion(): ContextoAutenticacionValor {
  const contexto = useContext(ContextoAutenticacion);
  if (!contexto) {
    throw new Error("useAutenticacion debe usarse dentro de ProveedorAutenticacion");
  }
  return contexto;
}
