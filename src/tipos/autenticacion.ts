// Espeja los DTOs de com.tandil.estacionamiento.autenticacion.dto.

export interface RegistroSolicitud {
  username: string;
  password: string;
  dni: string;
}

// Igual a RegistroSolicitud + la clave de /auth/registro-admin y /auth/registro-inspector.
export interface RegistroPrivilegiadoSolicitud {
  username: string;
  password: string;
  dni: string;
  clave: string;
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
