// Login ficticio para poder recorrer la UI con cualquier rol sin depender de
// asignar roles a mano en la base (el registro publico solo puede crear
// ROLE_USUARIO). Ver fixturesDemo.ts para los datos servidos y cliente.ts
// para donde se engancha el adapter. Nunca activo fuera de dev: Vite elimina
// esta rama (y fixturesDemo.ts con ella) del bundle de produccion.
import type { TokenRespuesta } from "../tipos/autenticacion";
import { guardarSesion, leerSesion } from "./almacenTokens";

export function estaEnModoDemo(): boolean {
  return leerSesion()?.demo === true;
}

export function activarModoDemo(rol: string): void {
  if (!import.meta.env.DEV) return;

  const token: TokenRespuesta = {
    accessToken: "modo-demo",
    refreshToken: "modo-demo",
    tipoToken: "Bearer",
    expiraEnSegundos: 3600,
    username: "demo",
    roles: [rol],
  };
  guardarSesion(token, { demo: true });
}
