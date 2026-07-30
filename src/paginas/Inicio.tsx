import { Navigate } from "react-router-dom";
import { useAutenticacion } from "../contextos/useAutenticacion";
import { ROL_ADMINISTRADOR, ROL_USUARIO } from "../tipos/roles";

// Punto de entrada tras el login: cada rol va directo a su seccion principal.
// Un usuario con mas de un rol prioriza USUARIO > ADMINISTRADOR (orden
// arbitrario: no hay dato en la spec sobre que hacer con multi-rol). El rol
// INSPECTOR se elimino: su potestad (pagina /inspeccion) ahora es de
// ADMINISTRADOR, alcanzable desde la nav una vez logueado, no como landing
// propia.
export function Inicio() {
  const { tieneRol } = useAutenticacion();

  if (tieneRol(ROL_USUARIO)) {
    return <Navigate to="/estacionamiento" replace />;
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
