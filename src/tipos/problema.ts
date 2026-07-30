// Errores del backend: siempre application/problem+json (RFC 7807).
// "errores" solo esta presente en errores de validacion (400).
export interface ProblemaHttp {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  errores?: string[];
}
