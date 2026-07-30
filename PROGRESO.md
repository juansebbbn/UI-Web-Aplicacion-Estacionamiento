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
- [ ] Enrutado real (`react-router`) + páginas: login, registro, dashboard USER
- [ ] Mapa de zonas (Leaflet) + alta/listado de vehículos
- [ ] Iniciar/finalizar sesión de estacionamiento + historial
- [ ] Vista INSPECTOR (búsqueda de patente)
- [ ] Vista ADMINISTRADOR (líneas, transferencia de titularidad, tabla paginada de sesiones)
- [ ] Manejo de errores RFC 7807 traducido a mensajes legibles
- [ ] Tests de componentes/páginas críticas
