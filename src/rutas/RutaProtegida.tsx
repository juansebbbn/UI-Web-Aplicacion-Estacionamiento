import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAutenticacion } from "../contextos/useAutenticacion";

interface RutaProtegidaProps {
  children: ReactNode;
  // Si se omite, solo exige estar autenticado (cualquier rol).
  rolRequerido?: string;
}

export function RutaProtegida({ children, rolRequerido }: RutaProtegidaProps) {
  const { estaAutenticado, tieneRol } = useAutenticacion();

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rolRequerido && !tieneRol(rolRequerido)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
