# Progreso — ui-web

Registro de avance del frontend de estacionamiento medido de Tandil. Consume
`servidor-estacionamiento` (`http://localhost:8080/api/v1`). Ver la
especificación de UI (mensaje inicial de este proyecto) para el detalle de
roles, endpoints y alcance.

## Estado actual — qué falta (al cierre de la Iteración 12, 2026-07-30)

La Iteración 12 eliminó por completo el backend de líneas de colectivo:
ahora todo (numero/nombre/color/recorrido) vive hardcodeado en el
frontend, sin ningún fetch. El backend correspondiente también se borró
(repo aparte, ver su propio PROGRESO.md). La Iteración 11 agregó
selección de línea + recorrido en el mapa, con datos de recorrido
hardcodeados en el frontend (ilustrativos, no reales — ver esa iteración
antes de asumir que son datos verdaderos). La
Iteración 10 corrigió que "Líneas de colectivo" abriera como una
página suelta sin sidebar/topbar al clickearla desde el nav estando
logueado — ahora se abre dentro del Layout normal, al lado del sidebar,
sin perder el acceso público sin cuenta. Ver esa iteración para el
detalle. La Iteración 9 reubicó el acceso de usuario (nombre/roles/logout) al pie
del sidebar y el toggle de tema a la topbar (antes al revés: usuario en
la topbar, toggle flotante fijo). De paso se encontró y corrigió un bug
real de layout en desktop (el sidebar se estiraba con el alto del
contenido). Ver esa iteración para el detalle. La Iteración 8 cambió la
navegación de nav horizontal (pills) a sidebar izquierdo fijo, con drawer
off-canvas en pantallas <=900px (hamburguesa + overlay). Ver esa
iteración para el detalle. Además de todo lo de la
Iteración 6, se completó un **rediseño visual
completo** (Iteración 7: paleta tipo dashboard fintech, dark mode
conservado y mejorado). Ver esa iteración para el detalle. No cambió
ningún endpoint, query, mutation ni regla de negocio — solo CSS Modules,
estructura JSX y (donde el texto/markup cambió) los specs E2E que lo
verificaban literalmente.

**Todo el alcance imprescindible (v1) Y los cuatro deseables de la
especificación original están completos.** Ver Iteración 6 para el detalle
de los deseables (cronómetro, toasts, Playwright, dark mode). Lo que
funciona, verificado (backend real para USUARIO/empaquetado; modo demo +
Playwright versionado para los tres roles y el tema): registro, login,
logout, refresh automático de token; dashboard USUARIO con saldo, mapa de
zonas, cronómetro en vivo y costo estimado de la sesión activa;
alta/listado/baja de vehículos; iniciar/finalizar sesión de estacionamiento;
historial propio; vista pública de líneas; inspección de patente; panel
ADMINISTRADOR completo; build de producción con Docker/nginx; toasts de
éxito/error en toda la app; y tema claro/oscuro (automático + toggle manual
persistente). Modo demo dev-only, confirmado ausente del bundle de
producción.

**Imprescindibles (v1) y deseables: nada pendiente.**

**Lo único que queda, y es deuda pre-existente (no un deseable de la spec):**
- [ ] **Tests de componentes/páginas con Vitest + React Testing Library.**
      Los únicos tests automatizados fuera de Playwright siguen siendo los
      de `src/api/` (`almacenTokens.test.ts`, `errores.test.ts`). Ninguna
      página ni componente (`Login`, `Registro`, `DashboardUsuario`,
      `Vehiculos`, `Historial`, `Lineas`, `Inspeccion`, `Administracion`,
      `Layout`, `RutaProtegida`, `MapaZonas`, `PanelModoDemo`,
      `ProveedorToasts`, `ConmutadorTema`) tiene test unitario/de
      integración con RTL — toda la cobertura de UI hoy es Playwright (E2E,
      ver `e2e/`) más verificación manual. No es necesariamente un problema
      (el E2E contra el modo demo cubre los flujos reales de punta a punta),
      pero si se agregan más componentes con lógica no trivial (branching,
      cálculos) valdría la pena sumar tests unitarios puntuales en vez de
      seguir apoyándose solo en E2E.
- [ ] Tampoco hay test unitario de `fixturesDemo.ts`/`modoDemo.ts` en sí
      mismos (se validan indirectamente porque el E2E los usa como
      "backend").

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

## Iteración 5 — 2026-07-30

**Qué se hizo:**
- `Dockerfile` multi-stage: `node:22-alpine` compila (`npm ci` + `npm run
  build`), `nginx:1.27-alpine` sirve `dist/`. `VITE_API_BASE_URL` entra como
  `ARG`/`ENV` del stage de build (Vite lo resuelve en build time, no en
  runtime — no hay forma de cambiarlo sin reconstruir la imagen).
- `nginx.conf`: `try_files ... /index.html` para que las rutas de React
  Router no den 404 al refrescar la página; cache agresivo e inmutable para
  `/assets/` (tienen hash en el nombre) y `no-cache` para `index.html` (para
  que un deploy nuevo se vea sin esperar expiración de cache).
- `docker-compose.yml` propio de `ui-web` (independiente del de
  `servidor-estacionamiento`: son repos separados, cada uno con su ciclo de
  vida): un solo servicio nginx, puerto configurable por `UI_WEB_PORT`
  (default `8081`).
- `.env.example` y README actualizados: se aclara que `VITE_API_BASE_URL`
  para Docker tiene que ser la URL **pública** real del backend, no
  `localhost` (eso solo vale para `npm run dev`).
- **Se encontró y corrigió una fuga real del modo demo hacia el bundle de
  producción**: el string `"MODO DEMO"` del banner de `Layout.tsx`
  aparecía en el JS de producción (`grep` sobre `dist/assets/*.js` lo
  confirmó) porque `estaEnModoDemo()` no chequeaba `import.meta.env.DEV`
  — solo lo chequeaba `activarModoDemo()`. El fix fue en dos partes: (1)
  `estaEnModoDemo()` ahora también exige `import.meta.env.DEV`, y (2) el
  chequeo se repite *literal* en el punto de uso de `Layout.tsx`
  (`import.meta.env.DEV && estaEnModoDemo() && (...)`), porque el bundler
  no propaga el `false` a través de una llamada a función de otro módulo —
  solo puede eliminar una rama muerta si el `import.meta.env.DEV` aparece
  textualmente ahí mismo. Reconfirmado con `grep` tras el fix: cero
  coincidencias de `"MODO DEMO"`, `"Entrar como"`, `"fixturesDemo"`,
  `"adaptadorDemo"` o `"modo-demo"` en el bundle de producción.
- **Verificación completa**: `docker compose build` + `up` levantó nginx en
  `localhost:8081`; se confirmó por HTTP que `/login` y `/estacionamiento`
  devuelven 200 (fallback de SPA funcionando) y los headers de cache son los
  esperados. Con Playwright: la página de login servida desde el contenedor
  no tiene el panel de modo demo (confirmado, 0 apariciones). Con el backend
  real levantado (Colima + MySQL + perfil `dev`, `CORS_ORIGENES_PERMITIDOS`
  apuntando a `localhost:8081`) y la imagen reconstruida apuntando a
  `http://localhost:8080/api/v1`: registro → dashboard con saldo y mapa,
  todo servido desde nginx en Docker, sin errores de consola.

**Decisiones importantes tomadas:**
- `ui-web` tiene su propio `docker-compose.yml`, no se agregó como servicio
  al `docker-compose.yml` de `servidor-estacionamiento`: son dos repos git
  independientes (decisión de la Iteración 1), cada uno se despliega por su
  cuenta. El frontend le habla al backend por su URL pública HTTP, no por
  red interna de Docker Compose compartida.
- No se armó un mecanismo de inyección de variables de entorno en runtime
  (tipo `entrypoint.sh` generando un `config.js` al arrancar el contenedor):
  la spec solo pide que la URL sea "configurable vía variable de entorno",
  y Vite ya cumple eso en build time. Agregar inyección en runtime sería
  resolver un problema que nadie pidió.

## Iteración 6 — 2026-07-30

**Qué se hizo (los cuatro deseables de la especificación):**

- **Cronómetro en vivo**: `src/utils/useTiempoTranscurrido.ts` (hook con
  `setInterval` de 1s) + `formatearDuracion()` en `utils/formato.ts`
  (mm:ss / hh:mm:ss). `DashboardUsuario` muestra el cronómetro y un "costo
  estimado" (`minutos transcurridos × tarifaPorMinuto` de la zona, buscada
  por nombre en `zonas.data` ya que `SesionRespuesta` no trae el id de
  zona), aclarando explícitamente que el monto final lo calcula el
  servidor — para no dar la impresión de que el número mostrado es
  autoritativo.
- **Toasts**: `src/contextos/ProveedorToasts.tsx` + `contextoToasts.ts`
  (mismo patrón contexto/hook separado que `ContextoAutenticacion`, por el
  warning de fast-refresh ya conocido de la Iteración 2). Reemplazan el
  `MensajeError` que estaba pegado a cada formulario/botón (login, registro,
  alta/baja de vehículo, iniciar/finalizar sesión, CRUD de líneas,
  transferencia de titularidad, inspección) por notificaciones flotantes
  (4s, con botón de cierre manual). **`MensajeError` no desapareció**: se
  mantuvo a propósito para los errores de carga de datos de `useQuery`
  (perfil, zonas, vehículos, sesiones, líneas) — un toast que desaparece
  solo mientras la página se queda sin datos y sin ninguna explicación
  visible sería peor UX que un banner persistente. Es una desviación
  deliberada de la redacción literal del deseable ("en vez del banner"),
  documentada acá en vez de aplicada a ciegas.
- **Dark mode completo**: se centralizó toda la paleta como variables CSS
  (`--color-*`) en `src/index.css`, con tres bloques (`:root` para
  `prefers-color-scheme: light`, `@media (prefers-color-scheme: dark)`, y
  `:root[data-theme="dark"]` / `:root[data-theme="light"]` para el toggle
  manual) en vez de un bloque `@media (prefers-color-scheme: dark)`
  duplicado por CSS Module (que era el estado post-Iteración 5). Todos los
  CSS Modules migrados a `var(--color-*)`. `src/utils/useTema.ts`
  (claro/oscuro/sistema, persistido en `localStorage`) +
  `src/componentes/ConmutadorTema.tsx` (botón fijo, monta una sola vez en
  `App.tsx`, visible en toda la app incluyendo login/registro). Script
  inline en `index.html` que aplica el tema guardado antes del primer
  paint, para no arrancar en claro y parpadear a oscuro un instante
  después.
- **Tests E2E con Playwright versionados**: `@playwright/test` +
  `playwright.config.ts` (levanta `npm run dev` solo) + `e2e/` con specs
  para los tres roles (`usuario.spec.ts`, `inspector.spec.ts`,
  `administrador.spec.ts`) y el tema (`tema.spec.ts`), todos corriendo
  contra el **modo demo** — cero dependencia de backend/MySQL/Docker, lo
  que los hace viables para correr siempre, no solo cuando hay
  infraestructura levantada. `npm run test:e2e`.
- **Se encontró y corrigió un problema real al armar la suite**: Vitest
  intentaba correr los specs de `e2e/` como si fueran suyos (mismo nombre
  de convención `*.spec.ts`) y fallaban por usar el `test`/`expect` de
  `@playwright/test`. Se agregó `exclude: ["**/e2e/**"]` a la config de
  Vitest en `vite.config.ts`.

**Verificación:**
- `npm run test:e2e`: 9/9 tests en verde (dashboard con mapa, alta/baja de
  vehículo con toasts, iniciar→cronómetro→finalizar→toast→historial,
  inspección de patente genérica y `"LIBRE"`, CRUD de líneas con toast,
  transferencia de titularidad con toast, paginación de sesiones, y el
  ciclo completo del conmutador de tema incluyendo persistencia tras
  recargar la página).
- Revisión visual manual con capturas en dark mode (login, dashboard con
  sesión activa/cronómetro/toast, vehículos, admin): buen contraste en
  todos los casos, sin texto ilegible.
- `npm run build` + `grep` sobre `dist/assets/*.js`: el modo demo sigue
  completamente ausente del bundle de producción después de todo este
  refactor (mismo chequeo que en la Iteración 5).
- `tsc -b`, `oxlint` y `npm test` (Vitest, ahora sin pisarse con Playwright)
  en verde.

**Decisiones importantes tomadas:**
- Se detectó a tiempo un error de diseño de color: la primera versión
  reutilizaba el token pensado para "texto de banner de éxito" (oscuro,
  para leerse sobre un fondo verde claro) como color de texto suelto sobre
  el fondo normal de la página (`.dentroDeZona` en el dashboard) — en dark
  mode esto daba verde oscuro sobre fondo casi negro, ilegible. Se separó
  en dos tokens: `--color-exito` (vívido, para texto/íconos sueltos) y
  `--color-exito-fondo`/`--color-exito-texto`/`--color-exito-borde` (para
  banners con fondo tintado). Se encontró revisando la paleta antes de
  darla por buena, no en una captura de pantalla después.
- Los toasts de éxito se agregaron también donde antes no había ningún
  feedback de éxito visible (alta/baja de vehículo, iniciar sesión, CRUD de
  líneas, transferencia de titularidad): no era estrictamente parte del
  pedido ("reemplazar MensajeError"), pero es la misma categoría de
  feedback de acción y hubiese sido inconsistente no cubrirlo.

## Iteración 7 — 2026-07-30

**Qué se hizo:** rediseño visual completo pedido por el usuario, tomando
prestado el lenguaje visual de dashboards fintech tipo Bull Market
(broker argentino) — cards con sombra suave, jerarquía fuerte de números,
paleta con acento azul eléctrico — aplicado a los datos de estacionamiento.
Alcance explícitamente acotado a estilos/layout/estructura visual: **cero
cambios** de endpoints, queries, mutations o reglas de negocio. Un commit
por componente, en este orden:

1. **Tokens de diseño** (`src/index.css`): nueva paleta con `--color-fondo`
   (fondo de página) separado de `--color-superficie` (fondo de tarjetas),
   acento azul eléctrico (`--color-primario`, decisión del usuario entre
   azul/índigo/verde), tokens nuevos de advertencia/naranja
   (`--color-advertencia*`, para futuros estados "por vencer" que la
   spec pedía pero el modelo de datos actual no expone todavía a nivel de
   lugar individual) y tokens de radio/sombra (`--radio-tarjeta`,
   `--radio-control`, `--sombra-tarjeta`). Mismo esquema de tres bloques
   que ya usaba el proyecto (`:root` claro por defecto,
   `@media (prefers-color-scheme: dark)`, `[data-theme]` manual) — no se
   tocó la arquitectura de dark mode, ya estaba bien resuelta desde la
   Iteración 6.
2. **Layout**: header sticky con logo/marca, nav convertida a pills con
   estado activo (`Link` → `NavLink`), contenido centrado con ancho máximo
   para pantallas grandes.
3. **ConmutadorTema**: el botón único que ciclaba sistema→claro→oscuro
   pasó a un segmented control de 3 íconos SVG inline (sin dependencia
   nueva), fijo abajo a la derecha — un toggle explícito en vez de uno que
   obliga a adivinar en qué paso del ciclo está.
4. **DashboardUsuario** (la pieza central): saldo/tiempo
   estacionado/costo estimado pasan a una fila de "stat cards" con
   números grandes tipo hero (como el "Total de la Cuenta" de un
   dashboard financiero); la sesión activa pasa de texto plano a un
   ticket con badge "Activa"; el mapa de zonas queda dentro de una
   tarjeta con el mismo lenguaje visual.
5. **Vehículos**: formulario como tarjeta separada, listado con íconos
   auto/moto (SVG inline) en vez de texto plano.
6. **Historial**: tabla envuelta en tarjeta, encabezados en mayúscula
   gris chica (patrón "Mis Inversiones"), estado como badge, monto
   alineado a la derecha con `tabular-nums`.
7. **Inspección**: resultado como tarjeta con insignia de estado y la
   patente como cifra grande, en vez de un párrafo con color.
8. **Administración**: las tres secciones (líneas, titularidad, sesiones)
   pasan a tarjetas; líneas reusa el patrón de filas de Vehículos; la
   tabla de sesiones reusa el patrón de Historial.
9. **Login/Registro**: tarjeta de auth centrada con logo/marca arriba.
10. **Líneas de colectivo** (pública): listado como tarjetas, igual que
    Vehículos/Administración.
11. **Pulido final**: toasts, `MensajeError` y `PanelModoDemo` migrados a
    los tokens `--radio-control`/`--sombra-tarjeta-hover` para que no
    quedara ningún radio/sombra hardcodeado suelto.

**Verificación:**
- `tsc -b`, `oxlint` y `vitest run` en verde después de cada paso.
- Revisión visual con Playwright (capturas manuales, no versionadas) del
  dashboard, login y administración en claro/oscuro y en mobile
  (390×844) y tablet (820×1100): contraste correcto en ambos temas, nav
  con scroll horizontal en mobile, tablas con scroll horizontal propio
  dentro de la tarjeta (mismo comportamiento pre-existente de
  `Historial`, solo que ahora con wrapper visual).
- **Se encontraron y arreglaron 6 tests E2E rotos** por el cambio de
  texto/estructura (no por un bug real): `"Saldo:"` → `"Saldo"` (ahora
  label de stat card sin dos puntos), `"E2E1234 — Auto"` → patente y tipo
  en spans separados (se ajustó el assertion a `toContainText`), `"Sesión
  activa"` como párrafo → badge (mismo texto, pero ahora hay que buscarlo
  como texto de una insignia), `"tiene/no tiene una sesión activa"` (en
  Inspección) → `"Sesión activa"`/`"Sin sesión activa"` como texto de
  insignia, y el test de tema completo reescrito porque pasó de un botón
  con texto (`"Tema: X"`) a un segmented control de 3 `role="radio"` sin
  texto visible (nombre accesible por `title`). `npx playwright test`:
  9/9 en verde tras el fix.
- `npm run build` + `grep` sobre `dist/assets/*.js`: el modo demo sigue
  ausente del bundle de producción (mismo chequeo de siempre, sin
  regresión).

**Decisiones de diseño tomadas (confirmadas con el usuario antes de
arrancar):** acento azul eléctrico (vs. índigo/violeta o verde esmeralda,
descartado por pisarse visualmente con el verde de estado "dentro de
zona"); responsive con la misma prioridad en mobile/tablet/desktop, sin
un dispositivo dominante.

**Deuda/decisión pendiente para una futura iteración:** la spec de estilo
original pedía verde/naranja/rojo para "lugar libre / por vencer /
ocupado", pero el modelo de datos actual (`ZonaRespuesta`) no expone el
estado de lugares individuales, solo zonas con tarifa por minuto — no hay
un "lugar" con estado libre/ocupado/por vencer para pintar. Se agregó el
token `--color-advertencia` (naranja) preparado para ese caso, pero no se
inventó un estado que el backend no tiene. Si en el futuro se agrega esa
granularidad al backend, ya está el token listo para usarlo sin tocar
`index.css` de nuevo.

## Iteración 8 — 2026-07-30

**Qué se hizo:** a pedido del usuario, la navegación de `Layout.tsx` pasó
de un nav horizontal (pills, Iteración 7) a un **sidebar fijo a la
izquierda** con un ícono SVG inline por sección (mismo patrón sin
dependencias nuevas que el resto del rediseño). Cambios:

- Sidebar (240px, fondo `--color-superficie`, borde derecho) con la
  marca/logo arriba y los links de nav debajo, en vez de en la topbar.
- Topbar simplificada: ahora solo tiene el botón de menú (mobile/tablet)
  y la info de usuario + logout — la marca se movió al sidebar.
- **Responsive con drawer**: en pantallas `<= 900px` (mobile y tablet en
  vertical) el sidebar pasa a `position: fixed` fuera de pantalla
  (`translateX(-100%)`) y se abre con un botón de hamburguesa que agrega
  la clase `.sidebarAbierto` (transform a 0) más un overlay semi-transparente
  que cierra el menú al tocarlo. Arriba de 900px el sidebar queda siempre
  visible y el botón de hamburguesa se oculta. Se eligió 900px como corte
  (no 768px) para que tablets en vertical, que no tienen mucho margen
  horizontal, también usen el drawer en vez de convivir con un sidebar
  angosto.
- Cada `NavLink` cierra el drawer al navegar (`onClick={cerrarMenu}`), para
  no dejarlo abierto tapando la página siguiente en mobile.

**Verificación:** `tsc -b`, `oxlint`, `vitest run` (9/9) y
`playwright test` (9/9) en verde sin tocar ningún spec — los tests ya
buscaban los links por `getByRole("link", { name: ... })`, que sigue
funcionando igual con `NavLink` dentro de un `<aside>`. Revisión visual
manual (capturas Playwright, no versionadas) en desktop (1400px, claro y
oscuro), tablet (820px, drawer) y mobile (390px, drawer cerrado y
abierto con overlay): sin problemas de contraste ni de recorte en
ninguno.

## Iteración 9 — 2026-07-30

**Qué se hizo:** a pedido del usuario, se intercambiaron las posiciones
del acceso de usuario y el toggle de tema:
- El bloque de usuario/roles/"Cerrar sesión" pasó de la topbar al **pie
  del sidebar**, separado del nav con un borde superior y empujado abajo
  con `margin-top: auto`.
- El toggle de tema (`ConmutadorTema`) pasó a ocupar el lugar que dejó
  libre en la topbar (arriba a la derecha), en vez de ser una pill fija
  flotante en todas las páginas.
- `ConmutadorTema` ganó una prop `variante: "flotante" | "inline"` en vez
  de tener un único estilo hardcodeado. Como las páginas sin `Layout`
  (login, registro, líneas) no tienen topbar propia, siguen necesitando
  la variante flotante — se armó un `LayoutPublico` liviano en `App.tsx`
  (monta `<ConmutadorTema variante="flotante" />` + `<Outlet />`) para
  esas tres rutas, y se sacó el mount global único que antes vivía arriba
  de `<Routes>`.

**Bug real encontrado y corregido al verificar:** en desktop, el
`<aside>` del sidebar es un hijo flex de `.app` sin altura propia, así
que por default se estiraba (`align-items: stretch`) para igualar el
alto del **contenido principal** — que en páginas con mapa (dashboard)
es más alto que el viewport. Eso empujaba el pie del sidebar (usuario +
logout) muy por debajo de la pantalla visible, no al fondo del sidebar
que se ve. Se corrigió con `position: sticky; top: 0; height: 100svh;
align-self: flex-start; overflow-y: auto` en `.sidebar`, para que su
altura sea siempre la del viewport (no la del contenido) y quede anclado
mientras la página principal scrollea. Se verificó con el
`boundingBox()` de Playwright del botón "Cerrar sesión" antes y después
de un scroll fuerte de la página: misma posición cerca del borde
inferior del viewport en ambos casos.

**Verificación:** `tsc -b`, `oxlint`, `vitest run` (9/9) y
`playwright test` (9/9) en verde sin tocar ningún spec (los tests ubican
el toggle por `role="radio"` + `title`, no por posición). Revisión visual
manual en desktop (1400×900, claro/oscuro, con y sin scroll) y mobile
(390×844, drawer abierto): el pie del sidebar queda visible y anclado en
los tres casos.

## Iteración 10 — 2026-07-30

**Qué se hizo:** "/lineas" es pública desde la Iteración 3 (para que
alguien sin cuenta pueda ver las líneas de colectivo), y por eso vivía
fuera del árbol de rutas envuelto por `Layout` — al clickear el link
"Líneas de colectivo" del sidebar estando logueado, la navegación
saltaba a esa página suelta, sin sidebar ni topbar, con su propio fondo
de página. El usuario lo reportó como "una página toda en negro de
fondo" en dark mode (el salto de contexto, no un bug de color).

Se agregó `src/componentes/EnvoltorioLineas.tsx`: decide en base a
`estaAutenticado` si envolver la ruta `/lineas` con el `Layout` de
siempre (sidebar + topbar, mismo look que el resto de la app) o con un
wrapper standalone liviano (mismo patrón que `LayoutPublico` de
login/registro: fondo de página + `ConmutadorTema` flotante) para
visitantes sin sesión. `Lineas.tsx` se simplificó para no traer su
propio fondo/contenedor (eso ahora lo decide el wrapper correspondiente)
y el link "Volver" quedó condicionado a `!estaAutenticado` (con sesión,
la navegación del sidebar ya cubre eso). El query público de líneas y el
acceso sin cuenta no cambiaron.

**Verificación:** `tsc -b`, `oxlint`, `vitest run` (9/9) y
`playwright test` (9/9) en verde sin tocar specs. Revisión visual manual:
logueado, "/lineas" se ve con sidebar/topbar completos en claro y
oscuro; sin sesión, sigue siendo la página standalone con "← Volver"
apuntando a `/login`.

## Iteración 11 — 2026-07-30

**Qué se hizo:** primer feature nuevo del proyecto pedido durante el
rediseño (no era solo estilos): en "Líneas de colectivo" ahora se puede
clickear una línea de la lista para ver un panel de detalle (número,
nombre) y su recorrido dibujado sobre un mapa Leaflet.

- `src/componentes/MapaRecorrido.tsx` (+ `.module.css`): nuevo, recibe
  `puntos: Coordenada[]` y `color`, dibuja un `Polyline` y hace
  `fitBounds` automático a los puntos de la línea seleccionada (mismo
  patrón que `AjustarVistaAZonas` de `MapaZonas.tsx`, pero sin el fix de
  ícono de marker porque acá no hay markers, solo la línea).
- `src/data/recorridosLineas.ts` (nuevo): `Record<number, Coordenada[]>`
  indexado por **número** de línea (no `id` — es el identificador natural
  e inmutable). El backend (`LineaRespuesta`) no tiene geometría de
  recorrido y el pedido explícito del usuario fue "que no tenga que estar
  fetcheando siempre", así que esto vive hardcodeado en el frontend, sin
  llamada a la API. Una línea sin entrada en el diccionario no rompe: la
  UI muestra "Todavía no hay un recorrido cargado para esta línea."
- **Decisión de diseño importante, confirmada con el usuario antes de
  escribir código**: no tengo (ni el backend tiene) datos reales de los
  recorridos de los colectivos de Tandil. Se optó por coordenadas
  **ilustrativas** armadas a mano cerca del centro de la ciudad (mismo
  punto `CENTRO_TANDIL` que ya usaba `MapaZonas.tsx`) para poder mostrar
  la funcionalidad, dejando comentado bien explícito en el archivo que
  no es un relevamiento real y que hay que reemplazarlas cuando existan
  datos verdaderos. Se evitó deliberadamente presentar esto como si
  fueran recorridos reales.
- `Lineas.tsx`: cada línea de la lista pasa de `<li>` a un `<li><button>`
  clickeable (con `aria-pressed`), estado local `seleccionada`. Layout
  responsive: lista + panel de detalle lado a lado en pantallas
  `>= 760px`, apilados en mobile/tablet chico. Funciona igual logueado
  (dentro del `Layout`, vía `EnvoltorioLineas`) y en el acceso público
  sin cuenta (mismo componente, sin diferencias de comportamiento).

**Verificación:** `tsc -b`, `oxlint`, `vitest run` (9/9) y
`playwright test` (9/9) en verde. Revisión visual manual: selección y
recorrido correctos para ambas líneas semilla (500 y 501) en claro,
oscuro, desktop (lista+detalle lado a lado) y mobile (apilado, con el
drawer del sidebar).

## Iteración 12 — 2026-07-30

**Qué se hizo:** a pedido explícito del usuario, líneas de colectivo
pasó de "datos reales por API + recorrido hardcodeado" a **100% datos
del frontend**, sin ningún fetch:

- `src/data/lineas.ts` reemplaza a `recorridosLineas.ts`: un solo dataset
  estático `LINEAS_COLECTIVO: LineaColectivo[]` con `numero` (identificador
  natural, ya no hay `id` de base de datos), `nombre`, `color` y
  `recorrido` opcional.
- Eliminados `src/api/lineas.ts` y `src/tipos/linea.ts` — no queda
  ninguna llamada ni tipo de respuesta relacionado con `/lineas`.
- `src/api/fixturesDemo.ts`: se sacó el fixture de `/lineas` (ya no hace
  falta simular un backend que directamente no existe).
- `Administracion.tsx`: se eliminó `SeccionLineas` completa (crear/
  editar/eliminar línea) — no hay nada que administrar en un backend
  inexistente. Solo quedan transferencia de titularidad y sesiones.
- `Lineas.tsx`: usa `LINEAS_COLECTIVO` directamente, sin `useQuery` ni
  estados de carga/error (los datos están siempre disponibles de forma
  síncrona, no hay latencia de red que manejar).
- `e2e/administrador.spec.ts`: se sacó el test de CRUD de líneas.

**El backend correspondiente (`servidor-estacionamiento`, repo aparte)
se actualizó en un commit propio ahí**: se borró el módulo completo
(`Linea`, `LineaControlador`, `LineaServicio`, `LineaRepositorio`,
`LineaMapper`, DTOs, `LineaYaExisteException`, el test de integración) y
se agregó una migración Flyway nueva que dropea la tabla `lineas` (no se
editó `V1__esquema_inicial.sql` a propósito: Flyway valida checksums de
migraciones ya aplicadas, así que sacar una tabla de un esquema ya
corrido se hace con una migración nueva, no reescribiendo la vieja). Ver
el `PROGRESO.md` de ese repo para el detalle completo.

**Verificación:** `tsc -b`, `oxlint`, `vitest run` (9/9) y
`playwright test` (8/8, uno menos que antes por el test de CRUD
eliminado) en verde. Revisión visual: Administración ya no muestra la
sección de líneas; `/lineas` sigue funcionando igual que antes (lista,
selección, recorrido en el mapa) pero sin ningún request de red de por
medio.
