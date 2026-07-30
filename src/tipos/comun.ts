// Espeja com.tandil.estacionamiento.comun.Coordenada.
export interface Coordenada {
  latitud: number;
  longitud: number;
}

// Forma de org.springframework.data.domain.Page al serializarse: solo se tipan
// los campos que la UI realmente consume (paginacion de /sesiones/admin).
export interface Pagina<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
