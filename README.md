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

| Variable            | Descripción                          | Default (dev)                  |
|---------------------|----------------------------------------|----------------------------------|
| `VITE_API_BASE_URL` | Base URL de la API del backend         | `http://localhost:8080/api/v1`   |

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
