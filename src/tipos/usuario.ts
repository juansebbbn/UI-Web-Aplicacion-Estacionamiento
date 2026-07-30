// Espeja com.tandil.estacionamiento.usuarios.dto.UsuarioRespuesta.
// fechaRegistro llega como LocalDateTime serializado (string ISO sin offset).
export interface UsuarioRespuesta {
  id: number;
  username: string;
  dni: string;
  saldo: number;
  fechaRegistro: string;
  roles: string[];
}
