import { createContext, useContext } from "react";

export type TipoToast = "exito" | "error";

export interface ToastItem {
  id: number;
  tipo: TipoToast;
  mensaje: string;
}

export interface ContextoToastsValor {
  mostrarExito: (mensaje: string) => void;
  mostrarError: (mensaje: string) => void;
}

export const ContextoToasts = createContext<ContextoToastsValor | null>(null);

export function useToasts(): ContextoToastsValor {
  const contexto = useContext(ContextoToasts);
  if (!contexto) {
    throw new Error("useToasts debe usarse dentro de ProveedorToasts");
  }
  return contexto;
}
