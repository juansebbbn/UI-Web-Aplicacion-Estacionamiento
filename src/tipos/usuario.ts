// Espeja com.tandil.estacionamiento.usuarios.dto.UsuarioRespuesta.
// fechaRegistro llega como LocalDateTime serializado (string ISO sin offset).
import type { VehiculoRespuesta } from "./vehiculo";

export interface UsuarioRespuesta {
  id: number;
  username: string;
  dni: string;
  saldo: number;
  fechaRegistro: string;
  roles: string[];
}

// Espeja com.tandil.estacionamiento.usuarios.dto.UsuarioAdminRespuesta.
export interface UsuarioAdminRespuesta extends UsuarioRespuesta {
  vehiculos: VehiculoRespuesta[];
}

// Espeja com.tandil.estacionamiento.usuarios.dto.AjusteSaldoSolicitud.
// monto es con signo: positivo acredita, negativo debita.
export interface AjusteSaldoSolicitud {
  monto: number;
  motivo: string;
}

// Espeja com.tandil.estacionamiento.usuarios.dto.RecargaSaldoSolicitud.
// Autoservicio: credito directo simulado, sin medio de pago real todavia.
export interface RecargaSaldoSolicitud {
  monto: number;
}
