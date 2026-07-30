import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAutenticacion } from "../contextos/useAutenticacion";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import estilos from "./FormularioAuth.module.css";

export function Registro() {
  const { estaAutenticado, registrarse, cargando } = useAutenticacion();
  const navegar = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dni, setDni] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setError(null);
    try {
      await registrarse({ username, password, dni });
      navegar("/", { replace: true });
    } catch (err) {
      setError(obtenerMensajeError(err));
    }
  }

  return (
    <div className={estilos.contenedor}>
      <h1>Crear cuenta</h1>
      <form className={estilos.formulario} onSubmit={manejarEnvio}>
        <label className={estilos.campo}>
          Usuario
          <input
            value={username}
            onChange={(evento) => setUsername(evento.target.value)}
            required
            minLength={4}
            maxLength={50}
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
            minLength={8}
            autoComplete="new-password"
          />
        </label>
        <label className={estilos.campo}>
          DNI
          <input
            value={dni}
            onChange={(evento) => setDni(evento.target.value)}
            required
            pattern="[0-9]{7,9}"
            title="Entre 7 y 9 dígitos"
            inputMode="numeric"
          />
        </label>
        <MensajeError mensaje={error} />
        <button type="submit" className={estilos.enviar} disabled={cargando}>
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
      <p className={estilos.enlaceAlternativo}>
        ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
      </p>
    </div>
  );
}
