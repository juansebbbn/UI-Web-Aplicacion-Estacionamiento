import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAutenticacion } from "../contextos/useAutenticacion";
import { useToasts } from "../contextos/contextoToasts";
import { obtenerMensajeError } from "../api/errores";
import { PanelModoDemo } from "../componentes/PanelModoDemo";
import estilos from "./FormularioAuth.module.css";

export function Login() {
  const { estaAutenticado, iniciarSesion, cargando } = useAutenticacion();
  const { mostrarError } = useToasts();
  const navegar = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  if (estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    try {
      await iniciarSesion({ username, password });
      navegar("/", { replace: true });
    } catch (err) {
      mostrarError(obtenerMensajeError(err));
    }
  }

  return (
    <div className={estilos.contenedor}>
      <h1>Iniciar sesión</h1>
      <form className={estilos.formulario} onSubmit={manejarEnvio}>
        <label className={estilos.campo}>
          Usuario
          <input
            value={username}
            onChange={(evento) => setUsername(evento.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label className={estilos.campo}>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <button type="submit" className={estilos.enviar} disabled={cargando}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <p className={estilos.enlaceAlternativo}>
        ¿No tenés cuenta? <Link to="/registro">Registrate</Link>
      </p>
      {import.meta.env.DEV && <PanelModoDemo />}
    </div>
  );
}
