# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Frontend (React + TypeScript + Vite) for a metered street-parking system in
Tandil, Argentina. Consumes a separate backend, `servidor-estacionamiento`,
via a REST API under `VITE_API_BASE_URL` (default
`http://localhost:8080/api/v1`). All UI copy, route paths, identifiers,
comments and commit messages in this repo are in Spanish (Argentine) —
follow that convention for any new code.

## Commands

```bash
npm run dev          # dev server with HMR, http://localhost:5173
npm run build         # tsc -b && vite build (type-check then bundle)
npm run preview       # serve the production build locally
npm run lint          # oxlint
npm test              # unit tests (Vitest)
npm run test:e2e      # end-to-end tests (Playwright)
```

Run a single unit test file: `npm test -- src/api/errores.test.ts` (Vitest
matches by path/pattern). Run a single e2e spec: `npx playwright test
e2e/usuario.spec.ts`.

Unit tests live next to the code they cover (`algo.ts` / `algo.test.ts`),
e.g. `src/api/almacenTokens.test.ts`, `src/api/errores.test.ts`. e2e specs
live under `e2e/` and are excluded from the Vitest run (see
`vite.config.ts`) since they use Playwright's `test`/`expect`, not Vitest's.

`npm run test:e2e` starts `npm run dev` itself (see `playwright.config.ts`)
and drives the app through **demo mode** (below) — it never needs the real
backend or Docker running.

### Environment variables

| Variable | Description | Dev default |
|---|---|---|
| `VITE_API_BASE_URL` | Backend API base URL | `http://localhost:8080/api/v1` |
| `UI_WEB_PORT` | Host port when running via Docker Compose | `8081` |

`VITE_API_BASE_URL` is baked into the JS bundle at **build time**. For the
Docker image (`Dockerfile`, multi-stage: Node build → nginx serve) it must
be the real public URL of `servidor-estacionamiento`, not `localhost` —
changing it requires rebuilding the image, not just restarting the
container.

## Architecture

### HTTP layer (`src/api/`)

One file per backend feature (`vehiculos.ts`, `zonas.ts`, `multas.ts`,
`reclamos.ts`, `sesiones.ts`, `usuarios.ts`, `metricas.ts`,
`notificaciones.ts`, `auth.ts`). Each exports thin async functions that call
the shared `cliente` (Axios instance from `cliente.ts`) and return typed
data — no business logic beyond mapping requests/responses.

`cliente.ts` centralizes:
- Attaching the bearer token from `almacenTokens.ts` on every request.
- **Refresh-token handling**: on a 401 (except `/auth/*` routes and
  already-retried requests), it fetches a fresh token and replays the
  original request. Concurrent 401s are coalesced into a single in-flight
  refresh (`refrescoEnCurso`) so parallel requests don't each rotate the
  refresh token and invalidate each other.
- **Demo mode**: in `import.meta.env.DEV`, if the stored session is a demo
  session, the request `adapter` is swapped (dynamic `import("./fixturesDemo")`)
  so no real HTTP call is made. This keeps `fixturesDemo.ts` out of the
  production bundle.

`errores.ts` (`obtenerMensajeError`) translates an Axios error carrying an
RFC 7807 `application/problem+json` body (`tipos/problema.ts`) into a
user-facing message — field-level `errores[]` (validation) takes priority
over `detail`.

### Types (`src/tipos/`)

TypeScript interfaces mirroring backend DTOs 1:1, including comments noting
the exact backend class they mirror (e.g. `Pagina<T>` mirrors Spring's
`Page` serialization; `Coordenada` mirrors `comun.Coordenada`). When backend
DTOs change, update the matching interface here.

### Auth & roles

- `tipos/roles.ts` exports the three role constants as full Spring Security
  authorities (`"ROLE_USUARIO"`, `"ROLE_ADMINISTRADOR"`, `"ROLE_INSPECTOR"`),
  not bare names — confirmed against the backend's `rolesDe()` /
  `getAuthorities()`.
- Auth state is split across two files to satisfy the
  react-refresh/`only-export-components` lint rule: `useAutenticacion.ts`
  holds the context object + `useAutenticacion()` hook + types;
  `ContextoAutenticacion.tsx` holds the `ProveedorAutenticacion` component.
  Import the hook from `useAutenticacion.ts`.
- Session (access/refresh token, username, roles) lives in `localStorage`
  under one key (`almacenTokens.ts`), no httpOnly cookies. A `CustomEvent`
  (`estacionamiento:cambio-sesion`) fires on every change so
  `ContextoAutenticacion` can react even when the HTTP client itself clears
  the session (e.g. invalid refresh token), without the two modules coupling
  directly.
- `rutas/RutaProtegida.tsx` gates a route on being authenticated and,
  optionally, on holding one of a given set of roles (`rolRequerido`, a
  string or string[]).
- Note: routes under `/admin/*` and `/inspeccion` in `App.tsx` and the
  matching nav section in `Layout.tsx` still gate on `ROL_INSPECTOR`, even
  though some `api/` comments state the INSPECTOR role was removed
  server-side (its authority folded into ADMINISTRADOR). Don't assume the
  two are in sync without checking the current backend role model first.
  Several comments in this repo also reference a `PROGRESO.md` file that
  has since been deleted from the repo.

### Demo mode (dev-only, no backend needed)

`/login` shows a "Modo demo" panel (`componentes/PanelModoDemo.tsx`) with
one button per role, backed by `api/modoDemo.ts` +
`api/fixturesDemo.ts` (in-memory fixture data + Axios adapter). Every entry
point checks `import.meta.env.DEV` explicitly and repeats the check even
where redundant, on purpose — so Vite/Rollup can prove the branch (and
`fixturesDemo.ts`) is dead code and strip it from the production bundle.
Verify by `npm run build` + grepping `dist/assets/*.js` if you touch this
path. Playwright e2e tests drive the app exclusively through this mode
(`e2e/ayudantes.ts` → `entrarModoDemo`).

### UI structure

```
src/
  paginas/      # one per route/view
  componentes/  # shared components
  api/          # HTTP calls, one file per backend feature
  contextos/    # session/auth state, toast notifications
  tipos/        # TS interfaces mirroring backend DTOs
  rutas/        # role-protected route wrapper
  utils/        # formatting, small stateless hooks (theme, elapsed-time timer)
e2e/            # Playwright end-to-end tests, run against demo mode
```

- Server state (lists, queries) is fetched with `@tanstack/react-query`
  (e.g. `Layout.tsx` polls notifications every 20s via `refetchInterval` to
  drive the sidebar badge/animation).
- Styling is CSS Modules per component, with the color palette centralized
  as CSS custom properties (`--color-*`) in `src/index.css`. New CSS Modules
  should reuse those variables rather than hardcoding colors, or they'll
  break dark mode. Theme follows `prefers-color-scheme` by default;
  `utils/useTema.ts` + `componentes/ConmutadorTema.tsx` let the user force
  light/dark, persisted to `localStorage`.
- Maps (`componentes/MapaZonas.tsx`, `componentes/MapaRecorrido.tsx`) use
  `react-leaflet`/`leaflet`.
- `tsconfig.app.json` runs strict-ish checks beyond default `strict`:
  `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly` (no
  TS-only-at-runtime constructs like enums or parameter properties),
  `verbatimModuleSyntax` (type-only imports must use `import type`).
