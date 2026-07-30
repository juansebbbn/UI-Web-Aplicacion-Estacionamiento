const formateadorMoneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const formateadorFecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" });

export function formatearMonto(monto: number): string {
  return formateadorMoneda.format(monto);
}

// horaInicio/horaFin llegan como LocalDateTime sin offset (ej. "2026-07-30T14:05:00"):
// new Date() los interpreta como hora local del navegador, que es lo correcto
// aca porque el backend corre en la misma zona horaria que los usuarios (Tandil).
export function formatearFecha(fechaIso: string): string {
  return formateadorFecha.format(new Date(fechaIso));
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
