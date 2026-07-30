import { useCallback, useRef, useState, type ReactNode } from "react";
import { ContextoToasts, type TipoToast, type ToastItem } from "./contextoToasts";
import estilos from "./ProveedorToasts.module.css";

const DURACION_MS = 4000;

export function ProveedorToasts({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const siguienteId = useRef(0);

  const cerrarToast = useCallback((id: number) => {
    setToasts((actuales) => actuales.filter((toast) => toast.id !== id));
  }, []);

  const mostrarToast = useCallback(
    (tipo: TipoToast, mensaje: string) => {
      const id = siguienteId.current++;
      setToasts((actuales) => [...actuales, { id, tipo, mensaje }]);
      setTimeout(() => cerrarToast(id), DURACION_MS);
    },
    [cerrarToast],
  );

  const mostrarExito = useCallback((mensaje: string) => mostrarToast("exito", mensaje), [mostrarToast]);
  const mostrarError = useCallback((mensaje: string) => mostrarToast("error", mensaje), [mostrarToast]);

  return (
    <ContextoToasts.Provider value={{ mostrarExito, mostrarError }}>
      {children}
      <div className={estilos.contenedor} aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={toast.tipo === "exito" ? estilos.exito : estilos.error} role="status">
            <span>{toast.mensaje}</span>
            <button
              type="button"
              className={estilos.cerrar}
              onClick={() => cerrarToast(toast.id)}
              aria-label="Cerrar notificación"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ContextoToasts.Provider>
  );
}
