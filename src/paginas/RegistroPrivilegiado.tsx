import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAutenticacion } from "../contextos/useAutenticacion";
import { useToasts } from "../contextos/contextoToasts";
import { obtenerMensajeError } from "../api/errores";
import { registrarAdministrador, registrarInspector } from "../api/auth";
import estilos from "./FormularioAuth.module.css";
import estilosPropios from "./RegistroPrivilegiado.module.css";

type RolPrivilegiado = "ADMINISTRADOR" | "INSPECTOR";

export function RegistroPrivilegiado() {
  const { estaAutenticado } = useAutenticacion();
  const { mostrarExito, mostrarError } = useToasts();
  const navegar = useNavigate();
  const [rol, setRol] = useState<RolPrivilegiado>("ADMINISTRADOR");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [dni, setDni] = useState("");
  const [clave, setClave] = useState("");
  const [cargando, setCargando] = useState(false);

  if (estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setCargando(true);
    try {
      const datos = { username, password, dni, clave };
      const token = rol === "ADMINISTRADOR" ? await registrarAdministrador(datos) : await registrarInspector(datos);
      mostrarExito(`Cuenta ${rol === "ADMINISTRADOR" ? "administrador" : "inspector"} creada. Bienvenido/a, ${token.username}.`);
      navegar("/", { replace: true });
    } catch (err) {
      mostrarError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
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
          <h1 className={estilos.titulo}>Crear cuenta privilegiada</h1>
          <form className={estilos.formulario} onSubmit={manejarEnvio}>
            <div className={estilosPropios.selectorRol}>
              <label className={estilosPropios.opcionRol}>
                <input
                  type="radio"
                  name="rol"
                  checked={rol === "ADMINISTRADOR"}
                  onChange={() => setRol("ADMINISTRADOR")}
                />
                Administrador
              </label>
              <label className={estilosPropios.opcionRol}>
                <input
                  type="radio"
                  name="rol"
                  checked={rol === "INSPECTOR"}
                  onChange={() => setRol("INSPECTOR")}
                />
                Inspector
              </label>
            </div>
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
            <label className={estilos.campo}>
              Clave de registro privilegiado
              <input
                type="password"
                value={clave}
                onChange={(evento) => setClave(evento.target.value)}
                required
                autoComplete="off"
              />
            </label>
            <button type="submit" className={estilos.enviar} disabled={cargando}>
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
          <p className={estilosPropios.ayuda}>
            La clave la provee quien administra el sistema; no es la contraseña de la cuenta.
          </p>
          <p className={estilos.enlaceAlternativo}>
            <Link to="/login">Volver a iniciar sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
