# ui-web

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
- `npm test` — tests con Vitest

## Estructura

```
src/
  paginas/      # una por vista/ruta
  componentes/  # reutilizables
  api/          # llamadas HTTP, una por feature del backend
  contextos/    # estado de sesión/autenticación
  tipos/        # interfaces TS que espejan los DTOs del backend
  rutas/        # definición de rutas protegidas por rol
```
