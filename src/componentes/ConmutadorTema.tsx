import type { ComponentType } from "react";
import { useTema, type Tema } from "../utils/useTema";
import estilos from "./ConmutadorTema.module.css";

const ETIQUETA: Record<Tema, string> = {
  sistema: "Sistema",
  claro: "Claro",
  oscuro: "Oscuro",
};

function IconoSistema() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" strokeLinecap="round" />
    </svg>
  );
}

function IconoClaro() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconoOscuro() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" strokeLinejoin="round" />
    </svg>
  );
}

const ICONO: Record<Tema, ComponentType> = {
  sistema: IconoSistema,
  claro: IconoClaro,
  oscuro: IconoOscuro,
};

// Segmented control fijo (monta una vez en App.tsx, visible en toda la app
// incluyendo login/registro): tres opciones explicitas en vez de un botón
// que cicla, para que "claro" y "oscuro" sean un toggle real y no haya que
// adivinar en qué paso del ciclo está el tema actual.
export function ConmutadorTema() {
  const { tema, setTema } = useTema();

  return (
    <div className={estilos.grupo} role="radiogroup" aria-label="Tema de la aplicación">
      {(Object.keys(ETIQUETA) as Tema[]).map((opcion) => {
        const Icono = ICONO[opcion];
        const activo = tema === opcion;
        return (
          <button
            key={opcion}
            type="button"
            role="radio"
            aria-checked={activo}
            title={`Tema: ${ETIQUETA[opcion]}`}
            className={activo ? `${estilos.opcion} ${estilos.opcionActiva}` : estilos.opcion}
            onClick={() => setTema(opcion)}
          >
            <Icono />
          </button>
        );
      })}
    </div>
  );
}
