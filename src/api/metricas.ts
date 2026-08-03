import axios from "axios";
import type { LoginSolicitud, TokenRespuesta } from "../tipos/autenticacion";
import { ROL_ADMINISTRADOR } from "../tipos/roles";

// Observabilidad (/actuator/**) a proposito NO pasa por `cliente.ts`: ese
// cliente en modo demo redirige todo a datos ficticios (adaptadorDemo), y
// ademas su interceptor siempre inyecta el token de la sesion PRINCIPAL —
// achacaria cualquier intento de usar un token de ADMINISTRADOR "de paso"
// (el que se pide en el login previo de Metricas.tsx cuando quien entra es
// INSPECTOR). Este cliente es una instancia de axios sin interceptores,
// pensada para pasar el token que corresponda en cada llamada.
const URL_BASE_API = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";
const URL_BASE_RAIZ = URL_BASE_API.replace(/\/api\/v1\/?$/, "");

const clienteMetricas = axios.create();

export interface HealthRespuesta {
  status: string;
  components?: Record<string, { status: string; details?: Record<string, unknown> }>;
}

export interface MetricaRespuesta {
  name: string;
  measurements: { statistic: string; value: number }[];
}

// Valida contra el backend real (nunca el modo demo): si el login es
// invalido, tira el error tal cual para que obtenerMensajeError lo traduzca.
// Si el login es valido pero el usuario no es ADMINISTRADOR, tira un Error
// aparte (metricas exige ADMINISTRADOR real, ni INSPECTOR alcanza).
export async function verificarCredencialesAdmin(datos: LoginSolicitud): Promise<string> {
  const respuesta = await clienteMetricas.post<TokenRespuesta>(`${URL_BASE_API}/auth/login`, datos);
  if (!respuesta.data.roles.includes(ROL_ADMINISTRADOR)) {
    throw new Error("Ese usuario no tiene rol ADMINISTRADOR.");
  }
  return respuesta.data.accessToken;
}

export async function obtenerHealth(token: string): Promise<HealthRespuesta> {
  const respuesta = await clienteMetricas.get<HealthRespuesta>(`${URL_BASE_RAIZ}/actuator/health`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return respuesta.data;
}

export async function obtenerMetrica(nombre: string, token: string): Promise<MetricaRespuesta> {
  const respuesta = await clienteMetricas.get<MetricaRespuesta>(`${URL_BASE_RAIZ}/actuator/metrics/${nombre}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return respuesta.data;
}
