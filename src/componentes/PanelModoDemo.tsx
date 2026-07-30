import { useNavigate } from "react-router-dom";
import { activarModoDemo } from "../api/modoDemo";
import { ROL_ADMINISTRADOR, ROL_USUARIO } from "../tipos/roles";
import estilos from "./PanelModoDemo.module.css";

const ROLES_DEMO = [
  { rol: ROL_USUARIO, etiqueta: "Usuario" },
  { rol: ROL_ADMINISTRADOR, etiqueta: "Administrador" },
];

// Solo se monta si import.meta.env.DEV (ver Login.tsx): entra sin backend,
// con datos ficticios, para poder revisar cualquier vista por rol sin tener
// que asignar roles a mano en la base. No existe en el build de produccion.
export function PanelModoDemo() {
  const navegar = useNavigate();

  function entrarComo(rol: string) {
    activarModoDemo(rol);
    navegar("/", { replace: true });
  }

  return (
    <div className={estilos.panel}>
      <p className={estilos.titulo}>Modo demo (solo desarrollo, sin backend)</p>
      <div className={estilos.botones}>
        {ROLES_DEMO.map(({ rol, etiqueta }) => (
          <button key={rol} type="button" className={estilos.boton} onClick={() => entrarComo(rol)}>
            Entrar como {etiqueta}
          </button>
        ))}
      </div>
    </div>
  );
}
