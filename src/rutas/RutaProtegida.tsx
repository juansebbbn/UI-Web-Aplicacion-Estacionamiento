import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAutenticacion } from "../contextos/useAutenticacion";

interface RutaProtegidaProps {
  children: ReactNode;
  // Si se omite, solo exige estar autenticado (cualquier rol). Un array
  // significa "alcanza con tener alguno de estos" (ej. ADMINISTRADOR o
  // INSPECTOR, que hoy tienen el mismo nivel de acceso).
  rolRequerido?: string | string[];
}

export function RutaProtegida({ children, rolRequerido }: RutaProtegidaProps) {
  const { estaAutenticado, tieneRol } = useAutenticacion();

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rolRequerido) {
    const roles = Array.isArray(rolRequerido) ? rolRequerido : [rolRequerido];
    if (!roles.some(tieneRol)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
