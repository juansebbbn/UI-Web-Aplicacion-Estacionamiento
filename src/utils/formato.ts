const formateadorMoneda = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });

export function formatearMonto(monto: number): string {
  return formateadorMoneda.format(monto);
}
