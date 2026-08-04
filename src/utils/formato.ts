const formateadorMoneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const formateadorFecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" });

export function formatearMonto(monto: number): string {
  return formateadorMoneda.format(monto);
}

// horaInicio/horaFin llegan como LocalDateTime SIN offset (ej. "2026-07-30T14:05:00").
// Ese valor es el reloj de pared del backend, que corre en UTC (default de la
// imagen Docker) — no la zona horaria del navegador. Sin este ajuste, `new
// Date(...)` interpreta la cadena como hora LOCAL del navegador, desfasando el
// valor por el offset del cliente (ej. 3hs para Tandil/UTC-3): el cronometro en
// vivo de la sesion activa quedaba clavado en 00:00 porque el "inicio" parecía
// estar en el futuro y el cálculo se clampeaba a 0 (ver useTiempoTranscurrido).
function analizarFechaBackend(fechaIso: string): Date {
  const tieneZonaHoraria = /Z$|[+-]\d{2}:\d{2}$/.test(fechaIso);
  return new Date(tieneZonaHoraria ? fechaIso : `${fechaIso}Z`);
}

export function formatearFecha(fechaIso: string): string {
  return formateadorFecha.format(analizarFechaBackend(fechaIso));
}

// Milisegundos desde `fechaIso` (formato backend, ver analizarFechaBackend) hasta ahora.
export function milisegundosDesde(fechaIso: string): number {
  return Date.now() - analizarFechaBackend(fechaIso).getTime();
}

// mm:ss, o hh:mm:ss si pasa la hora. Para el cronometro en vivo de la sesion activa.
export function formatearDuracion(milisegundos: number): string {
  const totalSegundos = Math.floor(milisegundos / 1000);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  const dosDigitos = (n: number) => n.toString().padStart(2, "0");

  return horas > 0
    ? `${horas}:${dosDigitos(minutos)}:${dosDigitos(segundos)}`
    : `${dosDigitos(minutos)}:${dosDigitos(segundos)}`;
}
