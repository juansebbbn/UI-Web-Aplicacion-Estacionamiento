# UI-WEB

Frontend del sistema de estacionamiento medido de Tandil. Consume la API de
`servidor-estacionamiento`. Ver `PROGRESO.md` para el registro de avance.

## Requisitos

- Node.js 20+ y npm
- `servidor-estacionamiento` corriendo (ver su propio README) con CORS
  habilitado para el origen de esta app

## Desarrollo local

```bash
npm install
cp .env.example .env   # ajustar VITE_API_BASE_URL si hace falta
npm run dev
```

La app queda en `http://localhost:5173`.

## Variables de entorno

| Variable            | Descripción                                  | Default (dev)                  |
|---------------------|-------------------------------------------------|----------------------------------|
| `VITE_API_BASE_URL` | Base URL de la API del backend                   | `http://localhost:8080/api/v1`   |
| `UI_WEB_PORT`       | Puerto del host al levantar con Docker Compose   | `8081`                            |

## Docker

Build multi-stage: compila con Node y sirve el resultado estático con nginx
(`Dockerfile`, `nginx.conf`). `VITE_API_BASE_URL` se resuelve en **build
time** (Vite lo hornea en el JS servido) — para producción tiene que ser la
URL pública real de `servidor-estacionamiento`, no `localhost`. Si cambia,
hay que reconstruir la imagen, no alcanza con reiniciar el contenedor.

```bash
cp .env.example .env   # completar VITE_API_BASE_URL con la URL real del backend
docker compose up --build
```

Queda en `http://localhost:8081` (o el puerto que se haya puesto en
`UI_WEB_PORT`).

## Scripts

- `npm run dev` — servidor de desarrollo con HMR
- `npm run build` — build de producción (`tsc -b && vite build`)
- `npm run preview` — sirve el build de producción localmente
- `npm run lint` — lint con oxlint
- `npm test` — tests unitarios con Vitest
- `npm run test:e2e` — tests end-to-end con Playwright (ver abajo)

## Modo demo (solo desarrollo)

En `/login`, con `npm run dev`, aparece un panel "Modo demo" con un botón por
rol (Usuario/Inspector/Administrador): entra con datos ficticios servidos en
memoria (`src/api/fixturesDemo.ts`), sin necesitar `servidor-estacionamiento`
ni MySQL corriendo. Útil para revisar UI o correr los tests E2E rápido. Vive
detrás de `import.meta.env.DEV` en todos los puntos de entrada — confirmado
ausente del build de producción (`npm run build` + `grep` sobre
`dist/assets/*.js`, ver `PROGRESO.md`).

## Tests E2E (Playwright)

```bash
npm run test:e2e
```

Corren contra `npm run dev` (Playwright lo levanta solo, ver
`playwright.config.ts`) usando el modo demo — no necesitan backend ni Docker.
Cubren los tres roles (`e2e/usuario.spec.ts`, `e2e/inspector.spec.ts`,
`e2e/administrador.spec.ts`) y el conmutador de tema (`e2e/tema.spec.ts`).

## Tema claro/oscuro

Sigue `prefers-color-scheme` por default; el botón fijo abajo a la izquierda
("Tema: ...") permite forzar claro u oscuro, persistido en `localStorage`. La
paleta vive centralizada como variables CSS en `src/index.css`
(`--color-*`) — cualquier CSS Module nuevo debería usar esas variables en vez
de colores hardcodeados para no romper el tema oscuro.

## Estructura

```
src/
  paginas/      # una por vista/ruta
  componentes/  # reutilizables
  api/          # llamadas HTTP, una por feature del backend
  contextos/    # estado de sesión/autenticación/toasts
  tipos/        # interfaces TS que espejan los DTOs del backend
  rutas/        # definición de rutas protegidas por rol
  utils/        # formateo, hooks chicos sin estado global (tema, cronómetro)
e2e/            # tests end-to-end (Playwright), corren contra el modo demo
```
