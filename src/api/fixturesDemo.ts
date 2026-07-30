// Datos y "servidor" ficticios para el modo demo (ver modoDemo.ts). Nunca se
// importa nada de este archivo fuera de un chequeo `import.meta.env.DEV`, asi
// que Vite lo saca del bundle de produccion.
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import type { TipoVehiculo, VehiculoRespuesta } from "../tipos/vehiculo";
import type { EstadoSesion, SesionRespuesta } from "../tipos/sesion";
import type { ZonaRespuesta } from "../tipos/zona";
import type { UsuarioRespuesta } from "../tipos/usuario";
import type { Pagina } from "../tipos/comun";
import { leerSesion } from "./almacenTokens";

// --- Estado en memoria, se reinicia con cada recarga de pagina ---

let saldoDemo = 500;

const zonasDemo: ZonaRespuesta[] = [
  {
    id: 1,
    nombre: "Microcentro Tandil",
    tarifaPorMinuto: 100,
    vertices: [
      { latitud: -37.325861008039, longitud: -59.1471618263273 },
      { latitud: -37.336718056509, longitud: -59.1406894730808 },
      { latitud: -37.331387925127, longitud: -59.1264420530712 },
      { latitud: -37.320488605663, longitud: -59.1329091972702 },
    ],
  },
  {
    id: 2,
    nombre: "Zona Norte (demo)",
    tarifaPorMinuto: 60,
    vertices: [
      { latitud: -37.312, longitud: -59.152 },
      { latitud: -37.318, longitud: -59.146 },
      { latitud: -37.315, longitud: -59.138 },
      { latitud: -37.309, longitud: -59.144 },
    ],
  },
];

let vehiculosDemo: VehiculoRespuesta[] = [
  { id: 1, patente: "DEMO001", tipo: "AUTO" },
  { id: 2, patente: "DEMO002", tipo: "MOTO" },
];
let siguienteIdVehiculo = 3;

const haceMinutos = (minutos: number) => new Date(Date.now() - minutos * 60_000).toISOString();

let sesionesDemo: SesionRespuesta[] = [
  {
    id: 1,
    patente: "DEMO001",
    nombreZona: zonasDemo[0].nombre,
    coordenada: { latitud: -37.3285, longitud: -59.1368 },
    horaInicio: haceMinutos(180),
    horaFin: haceMinutos(150),
    estado: "FINALIZADA",
    montoCobrado: 3000,
  },
];
let siguienteIdSesion = 2;

// Sesiones de otros usuarios ficticios, solo para que la tabla de
// ADMINISTRADOR tenga mas de una fila y se pueda ver la paginacion.
function sesionesAdminDemo(): SesionRespuesta[] {
  const otras: SesionRespuesta[] = Array.from({ length: 13 }, (_, indice) => ({
    id: 100 + indice,
    patente: `OTR${String(indice).padStart(3, "0")}`,
    nombreZona: zonasDemo[indice % zonasDemo.length].nombre,
    coordenada: { latitud: -37.328, longitud: -59.137 },
    horaInicio: haceMinutos(60 * (indice + 2)),
    horaFin: indice % 3 === 0 ? null : haceMinutos(60 * (indice + 1)),
    estado: (indice % 3 === 0 ? "ACTIVA" : "FINALIZADA") as EstadoSesion,
    montoCobrado: indice % 3 === 0 ? null : 500 + indice * 37,
  }));
  return [...sesionesDemo, ...otras].sort((a, b) => b.horaInicio.localeCompare(a.horaInicio));
}

// --- Helpers para construir la respuesta ---

function ok<T>(config: InternalAxiosRequestConfig, data: T, status = 200): Promise<AxiosResponse<T>> {
  return Promise.resolve({ data, status, statusText: "OK", headers: {}, config });
}

function cuerpoDe<T>(config: InternalAxiosRequestConfig): T {
  return (typeof config.data === "string" ? JSON.parse(config.data) : config.data) as T;
}

function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- El "adapter" que reemplaza al request real cuando hay sesion demo ---

export const adaptadorDemo: AxiosAdapter = async (config) => {
  await esperar(200); // se siente mas real que una respuesta instantanea
  const metodo = (config.method ?? "get").toLowerCase();
  const url = config.url ?? "";

  if (metodo === "get" && url === "/usuarios/yo") {
    const sesion = leerSesion();
    const data: UsuarioRespuesta = {
      id: 1,
      username: sesion?.username ?? "demo",
      dni: "00000000",
      saldo: saldoDemo,
      fechaRegistro: haceMinutos(60 * 24 * 30),
      roles: sesion?.roles ?? [],
    };
    return ok(config, data);
  }

  if (metodo === "get" && url === "/vehiculos") {
    return ok(config, vehiculosDemo);
  }
  if (metodo === "post" && url === "/vehiculos") {
    const cuerpo = cuerpoDe<{ patente: string; tipo: TipoVehiculo }>(config);
    const nuevo: VehiculoRespuesta = { id: siguienteIdVehiculo++, patente: cuerpo.patente, tipo: cuerpo.tipo };
    vehiculosDemo = [...vehiculosDemo, nuevo];
    return ok(config, nuevo, 201);
  }
  const matchBajaVehiculo = /^\/vehiculos\/([^/]+)$/.exec(url);
  if (metodo === "delete" && matchBajaVehiculo) {
    const patente = decodeURIComponent(matchBajaVehiculo[1]);
    vehiculosDemo = vehiculosDemo.filter((v) => v.patente !== patente);
    return ok(config, undefined, 204);
  }
  const matchTitularidad = /^\/vehiculos\/([^/]+)\/titularidad$/.exec(url);
  if (metodo === "put" && matchTitularidad) {
    const patente = decodeURIComponent(matchTitularidad[1]);
    const vehiculo = vehiculosDemo.find((v) => v.patente === patente) ?? {
      id: siguienteIdVehiculo++,
      patente,
      tipo: "AUTO" as TipoVehiculo,
    };
    return ok(config, vehiculo);
  }

  if (metodo === "get" && url === "/zonas") {
    return ok(config, zonasDemo);
  }
  if (metodo === "post" && url === "/zonas/verificacion") {
    // Simplificacion a proposito: en modo demo cualquier click cae dentro de
    // la primera zona. No vale la pena reimplementar point-in-polygon aca
    // solo para una vista previa visual.
    return ok(config, { dentroDeZona: true, zonaId: zonasDemo[0].id, nombreZona: zonasDemo[0].nombre });
  }

  if (metodo === "post" && url === "/sesiones") {
    const cuerpo = cuerpoDe<{ patente: string; coordenada: { latitud: number; longitud: number } }>(config);
    const nueva: SesionRespuesta = {
      id: siguienteIdSesion++,
      patente: cuerpo.patente,
      nombreZona: zonasDemo[0].nombre,
      coordenada: cuerpo.coordenada,
      horaInicio: new Date().toISOString(),
      horaFin: null,
      estado: "ACTIVA",
      montoCobrado: null,
    };
    sesionesDemo = [...sesionesDemo, nueva];
    return ok(config, nueva, 201);
  }
  const matchFinalizar = /^\/sesiones\/(\d+)\/finalizar$/.exec(url);
  if (metodo === "post" && matchFinalizar) {
    const id = Number(matchFinalizar[1]);
    const sesion = sesionesDemo.find((s) => s.id === id);
    if (!sesion) return Promise.reject(new Error("Sesion demo inexistente"));
    const minutos = Math.max(1, Math.round((Date.now() - new Date(sesion.horaInicio).getTime()) / 60_000));
    const monto = minutos * zonasDemo[0].tarifaPorMinuto;
    const finalizada: SesionRespuesta = {
      ...sesion,
      horaFin: new Date().toISOString(),
      estado: "FINALIZADA",
      montoCobrado: monto,
    };
    sesionesDemo = sesionesDemo.map((s) => (s.id === id ? finalizada : s));
    saldoDemo -= monto;
    return ok(config, finalizada);
  }
  if (metodo === "get" && url === "/sesiones") {
    return ok(config, sesionesDemo);
  }
  const matchInspeccion = /^\/sesiones\/inspeccion\/([^/]+)$/.exec(url);
  if (metodo === "get" && matchInspeccion) {
    const patente = decodeURIComponent(matchInspeccion[1]).toUpperCase();
    const tieneSesionActiva = patente !== "LIBRE";
    return ok(config, {
      patente,
      tieneSesionActiva,
      horaInicio: tieneSesionActiva ? haceMinutos(22) : null,
    });
  }
  if (metodo === "get" && url === "/sesiones/admin") {
    const page = Number(config.params?.page ?? 0);
    const size = Number(config.params?.size ?? 20);
    const todas = sesionesAdminDemo();
    const contenido = todas.slice(page * size, page * size + size);
    const data: Pagina<SesionRespuesta> = {
      content: contenido,
      totalElements: todas.length,
      totalPages: Math.max(1, Math.ceil(todas.length / size)),
      number: page,
      size,
      first: page === 0,
      last: (page + 1) * size >= todas.length,
    };
    return ok(config, data);
  }

  if (url.startsWith("/auth/")) {
    return ok(config, undefined, 204);
  }

  return Promise.reject(new Error(`Modo demo: no hay fixture para ${metodo.toUpperCase()} ${url}`));
};
