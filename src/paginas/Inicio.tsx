import { Navigate } from "react-router-dom";
import { useAutenticacion } from "../contextos/useAutenticacion";
import { ROL_USUARIO } from "../tipos/roles";

// Punto de entrada tras el login: USUARIO va directo a su dashboard. Las
// vistas de INSPECTOR y ADMINISTRADOR se agregan en un modulo siguiente.
export function Inicio() {
  const { tieneRol } = useAutenticacion();

  if (tieneRol(ROL_USUARIO)) {
    return <Navigate to="/estacionamiento" replace />;
  }

  return (
    <section>
      <h2>Bienvenido</h2>
      <p>Tu cuenta todavía no tiene una sección disponible en esta versión de la app.</p>
    </section>
  );
}
