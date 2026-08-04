import { useEffect, useState } from "react";
import { milisegundosDesde } from "./formato";

// Milisegundos transcurridos desde `desde` (LocalDateTime del backend, ver
// milisegundosDesde en formato.ts), actualizado cada segundo. Usado para el
// cronometro en vivo de la sesion activa (ver DashboardUsuario).
export function useTiempoTranscurrido(desde: string): number {
  const [, forzarRecalculo] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forzarRecalculo((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return Math.max(0, milisegundosDesde(desde));
}
