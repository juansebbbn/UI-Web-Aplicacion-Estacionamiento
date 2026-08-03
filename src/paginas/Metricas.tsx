import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { leerSesion } from "../api/almacenTokens";
import { obtenerHealth, obtenerMetrica, verificarCredencialesAdmin } from "../api/metricas";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { ROL_ADMINISTRADOR } from "../tipos/roles";
import estilos from "./Metricas.module.css";

const INTERVALO_POLLING_MS = 10_000;

// Un ADMINISTRADOR real (no demo) ya trae un token que /actuator/** acepta
// directo: no tiene sentido pedirle que se loguee de nuevo. Cualquier otro
// caso (INSPECTOR, o una sesion demo con cualquier rol — el token "modo-demo"
// no es un JWT real) cae al login previo.
function tokenAdminDeLaSesionActual(): string | null {
  const sesion = leerSesion();
  if (sesion && !sesion.demo && sesion.roles.includes(ROL_ADMINISTRADOR)) {
    return sesion.accessToken;
  }
  return null;
}

export function Metricas() {
  const [tokenPropio] = useState(tokenAdminDeLaSesionActual);
  const [tokenPaso, setTokenPaso] = useState<string | null>(null);

  const token = tokenPropio ?? tokenPaso;

  if (!token) {
    return <LoginPrevio onExito={setTokenPaso} />;
  }

  return <DashboardMetricas token={token} esPropio={tokenPropio !== null} onSalir={() => setTokenPaso(null)} />;
}

function LoginPrevio({ onExito }: { onExito: (token: string) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarEnvio(evento: FormEvent) {
    evento.preventDefault();
    setEnviando(true);
    setError(null);
    try {
      const token = await verificarCredencialesAdmin({ username, password });
      onExito(token);
    } catch (err) {
      setError(obtenerMensajeError(err));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section>
      <h2 className={estilos.tituloPagina}>Métricas</h2>
      <div className={estilos.tarjetaLogin}>
        <h3 className={estilos.tituloTarjeta}>Login previo</h3>
        <p className={estilos.ayuda}>
          Esta sección requiere credenciales de ADMINISTRADOR, aunque tu cuenta sea INSPECTOR.
        </p>
        <form className={estilos.formulario} onSubmit={manejarEnvio}>
          <label className={estilos.campo}>
            Usuario administrador
            <input value={username} onChange={(evento) => setUsername(evento.target.value)} required />
          </label>
          <label className={estilos.campo}>
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(evento) => setPassword(evento.target.value)}
              required
            />
          </label>
          <button type="submit" className={estilos.boton} disabled={enviando}>
            {enviando ? "Verificando..." : "Entrar"}
          </button>
        </form>
        {error && <MensajeError mensaje={error} />}
      </div>
    </section>
  );
}

function valor(metrica?: { measurements: { statistic: string; value: number }[] }, estadistica = "VALUE"): number | null {
  return metrica?.measurements.find((m) => m.statistic === estadistica)?.value ?? null;
}

function formatearBytes(bytes: number | null): string {
  if (bytes === null) return "—";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatearUptime(segundos: number | null): string {
  if (segundos === null) return "—";
  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);
  return horas > 0 ? `${horas}h ${minutos}m` : `${minutos}m`;
}

function DashboardMetricas({ token, esPropio, onSalir }: { token: string; esPropio: boolean; onSalir: () => void }) {
  const health = useQuery({
    queryKey: ["metricas-health"],
    queryFn: () => obtenerHealth(token),
    refetchInterval: INTERVALO_POLLING_MS,
  });
  const memoriaUsada = useQuery({
    queryKey: ["metricas-memoria-usada"],
    queryFn: () => obtenerMetrica("jvm.memory.used", token),
    refetchInterval: INTERVALO_POLLING_MS,
  });
  const memoriaMax = useQuery({
    queryKey: ["metricas-memoria-max"],
    queryFn: () => obtenerMetrica("jvm.memory.max", token),
    refetchInterval: INTERVALO_POLLING_MS,
  });
  const conexionesActivas = useQuery({
    queryKey: ["metricas-conexiones"],
    queryFn: () => obtenerMetrica("hikaricp.connections.active", token),
    refetchInterval: INTERVALO_POLLING_MS,
  });
  const uptime = useQuery({
    queryKey: ["metricas-uptime"],
    queryFn: () => obtenerMetrica("process.uptime", token),
    refetchInterval: INTERVALO_POLLING_MS,
  });
  const httpRequests = useQuery({
    queryKey: ["metricas-http"],
    queryFn: () => obtenerMetrica("http.server.requests", token),
    refetchInterval: INTERVALO_POLLING_MS,
  });

  const hayError = [health, memoriaUsada, memoriaMax, conexionesActivas, uptime, httpRequests].some((q) => q.isError);
  const cargando = [health, memoriaUsada, memoriaMax, conexionesActivas, uptime, httpRequests].every((q) => q.isPending);

  const totalRequests = valor(httpRequests.data, "COUNT");
  const tiempoTotal = valor(httpRequests.data, "TOTAL_TIME");

  return (
    <section>
      <div className={estilos.encabezado}>
        <h2 className={estilos.tituloPagina}>Métricas</h2>
        {!esPropio && (
          <button type="button" className={estilos.botonSecundario} onClick={onSalir}>
            Salir de métricas
          </button>
        )}
      </div>

      {cargando && <p>Cargando métricas…</p>}
      {hayError && (
        <MensajeError mensaje="No se pudieron cargar algunas métricas. Puede que el token haya expirado (dura 15 minutos) — probá salir y volver a entrar." />
      )}

      <div className={estilos.grilla}>
        <div className={estilos.tarjetaStat}>
          <span className={estilos.etiqueta}>Estado</span>
          {health.data && (
            <span
              className={
                health.data.status === "UP"
                  ? `${estilos.cifraHero} ${estilos.estadoUp}`
                  : `${estilos.cifraHero} ${estilos.estadoDown}`
              }
            >
              {health.data.status}
            </span>
          )}
        </div>

        <div className={estilos.tarjetaStat}>
          <span className={estilos.etiqueta}>Memoria JVM usada</span>
          <span className={estilos.cifraHero}>{formatearBytes(valor(memoriaUsada.data))}</span>
        </div>

        <div className={estilos.tarjetaStat}>
          <span className={estilos.etiqueta}>Memoria JVM máxima</span>
          <span className={estilos.cifraHero}>{formatearBytes(valor(memoriaMax.data))}</span>
        </div>

        <div className={estilos.tarjetaStat}>
          <span className={estilos.etiqueta}>Conexiones a la base activas</span>
          <span className={estilos.cifraHero}>{valor(conexionesActivas.data) ?? "—"}</span>
        </div>

        <div className={estilos.tarjetaStat}>
          <span className={estilos.etiqueta}>Uptime del proceso</span>
          <span className={estilos.cifraHero}>{formatearUptime(valor(uptime.data))}</span>
        </div>

        <div className={estilos.tarjetaStat}>
          <span className={estilos.etiqueta}>Requests HTTP totales</span>
          <span className={estilos.cifraHero}>{totalRequests ?? "—"}</span>
          {tiempoTotal !== null && (
            <span className={estilos.subEtiqueta}>{tiempoTotal.toFixed(2)}s acumulados</span>
          )}
        </div>
      </div>

      {health.data?.components && (
        <div className={estilos.seccionDetalle}>
          <h3 className={estilos.tituloSeccion}>Componentes</h3>
          <ul className={estilos.listaComponentes}>
            {Object.entries(health.data.components).map(([nombre, componente]) => (
              <li key={nombre} className={estilos.itemComponente}>
                <span
                  className={componente.status === "UP" ? estilos.insigniaUp : estilos.insigniaDown}
                >
                  {componente.status}
                </span>
                {nombre}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
