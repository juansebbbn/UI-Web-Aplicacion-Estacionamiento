import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { RefrescoSolicitud, TokenRespuesta } from "../tipos/autenticacion";
import { guardarSesion, leerSesion, limpiarSesion } from "./almacenTokens";

const URL_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/v1";

export const cliente = axios.create({ baseURL: URL_BASE });

// Instancia sin interceptores: la usa el refresco de token para no disparar
// a si misma en un loop si /auth/refrescar tambien devolviera 401.
const clienteSinInterceptores = axios.create({ baseURL: URL_BASE });

cliente.interceptors.request.use(async (config) => {
  const sesion = leerSesion();
  if (sesion?.accessToken) {
    config.headers.Authorization = `Bearer ${sesion.accessToken}`;
  }
  // Modo demo (ver modoDemo.ts): nunca pega contra el backend real, un
  // adapter le sirve datos ficticios. Import dinamico para que Vite pueda
  // sacar fixturesDemo.ts del bundle de produccion.
  if (import.meta.env.DEV && sesion?.demo) {
    const { adaptadorDemo } = await import("./fixturesDemo");
    config.adapter = adaptadorDemo;
  }
  return config;
});

// Varias requests pueden pisar un 401 al mismo tiempo (ej: dashboard pidiendo
// saldo, zonas y vehiculos juntos). Sin esta cola cada una dispararia su
// propio refresco y la rotacion de refresh token del backend invalidaria
// las siguientes.
let refrescoEnCurso: Promise<TokenRespuesta> | null = null;

function solicitarRefresco(refreshToken: string): Promise<TokenRespuesta> {
  if (!refrescoEnCurso) {
    const cuerpo: RefrescoSolicitud = { refreshToken };
    refrescoEnCurso = clienteSinInterceptores
      .post<TokenRespuesta>("/auth/refrescar", cuerpo)
      .then((respuesta) => respuesta.data)
      .finally(() => {
        refrescoEnCurso = null;
      });
  }
  return refrescoEnCurso;
}

interface ConfigConReintento extends InternalAxiosRequestConfig {
  _reintentada?: boolean;
}

cliente.interceptors.response.use(
  (respuesta) => respuesta,
  async (error: AxiosError) => {
    const config = error.config as ConfigConReintento | undefined;
    const esRutaDeAuth = config?.url?.startsWith("/auth/");

    if (error.response?.status !== 401 || !config || config._reintentada || esRutaDeAuth) {
      throw error;
    }

    const sesion = leerSesion();
    if (!sesion?.refreshToken) {
      throw error;
    }

    try {
      const nuevoToken = await solicitarRefresco(sesion.refreshToken);
      guardarSesion(nuevoToken);
      config._reintentada = true;
      config.headers.Authorization = `Bearer ${nuevoToken.accessToken}`;
      return cliente(config);
    } catch (errorDeRefresco) {
      limpiarSesion();
      throw errorDeRefresco;
    }
  },
);
