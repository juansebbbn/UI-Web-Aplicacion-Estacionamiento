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
