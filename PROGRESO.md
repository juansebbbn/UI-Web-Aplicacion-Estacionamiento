# Progreso — ui-web

Registro de avance del frontend de estacionamiento medido de Tandil. Consume
`servidor-estacionamiento` (`http://localhost:8080/api/v1`). Ver la
especificación de UI (mensaje inicial de este proyecto) para el detalle de
roles, endpoints y alcance.

## Estado actual — qué falta (al cierre de la Iteración 4, 2026-07-30)

**Las tres vistas imprescindibles de la especificación (USUARIO, INSPECTOR,
ADMINISTRADOR) ya están implementadas** y verificadas — USUARIO e INSPECTOR/
ADMINISTRADOR con métodos distintos, ver Iteración 4. Lo que ya funciona:
registro, login, logout, refresh automático de token; dashboard USUARIO con
saldo y mapa de zonas; alta/listado/baja de vehículos; iniciar sesión de
estacionamiento (vehículo + click en el mapa o geolocalización + verificación
de zona); finalizar sesión con monto cobrado; historial propio; vista pública
de líneas; inspección de patente por INSPECTOR; y panel ADMINISTRADOR (CRUD
de líneas, transferencia de titularidad, tabla paginada de sesiones). Además
hay un **modo demo** dev-only para navegar cualquier rol sin backend (ver
Iteración 4).

**Imprescindibles (v1) sin hacer:**
- [ ] **Empaquetado**: Dockerfile + build estático servido con nginx (la
      spec lo pide para alinear con el `docker-compose.yml` del backend). No
      se creó todavía. Es lo único que queda del alcance imprescindible de
      la especificación original.

**Deseables (si da el tiempo), sin empezar:**
- [ ] Cronómetro en vivo del tiempo/costo estimado de la sesión activa
      (calculado en el cliente a partir de `horaInicio` y la tarifa de zona;
      hoy `DashboardUsuario` solo muestra la hora de inicio, sin costo
      corriendo en vivo).
- [ ] Toasts de éxito/error en vez del banner `MensajeError` actual (que
      sigue siendo el único mecanismo de feedback en todas las páginas).
- [ ] Tests E2E con Playwright versionados en el repo. Se verificó a mano
      contra el backend real (Iteraciones 2 y 3) y contra el modo demo
      (Iteración 4), pero esos scripts quedaron en el scratchpad de la
      sesión de trabajo, no como suite en el repo.
- [ ] Dark mode: hoy solo hay `@media (prefers-color-scheme: dark)` parcial
      en algunos CSS Modules, sin cobertura completa ni toggle manual.

**Deuda de testing:** los únicos tests automatizados hoy son de `src/api/`
(`almacenTokens.test.ts`, `errores.test.ts`). No hay ningún test de
componentes ni de páginas (`Login`, `Registro`, `DashboardUsuario`,
`Vehiculos`, `Historial`, `Lineas`, `Inspeccion`, `Administracion`, `Layout`,
`RutaProtegida`, `MapaZonas`, `PanelModoDemo`) todavía — todo lo de UI se
verificó manualmente con Playwright, no con Vitest/RTL. Tampoco hay test de
`fixturesDemo.ts`/`modoDemo.ts` (el adapter que sirve el modo demo).

**Sobre el modo demo (ver Iteración 4 para el detalle técnico):** es una
herramienta de desarrollo, no un requisito de la especificación. Sirve datos
ficticios desde `src/api/fixturesDemo.ts` en vez de pegarle al backend real
cuando la sesión tiene `demo: true`. Vive detrás de `import.meta.env.DEV` en
todos los puntos de entrada (`modoDemo.ts`, `cliente.ts`, `Login.tsx`), así
que Vite lo saca del bundle en `vite build` (producción) — pero **si algún
día se agrega un endpoint nuevo, hay que agregar también su fixture en
`fixturesDemo.ts`** o el modo demo va a rechazar esa llamada con un error de
"no hay fixture para X" en vez de fallar silenciosamente.

**Deuda menor detectada en el camino (no bloqueante):**
- [ ] `DashboardUsuario` no tiene forma de "cancelar" una coordenada ya
      elegida en el mapa sin hacer otro click; tampoco valida que el click
      esté dentro de un radio razonable antes de llamar a `/zonas/verificacion`
      (llama a la API en cada click, sin debounce — no es un problema real
      con el volumen esperado, pero vale la pena tenerlo presente si se
      agregan más zonas).
- [ ] La lista de líneas (`Lineas.tsx`) no se probó visualmente con datos
      reales: la base de desarrollo no tiene líneas sembradas, así que solo
      se vio el estado vacío ("No hay líneas cargadas."). El path con datos
      usa el mismo patrón ya probado en zonas/vehículos/sesiones, pero no
      se vio andar con línea reales en pantalla.

**Explícitamente fuera de alcance** (no implementar aunque se pida sin
volver a confirmar): pagos reales, notificaciones push, recuperación de
contraseña/verificación de email, gestión de roles desde la UI, app nativa
mobile.

## Iteración 1 — 2026-07-30

**Qué se hizo:**
- Decisiones abiertas de la especificación resueltas con el usuario: se agrega
  `CorsConfigurationSource` en `servidor-estacionamiento` (commit aparte en ese
  repo), `ui-web` es un repo git propio (no monorepo), y el `refreshToken` se
  guarda en `localStorage` (el backend no usa cookies httpOnly).
- Scaffold con Vite (`react-ts`) + React 19 + TypeScript, sin el contenido de
  demo (landing, assets, `App.css`).
- Dependencias instaladas: `react-router-dom`, `@tanstack/react-query`,
  `axios`, `leaflet` + `react-leaflet`; devDependencies de testing (`vitest`,
  `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`) y `@types/leaflet`.
- Estructura de carpetas: `api`, `tipos`, `contextos`, `rutas` (`paginas` y
  `componentes` quedan para cuando haya paginas reales que las llenen).
- `src/tipos/`: interfaces TS que espejan uno a uno los DTOs del backend
  (leidos directamente del código Java, no adivinados): `autenticacion`,
  `usuario`, `vehiculo`, `zona`, `sesion`, `linea`, `comun` (`Coordenada`,
  `Pagina<T>`) y `problema` (RFC 7807).
- `src/api/`: `cliente.ts` (instancia de Axios con interceptor de refresh
  automático en 401, con cola para no disparar refrescos concurrentes) +
  `almacenTokens.ts` (persistencia en localStorage con evento de cambio) +
  un módulo por feature (`auth`, `usuarios`, `vehiculos`, `zonas`, `sesiones`,
  `lineas`) que envuelve cada endpoint con sus tipos.
- `src/contextos/`: `ProveedorAutenticacion` + hook `useAutenticacion`
  (usuario actual, roles, `iniciarSesion`/`registrarse`/`cerrarSesion`),
  sincronizado con lo que haga el cliente HTTP (ej. logout forzado si el
  refresh token quedó invalidado).
- `src/rutas/RutaProtegida.tsx`: guard genérico por autenticación y rol
  opcional, para usarlo en el enrutado real del próximo módulo.
- Vitest configurado (`vite.config.ts` + `src/test/configuracion.ts` con
  `jest-dom`); primer test (`almacenTokens.test.ts`) cubriendo guardar/leer/
  limpiar sesión y el evento de cambio.
- Verificado manualmente: `tsc -b`, `oxlint` y `vitest run` en verde; y
  `npm run dev` sirviendo la app real en el navegador (sin errores de consola
  ni de transformación de Vite).

**Decisiones importantes tomadas:**
- El fix de CORS en el backend no tiene `allowCredentials`: la autenticación
  viaja por header `Authorization`, no por cookies.
- El interceptor de refresh usa una instancia de Axios *separada* (sin
  interceptores) para llamar a `/auth/refrescar`, evitando que un 401 en el
  propio refresco dispare un loop.
- Se descubrió que Node 26 expone un `localStorage` global experimental
  propio que pisa al de jsdom en los tests (`--no-experimental-webstorage`
  soluciona el problema). Ver `vite.config.ts` (`environmentOptions.jsdom.url`)
  y el script `test` en `package.json`.
- `react-router-dom` queda en `7.18.2` (la última publicada) a pesar de que
  `npm audit` marca una vulnerabilidad "high": es especifica de **RSC Mode**
  (React Server Components), que esta app no usa (SPA pura con
  `BrowserRouter`). Bajar de versión reintroduce muchas más vulnerabilidades
  reales (XSS, DoS, RCE) que sí aplican a cualquier uso. No correr
  `npm audit fix --force` en este paquete sin volver a evaluar esto.
- `index.css` se dejó mínimo (reset + tipografía base): los estilos por
  componente van en CSS Modules, no en un CSS global tipo landing.

**Próximos pasos:**
- [x] Scaffold, dependencias, estructura de carpetas
- [x] Tipos TS espejando los DTOs del backend
- [x] Cliente HTTP con refresh automático + contexto de autenticación
- [x] Enrutado real (`react-router`) + páginas: login, registro, dashboard USUARIO
- [x] Mapa de zonas (Leaflet)
- [x] Manejo de errores RFC 7807 traducido a mensajes legibles
- [ ] Alta/listado de vehículos
- [ ] Iniciar/finalizar sesión de estacionamiento (click en el mapa) + historial
- [ ] Vista INSPECTOR (búsqueda de patente)
- [ ] Vista ADMINISTRADOR (líneas, transferencia de titularidad, tabla paginada de sesiones)
- [ ] Tests de componentes/páginas críticas (por ahora solo `api/`)

## Iteración 2 — 2026-07-30

**Qué se hizo:**
- `src/paginas/`: `Login`, `Registro` (con validación HTML básica espejando las
  constraints del backend: username 4-50, password 8+, DNI 7-9 dígitos),
  `Inicio` (redirige según rol) y `DashboardUsuario` (saldo + mapa de zonas).
- `src/componentes/`: `Layout` (header con usuario/roles/logout + `Outlet`),
  `MensajeError` (banner de error reutilizable) y `MapaZonas` (Leaflet:
  polígonos por zona, tooltip con nombre y tarifa, `fitBounds` automático).
- `src/api/errores.ts`: traduce un `AxiosError<ProblemaHttp>` a un mensaje
  legible (prioriza `errores[]` de validación sobre `detail`). Con tests.
- `src/tipos/roles.ts`: constantes de rol.
- `App.tsx` con el árbol de rutas real: `/login`, `/registro` públicas;
  `/` y `/estacionamiento` protegidas via `RutaProtegida` + `Layout`.
- **Verificación end-to-end contra el backend real** (Colima + MySQL en
  Docker + `servidor-estacionamiento` en perfil `dev` + `ui-web` en
  `npm run dev`), con Playwright headless:
  - Registro → dashboard con saldo `$ 0,00` y el polígono de la zona de
    Tandil visible en el mapa → logout → login → dashboard de nuevo. Sin
    errores de consola.
  - Interceptor de refresh probado a propósito: se corrompió el
    `accessToken` en `localStorage`, se recargó `/estacionamiento`, y la
    app refrescó sola (un único `POST /auth/refrescar`, sin duplicarse
    aunque dos requests pisaran el 401 casi al mismo tiempo) y se quedó en
    el dashboard con un `accessToken` nuevo.
  - Capturas en la sesión de trabajo (no versionadas).

**Decisiones importantes tomadas / hallazgos:**
- **La especificación original tenía mal los nombres de rol.** Decía
  `USER`/`INSPECTOR`/`ADMINISTRADOR`, pero el backend devuelve las
  authorities completas de Spring Security: `ROLE_USUARIO`,
  `ROLE_INSPECTOR`, `ROLE_ADMINISTRADOR` (ver `RolNombre.java` y
  `UsuarioPrincipal.getAuthorities()`). Se detectó probando contra el
  backend real, no leyendo el código: `tieneRol("USER")` nunca daba `true`
  y el usuario quedaba atascado en `Inicio`. Centralizado en
  `src/tipos/roles.ts` para no repetir el string mal en cada lugar.
- El saldo y la tarifa se formatean con `Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" })`
  (`src/utils/formato.ts`), asumiendo pesos argentinos (no está en la
  especificación, pero es lo consistente con "Tandil").
- Verificación manual del backend hecha con un `.env` local ad-hoc en
  `servidor-estacionamiento` (gitignorado) y `docker compose up -d mysql`
  + `mvnw spring-boot:run` con perfil `dev`; todo se detuvo al terminar.

## Iteración 3 — 2026-07-30

**Qué se hizo:**
- `src/paginas/Vehiculos.tsx`: alta (formulario patente + tipo), listado y
  baja de vehículos propios, con `useMutation` + invalidación de
  `["vehiculos"]`.
- `src/paginas/Historial.tsx`: tabla de sesiones propias (patente, zona,
  inicio, fin, estado, monto), ordenada por más reciente primero.
- `src/paginas/Lineas.tsx`: vista **pública** de líneas de colectivo (ruta
  `/lineas` fuera de `RutaProtegida`, con link "Volver" que apunta a `/` o
  `/login` según si hay sesión).
- `src/componentes/MapaZonas.tsx` extendido para ser interactivo: click en
  el mapa para elegir coordenada (`useMapEvents`), marcador en el punto
  elegido, y recentrado (`flyTo`) cuando cambia. Se corrigió también el
  ícono default de Leaflet (rompe con el bundling de Vite si no se pisan
  las URLs a mano) y se ajustó `AjustarVistaAZonas` para que el
  `fitBounds` inicial corra una sola vez (con un `ref`, no en cada refetch
  de React Query) y no le pise al usuario la vista mientras elige dónde
  estacionar.
- `src/paginas/DashboardUsuario.tsx` extendido: si hay sesión activa,
  muestra patente/zona/hora de inicio y el botón "Finalizar sesión" (con el
  monto cobrado al finalizar, invalidando saldo y sesiones). Si no hay
  sesión activa, muestra el selector de vehículo propio, un botón "Usar mi
  ubicación" (`navigator.geolocation`), y el mapa interactivo con
  verificación de zona en vivo (`POST /zonas/verificacion` en cada click,
  vía `useQuery` habilitado por la coordenada elegida); "Estacionar acá" se
  habilita solo si la coordenada cae dentro de una zona.
- `src/utils/formato.ts`: se agregó `formatearFecha` (`Intl.DateTimeFormat`)
  para mostrar `horaInicio`/`horaFin`.
- `src/componentes/Layout.tsx`: nav con links a Mi estacionamiento,
  Vehículos, Historial (solo si `tieneRol(ROL_USUARIO)`) y Líneas de
  colectivo (siempre).
- `App.tsx`: rutas nuevas `/vehiculos`, `/historial` (protegidas, rol
  USUARIO) y `/lineas` (pública).
- **Verificación end-to-end contra el backend real** (mismo setup que la
  Iteración 2: Colima + MySQL + `servidor-estacionamiento` perfil `dev` +
  `ui-web` con `npm run dev`), con Playwright headless y geolocalización
  simulada (`context.setGeolocation` sobre el centro real de la única zona
  sembrada, "Microcentro Tandil"):
  - Registro → alta de vehículo → volver al dashboard → elegir vehículo →
    "Usar mi ubicación" → "Dentro de la zona 'Microcentro Tandil'" →
    "Estacionar acá" → tarjeta de sesión activa → "Finalizar sesión" →
    banner "Se cobraron $ 100,00" → saldo del header pasa a **-$100,00**
    (rojo) → Historial muestra la fila finalizada → `/lineas` carga
    (vacía, sin datos sembrados en dev). Sin errores de consola en ningún
    paso.
  - Se detectó y corrigió en el momento un bug de test (no de la app): el
    script reusaba un DNI fijo entre corridas y pisaba la restricción de
    unicidad (409) — confirmó, de paso, que el manejo de errores 409
    funciona.

**Decisiones importantes tomadas / hallazgos:**
- El ícono default de `leaflet` (`L.Icon.Default`) hay que pisarlo a mano
  con `mergeOptions` apuntando a los PNG importados vía Vite
  (`marker-icon.png`, `marker-icon-2x.png`, `marker-shadow.png`): es un
  problema conocido de Leaflet con cualquier bundler moderno, no algo
  específico de este proyecto.
- El `fitBounds` automático de `MapaZonas` se cambió para correr una sola
  vez (antes se disparaba en cada cambio de referencia del array `zonas`,
  lo cual con `refetchOnWindowFocus` de React Query podía volver a
  centrar el mapa de golpe mientras el usuario estaba con el dedo eligiendo
  dónde estacionar).
- `iniciar()` de sesión no cobra nada (el saldo no cambia al iniciar, solo
  valida el límite de deuda); el cobro real ocurre recién en `finalizar()`.
  Confirmado en vivo contra el backend, no solo leyendo el código: el saldo
  se mantuvo en `$0,00` con la sesión activa y bajó a `-$100,00` recién
  después de finalizar.
- Se sigue sin poder probar las vistas INSPECTOR/ADMINISTRADOR en un
  navegador real porque el registro público solo puede crear
  `ROLE_USUARIO`. Cuando se construyan esas páginas (próxima iteración) va
  a hacer falta asignar esos roles a mano en la base para poder
  verificarlas end-to-end como se hizo con USUARIO.

## Iteración 4 — 2026-07-30

**Qué se hizo:**
- `src/paginas/Inspeccion.tsx`: campo de patente + `GET /sesiones/inspeccion/{patente}`
  (vía `useMutation`, no `useQuery`, porque es una consulta on-demand
  disparada por el usuario, no algo para cachear por key estable). Muestra
  sesión activa (con hora de inicio) o "no tiene sesión activa", sin ningún
  dato del dueño (el backend ya no lo expone).
- `src/paginas/Administracion.tsx`: panel con tres secciones independientes
  (`SeccionLineas`, `SeccionTitularidad`, `SeccionSesiones`, como
  subcomponentes internos del mismo archivo — no hay reuso fuera de esta
  página, no ameritaba separarlos): CRUD completo de líneas (alta, edición
  inline de nombre/color, baja — el número queda fijo, es inmutable en el
  backend), transferencia de titularidad de un vehículo, y tabla paginada de
  `GET /sesiones/admin` con controles anterior/siguiente basados en
  `pagina.first`/`pagina.last`.
- `Inicio.tsx` extendido: cada rol va directo a su sección (USUARIO →
  `/estacionamiento`, INSPECTOR → `/inspeccion`, ADMINISTRADOR → `/admin`,
  prioridad arbitraria si hay más de uno).
- `App.tsx` y `Layout.tsx`: rutas `/inspeccion` y `/admin` (protegidas por
  rol) y sus links de nav condicionales.
- **Modo demo** (pedido explícito del usuario: "agrega una auth falsa para
  poder ir viendo la ui"): sin esto, probar INSPECTOR/ADMINISTRADOR requiere
  asignar el rol a mano en la base (ver Iteración 3) — no viable para ir
  iterando la UI rápido. Piezas nuevas:
  - `src/api/almacenTokens.ts`: `SesionAlmacenada` gana un campo opcional
    `demo?: boolean`; `guardarSesion()` acepta `{ demo }`.
  - `src/api/modoDemo.ts`: `activarModoDemo(rol)` guarda una sesión falsa
    (mismo mecanismo que un login real, así que `ContextoAutenticacion` la
    recoge solo, sin cambios) marcada `demo: true`. No hace nada si
    `!import.meta.env.DEV`.
  - `src/api/fixturesDemo.ts`: un `AxiosAdapter` a medida (`adaptadorDemo`)
    que reemplaza al adapter real de Axios cuando la sesión es demo, con
    datos en memoria (vehículos, sesiones, líneas, zonas — la zona real de
    Tandil más una inventada) que se van mutando con las llamadas de alta/
    baja/iniciar/finalizar, como un backend de juguete. La verificación de
    zona en modo demo siempre da positivo (no se reimplementó
    point-in-polygon: no vale la pena solo para una vista previa visual).
  - `cliente.ts`: el interceptor de request pasó a ser `async` y, si la
    sesión es demo (y `import.meta.env.DEV`), hace `import()` dinámico de
    `fixturesDemo.ts` y pisa `config.adapter`. El import dinámico es a
    propósito: así Vite puede sacar `fixturesDemo.ts` completo del bundle
    de producción.
  - `src/componentes/PanelModoDemo.tsx`: tres botones ("Entrar como
    Usuario/Inspector/Administrador") agregados al final de `Login.tsx`,
    detrás de `{import.meta.env.DEV && ...}`.
  - `Layout.tsx` muestra un banner amarillo fijo "MODO DEMO — datos
    ficticios, no hay backend real detrás" mientras la sesión sea demo, para
    que nunca se confunda con datos reales.
- **Verificación**: contra el backend real (regresión — se probó de nuevo
  registro/login y el interceptor de refresh ante un 401 real, para
  confirmar que volver `async` el interceptor de request no rompió nada) y
  contra el modo demo (sin backend/Docker/MySQL corriendo): login como
  Administrador → CRUD de líneas, transferencia de titularidad, paginación
  de sesiones (2 páginas) todo funcionando; login como Inspector → patente
  genérica da "sesión activa", patente `"LIBRE"` da "sin sesión activa";
  login como Usuario → dashboard con saldo/mapa/vehículo semilla e historial
  con una sesión finalizada semilla. Sin errores de consola en ningún caso.
  Se encontró y corrigió en el camino un bug real (no del modo demo): en
  `Inspeccion.tsx` la fecha formateada en formato `es-AR` ya termina en
  punto para "a. m."/"p. m.", y el texto le agregaba otro punto atrás
  ("12:33 a. m..") — se sacó el punto final y se separó en dos líneas.

**Decisiones importantes tomadas:**
- El modo demo pisa el `adapter` de Axios por request (no reemplaza la
  instancia de `cliente` entera) para poder seguir usando el mismo
  interceptor de request que adjunta el `Authorization` header — así el
  código de cada `api/*.ts` no necesita saber si está en modo demo o no.
- Se decidió no usar MSW (Mock Service Worker) ni otra librería para esto:
  es un caso de uso chico (una decena de endpoints, todos ya tipados) y un
  adapter a medida evita una dependencia nueva y un service worker que
  registrar/desregistrar.
- El "backend de juguete" del modo demo vive en memoria (variables de módulo
  en `fixturesDemo.ts`) y se reinicia con cada recarga de página — a
  propósito, no vale la pena persistirlo en `localStorage` para una
  herramienta de solo-desarrollo.
