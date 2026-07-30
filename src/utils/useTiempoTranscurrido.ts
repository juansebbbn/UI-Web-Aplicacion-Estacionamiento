import { useEffect, useState } from "react";

// Milisegundos transcurridos desde `desde` (ISO), actualizado cada segundo.
// Usado para el cronometro en vivo de la sesion activa (ver DashboardUsuario).
export function useTiempoTranscurrido(desde: string): number {
  const [ahora, setAhora] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return Math.max(0, ahora - new Date(desde).getTime());
}
