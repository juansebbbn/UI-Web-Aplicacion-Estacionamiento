import { Navigate } from "react-router-dom";
import { useAutenticacion } from "../contextos/useAutenticacion";
import { ROL_ADMINISTRADOR, ROL_INSPECTOR, ROL_USUARIO } from "../tipos/roles";

// Punto de entrada tras el login: cada rol va directo a su seccion principal.
// Un usuario con mas de un rol prioriza USUARIO > INSPECTOR > ADMINISTRADOR
// (orden arbitrario: no hay dato en la spec sobre que hacer con multi-rol).
export function Inicio() {
  const { tieneRol } = useAutenticacion();

  if (tieneRol(ROL_USUARIO)) {
    return <Navigate to="/estacionamiento" replace />;
  }
  if (tieneRol(ROL_INSPECTOR)) {
    return <Navigate to="/inspeccion" replace />;
  }
  if (tieneRol(ROL_ADMINISTRADOR)) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <section>
      <h2>Bienvenido</h2>
      <p>Tu cuenta todavía no tiene una sección disponible en esta versión de la app.</p>
    </section>
  );
}
