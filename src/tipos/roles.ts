// Los roles que devuelve el backend son las authorities completas de Spring
// Security ("ROLE_" + RolNombre), no el nombre "pelado": confirmado contra
// AutenticacionServicio.rolesDe() y UsuarioPrincipal.getAuthorities().
export const ROL_USUARIO = "ROLE_USUARIO";
export const ROL_ADMINISTRADOR = "ROLE_ADMINISTRADOR";
