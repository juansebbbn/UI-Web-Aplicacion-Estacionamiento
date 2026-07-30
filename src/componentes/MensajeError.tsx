import estilos from "./MensajeError.module.css";

export function MensajeError({ mensaje }: { mensaje: string | null }) {
  if (!mensaje) return null;

  return (
    <p className={estilos.mensaje} role="alert">
      {mensaje}
    </p>
  );
}
