import { useTema, type Tema } from "../utils/useTema";
import estilos from "./ConmutadorTema.module.css";

const SIGUIENTE: Record<Tema, Tema> = {
  sistema: "claro",
  claro: "oscuro",
  oscuro: "sistema",
};

const ETIQUETA: Record<Tema, string> = {
  sistema: "Tema: Sistema",
  claro: "Tema: Claro",
  oscuro: "Tema: Oscuro",
};

// Botón único, visible en toda la app (montado una vez en App.tsx, no dentro
// de Layout): cicla sistema -> claro -> oscuro -> sistema. "Sistema" respeta
// prefers-color-scheme; los otros dos fuerzan el tema via useTema.
export function ConmutadorTema() {
  const { tema, setTema } = useTema();

  return (
    <button
      type="button"
      className={estilos.boton}
      onClick={() => setTema(SIGUIENTE[tema])}
      title="Cambiar tema claro/oscuro"
    >
      {ETIQUETA[tema]}
    </button>
  );
}
