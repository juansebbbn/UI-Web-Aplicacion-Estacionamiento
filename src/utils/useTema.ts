import { useCallback, useEffect, useState } from "react";

export type Tema = "claro" | "oscuro" | "sistema";

const CLAVE_ALMACENAMIENTO = "estacionamiento_tema";

function leerTemaGuardado(): Tema {
  const guardado = localStorage.getItem(CLAVE_ALMACENAMIENTO);
  return guardado === "claro" || guardado === "oscuro" ? guardado : "sistema";
}

// "sistema" saca el atributo y deja que decida @media (prefers-color-scheme)
// en index.css; "claro"/"oscuro" lo fuerzan via :root[data-theme].
function aplicarTema(tema: Tema): void {
  if (tema === "sistema") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", tema === "oscuro" ? "dark" : "light");
  }
}

export function useTema() {
  const [tema, setTemaState] = useState<Tema>(leerTemaGuardado);

  useEffect(() => {
    aplicarTema(tema);
  }, [tema]);

  const setTema = useCallback((nuevoTema: Tema) => {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, nuevoTema);
    setTemaState(nuevoTema);
  }, []);

  return { tema, setTema };
}
