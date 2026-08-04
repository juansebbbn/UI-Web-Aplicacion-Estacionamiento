import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAutenticacion } from "../contextos/useAutenticacion";
import { useToasts } from "../contextos/contextoToasts";
import { obtenerMensajeError } from "../api/errores";
import estilos from "./FormularioAuth.module.css";

export function Registro() {
  const { estaAutenticado, registrarse, cargando } = useAutenticacion();
  const { mostrarExito, mostrarError } = useToasts();
  const navegar = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dni, setDni] = useState("");

  if (estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    try {
      await registrarse({ username, password, dni });
      mostrarExito(`¡Cuenta creada! Bienvenido/a, ${username}.`);
      navegar("/", { replace: true });
    } catch (err) {
      mostrarError(obtenerMensajeError(err));
    }
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.contenedor}>
        <div className={estilos.marca}>
          <span className={estilos.logo}>G</span>
          <span className={estilos.nombreApp}>Gestión Tandil</span>
        </div>
        <div className={estilos.tarjeta}>
          <h1 className={estilos.titulo}>Crear cuenta</h1>
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
            <button type="submit" className={estilos.enviar} disabled={cargando}>
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
          <p className={estilos.enlaceAlternativo}>
            ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
