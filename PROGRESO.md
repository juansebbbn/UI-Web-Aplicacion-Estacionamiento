# Progreso — ui-web

Registro de avance del frontend de estacionamiento medido de Tandil. Consume
`servidor-estacionamiento` (`http://localhost:8080/api/v1`). Ver la
especificación de UI (mensaje inicial de este proyecto) para el detalle de
roles, endpoints y alcance.

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
