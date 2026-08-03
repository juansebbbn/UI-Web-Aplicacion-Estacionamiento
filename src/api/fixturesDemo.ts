// Datos y "servidor" ficticios para el modo demo (ver modoDemo.ts). Nunca se
// importa nada de este archivo fuera de un chequeo `import.meta.env.DEV`, asi
// que Vite lo saca del bundle de produccion.
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import type { TipoVehiculo, VehiculoRespuesta } from "../tipos/vehiculo";
import type { EstadoSesion, SesionRespuesta } from "../tipos/sesion";
import type { ZonaRespuesta } from "../tipos/zona";
import type { UsuarioAdminRespuesta, UsuarioRespuesta } from "../tipos/usuario";
import type { MotivoReclamo, ReclamoAdminRespuesta, ReclamoRespuesta } from "../tipos/reclamo";
import type { NotificacionRespuesta } from "../tipos/notificacion";
import type { MultaAdminRespuesta, MultaRespuesta } from "../tipos/multa";
import type { Pagina } from "../tipos/comun";
import { leerSesion } from "./almacenTokens";

function nombrePropio(): string {
  return leerSesion()?.username ?? "demo";
}

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

// Otros usuarios ficticios para el panel de ADMINISTRADOR (listado de
// usuarios + ajuste de saldo). El usuario "propio" (id 1) no esta aca: se
// arma dinamicamente en el handler de /usuarios/admin a partir de
// saldoDemo/vehiculosDemo/leerSesion(), para que quede consistente con el
// resto del modo demo (ej. si finaliza una sesion y su saldo cambia).
let otrosUsuariosDemo: UsuarioAdminRespuesta[] = [
  {
    id: 2,
    username: "juan.perez",
    dni: "30111222",
    saldo: -1500,
    fechaRegistro: haceMinutos(60 * 24 * 10),
    roles: ["ROLE_USUARIO"],
    vehiculos: [{ id: 10, patente: "OTR100", tipo: "AUTO" }],
  },
  {
    id: 3,
    username: "maria.gomez",
    dni: "28555666",
    saldo: 850,
    fechaRegistro: haceMinutos(60 * 24 * 60),
    roles: ["ROLE_USUARIO"],
    vehiculos: [
      { id: 11, patente: "OTR101", tipo: "MOTO" },
      { id: 12, patente: "OTR102", tipo: "AUTO" },
    ],
  },
  {
    id: 4,
    username: "sofia.martinez",
    dni: "27333444",
    saldo: 0,
    fechaRegistro: haceMinutos(60 * 24 * 90),
    roles: ["ROLE_USUARIO"],
    vehiculos: [],
  },
];

let reclamosDemo: ReclamoRespuesta[] = [];
let siguienteIdReclamo = 1;

// Reclamos de otros usuarios ficticios, solo para que la tabla de
// ADMINISTRADOR tenga mas de una fila. `let` porque el admin puede marcarlos
// como revisados en modo demo.
let reclamosAdminDemo: ReclamoAdminRespuesta[] = [
  {
    id: 1000,
    username: "juan.perez",
    motivo: "COBRO",
    descripcion: "Me cobraron de mas por una sesion de 20 minutos.",
    fechaCreacion: haceMinutos(60 * 5),
    revisado: false,
    respuesta: null,
  },
  {
    id: 1001,
    username: "maria.gomez",
    motivo: "ZONA",
    descripcion: "El cartel de la zona norte no se ve bien de noche.",
    fechaCreacion: haceMinutos(60 * 30),
    revisado: false,
    respuesta: null,
  },
];

// --- Notificaciones (propias) ---

let notificacionesDemo: NotificacionRespuesta[] = [];
let siguienteIdNotificacion = 1;

function crearNotificacionDemo(descripcion: string) {
  notificacionesDemo = [
    { id: siguienteIdNotificacion++, descripcion, fecha: new Date().toISOString(), leida: false },
    ...notificacionesDemo,
  ];
}

// --- Multas ---
// Igual que en el backend real: la multa gira en torno a la patente, no a un
// usuario fijo. El dueño se resuelve siempre en vivo via usernamePorPatente,
// asi que si se "transfiere" una patente en modo demo la multa sigue al
// nuevo dueño automaticamente (nunca se guarda un username fijo por multa).

let siguienteIdMulta = 2000;
let multasDemo: MultaRespuesta[] = [
  {
    id: siguienteIdMulta++,
    patente: "OTR100",
    precio: 5000,
    fecha: haceMinutos(60 * 24 * 3),
    fuePagada: false,
    fechaPago: null,
    revocada: false,
    razon: "Mal estacionado en zona exclusiva",
  },
];

// patente -> username, para resolver a quien pertenece una multa. Null si la
// patente no esta registrada por nadie todavia (multa "huerfana").
function usernamePorPatente(patente: string): string | null {
  if (vehiculosDemo.some((v) => v.patente === patente)) return nombrePropio();
  const otro = otrosUsuariosDemo.find((u) => u.vehiculos.some((v) => v.patente === patente));
  return otro?.username ?? null;
}

function multaConUsername(multa: MultaRespuesta): MultaAdminRespuesta {
  const username = usernamePorPatente(multa.patente ?? "");
  return { ...multa, username, vehiculoRegistrado: username !== null };
}

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
    // Igual que VehiculoControlador.registrar en el backend real: si ya
    // habia multas huerfanas para esta patente, se vinculan solas y se avisa.
    const huerfanas = multasDemo.filter((m) => m.patente === cuerpo.patente);
    huerfanas.forEach((m) =>
      crearNotificacionDemo(`Se vinculó a tu cuenta una multa existente para la patente ${m.patente}: ${m.razon} ($${m.precio})`),
    );
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
    const estado = config.params?.estado as EstadoSesion | undefined;
    const todas = sesionesAdminDemo().filter((sesion) => !estado || sesion.estado === estado);
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

  if (metodo === "get" && url === "/usuarios/admin") {
    const sesion = leerSesion();
    const usuarioPropio: UsuarioAdminRespuesta = {
      id: 1,
      username: sesion?.username ?? "demo",
      dni: "00000000",
      saldo: saldoDemo,
      fechaRegistro: haceMinutos(60 * 24 * 30),
      roles: sesion?.roles ?? [],
      vehiculos: vehiculosDemo,
    };
    return ok(config, [usuarioPropio, ...otrosUsuariosDemo]);
  }
  const matchAjusteSaldo = /^\/usuarios\/admin\/(\d+)\/saldo$/.exec(url);
  if (metodo === "put" && matchAjusteSaldo) {
    const id = Number(matchAjusteSaldo[1]);
    const cuerpo = cuerpoDe<{ monto: number; motivo: string }>(config);

    if (id === 1) {
      saldoDemo += cuerpo.monto;
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

    const usuario = otrosUsuariosDemo.find((u) => u.id === id);
    if (!usuario) return Promise.reject(new Error(`Modo demo: no existe el usuario ${id}`));
    const actualizado: UsuarioAdminRespuesta = { ...usuario, saldo: usuario.saldo + cuerpo.monto };
    otrosUsuariosDemo = otrosUsuariosDemo.map((u) => (u.id === id ? actualizado : u));
    const { vehiculos: _vehiculos, ...data } = actualizado;
    return ok(config, data);
  }

  if (metodo === "post" && url === "/reclamos") {
    const cuerpo = cuerpoDe<{ motivo: MotivoReclamo; descripcion: string }>(config);
    const nuevo: ReclamoRespuesta = {
      id: siguienteIdReclamo++,
      motivo: cuerpo.motivo,
      descripcion: cuerpo.descripcion,
      fechaCreacion: new Date().toISOString(),
      revisado: false,
      respuesta: null,
    };
    reclamosDemo = [nuevo, ...reclamosDemo];
    return ok(config, nuevo, 201);
  }
  if (metodo === "get" && url === "/reclamos") {
    return ok(config, reclamosDemo);
  }
  const matchEliminarReclamo = /^\/reclamos\/(\d+)$/.exec(url);
  if (metodo === "delete" && matchEliminarReclamo) {
    const id = Number(matchEliminarReclamo[1]);
    if (!reclamosDemo.some((r) => r.id === id)) {
      return Promise.reject(new Error(`Modo demo: no existe el reclamo ${id}`));
    }
    reclamosDemo = reclamosDemo.filter((r) => r.id !== id);
    return ok(config, undefined, 204);
  }
  if (metodo === "get" && url === "/reclamos/admin") {
    const page = Number(config.params?.page ?? 0);
    const size = Number(config.params?.size ?? 20);
    const sesion = leerSesion();
    const propiosComoAdmin: ReclamoAdminRespuesta[] = reclamosDemo.map((reclamo) => ({
      ...reclamo,
      username: sesion?.username ?? "demo",
    }));
    const todos = [...propiosComoAdmin, ...reclamosAdminDemo].sort((a, b) =>
      b.fechaCreacion.localeCompare(a.fechaCreacion),
    );
    const contenido = todos.slice(page * size, page * size + size);
    const data: Pagina<ReclamoAdminRespuesta> = {
      content: contenido,
      totalElements: todos.length,
      totalPages: Math.max(1, Math.ceil(todos.length / size)),
      number: page,
      size,
      first: page === 0,
      last: (page + 1) * size >= todos.length,
    };
    return ok(config, data);
  }

  if (metodo === "post" && url === "/usuarios/yo/saldo") {
    const cuerpo = cuerpoDe<{ monto: number }>(config);
    saldoDemo += cuerpo.monto;
    const sesion = leerSesion();
    const data: UsuarioRespuesta = {
      id: 1,
      username: sesion?.username ?? "demo",
      dni: "00000000",
      saldo: saldoDemo,
      fechaRegistro: haceMinutos(60 * 24 * 30),
      roles: sesion?.roles ?? [],
    };
    crearNotificacionDemo(`Se acreditó tu recarga de saldo por $${cuerpo.monto}.`);
    return ok(config, data);
  }

  const matchRevisarReclamo = /^\/reclamos\/admin\/(\d+)\/revisar$/.exec(url);
  if (metodo === "put" && matchRevisarReclamo) {
    const id = Number(matchRevisarReclamo[1]);
    const cuerpo = cuerpoDe<{ respuesta: string }>(config);

    const propio = reclamosDemo.find((r) => r.id === id);
    if (propio) {
      reclamosDemo = reclamosDemo.map((r) => (r.id === id ? { ...r, revisado: true, respuesta: cuerpo.respuesta } : r));
      crearNotificacionDemo("Tu reclamo fue contestado. Por favor, andá a la sección de Reclamos para leerlo.");
      const actualizado: ReclamoAdminRespuesta = {
        ...propio,
        revisado: true,
        respuesta: cuerpo.respuesta,
        username: nombrePropio(),
      };
      return ok(config, actualizado);
    }

    const otro = reclamosAdminDemo.find((r) => r.id === id);
    if (!otro) return Promise.reject(new Error(`Modo demo: no existe el reclamo ${id}`));
    const actualizado: ReclamoAdminRespuesta = { ...otro, revisado: true, respuesta: cuerpo.respuesta };
    reclamosAdminDemo = reclamosAdminDemo.map((r) => (r.id === id ? actualizado : r));
    return ok(config, actualizado);
  }

  const matchEliminarReclamoAdmin = /^\/reclamos\/admin\/(\d+)$/.exec(url);
  if (metodo === "delete" && matchEliminarReclamoAdmin) {
    const id = Number(matchEliminarReclamoAdmin[1]);
    if (reclamosDemo.some((r) => r.id === id)) {
      reclamosDemo = reclamosDemo.filter((r) => r.id !== id);
      return ok(config, undefined, 204);
    }
    if (reclamosAdminDemo.some((r) => r.id === id)) {
      reclamosAdminDemo = reclamosAdminDemo.filter((r) => r.id !== id);
      return ok(config, undefined, 204);
    }
    return Promise.reject(new Error(`Modo demo: no existe el reclamo ${id}`));
  }

  if (metodo === "get" && url === "/notificaciones") {
    return ok(config, notificacionesDemo);
  }
  if (metodo === "post" && url === "/notificaciones/marcar-leidas") {
    notificacionesDemo = notificacionesDemo.map((n) => ({ ...n, leida: true }));
    return ok(config, undefined, 204);
  }
  const matchEliminarNotificacion = /^\/notificaciones\/(\d+)$/.exec(url);
  if (metodo === "delete" && matchEliminarNotificacion) {
    const id = Number(matchEliminarNotificacion[1]);
    if (!notificacionesDemo.some((n) => n.id === id)) {
      return Promise.reject(new Error(`Modo demo: no existe la notificacion ${id}`));
    }
    notificacionesDemo = notificacionesDemo.filter((n) => n.id !== id);
    return ok(config, undefined, 204);
  }

  if (metodo === "get" && url === "/multas") {
    const propias = multasDemo.filter((m) => usernamePorPatente(m.patente ?? "") === nombrePropio());
    return ok(config, propias);
  }
  const matchPagarMulta = /^\/multas\/(\d+)\/pagar$/.exec(url);
  if (metodo === "post" && matchPagarMulta) {
    const id = Number(matchPagarMulta[1]);
    const multa = multasDemo.find((m) => m.id === id && usernamePorPatente(m.patente ?? "") === nombrePropio());
    if (!multa) return Promise.reject(new Error(`Modo demo: no existe la multa ${id} para vos`));
    if (multa.revocada) return Promise.reject(new Error("La multa fue revocada, no corresponde pagarla"));
    if (multa.fuePagada) return Promise.reject(new Error("La multa ya fue pagada"));
    const pagada: MultaRespuesta = { ...multa, fuePagada: true, fechaPago: new Date().toISOString() };
    multasDemo = multasDemo.map((m) => (m.id === id ? pagada : m));
    saldoDemo -= multa.precio;
    crearNotificacionDemo(`Se registró el pago de tu multa: ${multa.razon}`);
    return ok(config, pagada);
  }

  if (metodo === "post" && url === "/multas/admin") {
    const cuerpo = cuerpoDe<{ patente: string; precio: number; razon: string }>(config);
    const patente = cuerpo.patente.toUpperCase();
    const nueva: MultaRespuesta = {
      id: siguienteIdMulta++,
      precio: cuerpo.precio,
      fecha: new Date().toISOString(),
      fuePagada: false,
      fechaPago: null,
      revocada: false,
      razon: cuerpo.razon,
      patente,
    };
    multasDemo = [nueva, ...multasDemo];
    const data = multaConUsername(nueva);
    if (data.username === nombrePropio()) {
      crearNotificacionDemo(`Se registró una multa a tu nombre: ${nueva.razon} ($${nueva.precio})`);
    }
    return ok(config, data, 201);
  }

  if (metodo === "get" && url === "/multas/admin") {
    const patenteFiltro = (config.params?.patente as string | undefined)?.toUpperCase();
    const usernameFiltro = config.params?.username as string | undefined;
    const registradoFiltro = config.params?.registrado as boolean | string | undefined;
    const registrado =
      registradoFiltro === undefined ? undefined : registradoFiltro === true || registradoFiltro === "true";
    const page = Number(config.params?.page ?? 0);
    const size = Number(config.params?.size ?? 20);

    const todas = multasDemo
      .map(multaConUsername)
      .filter((m) => !patenteFiltro || m.patente === patenteFiltro)
      .filter((m) => !usernameFiltro || m.username === usernameFiltro)
      .filter((m) => registrado === undefined || m.vehiculoRegistrado === registrado)
      .sort((a, b) => b.fecha.localeCompare(a.fecha));

    const contenido = todas.slice(page * size, page * size + size);
    const data: Pagina<MultaAdminRespuesta> = {
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

  const matchRevocarMulta = /^\/multas\/admin\/(\d+)\/revocar$/.exec(url);
  if (metodo === "put" && matchRevocarMulta) {
    const id = Number(matchRevocarMulta[1]);
    const multa = multasDemo.find((m) => m.id === id);
    if (!multa) return Promise.reject(new Error(`Modo demo: no existe la multa ${id}`));
    const revocada: MultaRespuesta = { ...multa, revocada: true };
    multasDemo = multasDemo.map((m) => (m.id === id ? revocada : m));
    return ok(config, multaConUsername(revocada));
  }

  if (url.startsWith("/auth/")) {
    return ok(config, undefined, 204);
  }

  return Promise.reject(new Error(`Modo demo: no hay fixture para ${metodo.toUpperCase()} ${url}`));
};
