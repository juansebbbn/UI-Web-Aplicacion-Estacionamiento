// Espeja los DTOs de com.tandil.estacionamiento.autenticacion.dto.

export interface RegistroSolicitud {
  username: string;
  password: string;
  dni: string;
}

export interface LoginSolicitud {
  username: string;
  password: string;
}

export interface RefrescoSolicitud {
  refreshToken: string;
}

export interface TokenRespuesta {
  accessToken: string;
  refreshToken: string;
  tipoToken: string;
  expiraEnSegundos: number;
  username: string;
  roles: string[];
}
