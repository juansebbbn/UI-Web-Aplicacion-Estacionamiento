import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ajustarSaldo, listarUsuariosAdmin } from "../api/usuarios";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { useToasts } from "../contextos/contextoToasts";
import { formatearMonto } from "../utils/formato";
import estilos from "./AdminComun.module.css";

export function AdminUsuarios() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useToasts();
  const usuarios = useQuery({ queryKey: ["usuarios-admin"], queryFn: listarUsuariosAdmin });

  const [edicionId, setEdicionId] = useState<number | null>(null);
  const [monto, setMonto] = useState("");
  const [motivo, setMotivo] = useState("");

  const ajuste = useMutation({
    mutationFn: ({ id, monto: montoAjuste, motivo: motivoAjuste }: { id: number; monto: number; motivo: string }) =>
      ajustarSaldo(id, { monto: montoAjuste, motivo: motivoAjuste }),
    onSuccess: (usuario) => {
      setEdicionId(null);
      setMonto("");
      setMotivo("");
      mostrarExito(`Saldo de ${usuario.username} actualizado a ${formatearMonto(usuario.saldo)}.`);
      queryClient.invalidateQueries({ queryKey: ["usuarios-admin"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  function abrirAjuste(id: number) {
    setEdicionId(id);
    setMonto("");
    setMotivo("");
  }

  function manejarAjuste(evento: FormEvent, id: number) {
    evento.preventDefault();
    const montoNumerico = Number(monto);
    if (!montoNumerico) return;
    ajuste.mutate({ id, monto: montoNumerico, motivo });
  }

  return (
    <section>
      <h2 className={estilos.tituloPagina}>Usuarios</h2>

      <div className={estilos.seccion}>
        {usuarios.isPending && <p>Cargando usuarios…</p>}
        {usuarios.isError && <MensajeError mensaje={obtenerMensajeError(usuarios.error)} />}
        {usuarios.data && usuarios.data.length === 0 && <p>No hay usuarios registrados.</p>}

        {usuarios.data && usuarios.data.length > 0 && (
          <ul className={estilos.listaUsuarios}>
            {usuarios.data.map((usuario) => (
              <li key={usuario.id} className={estilos.tarjetaUsuario}>
                <div className={estilos.usuarioEncabezado}>
                  <div>
                    <span className={estilos.usuarioNombre}>{usuario.username}</span>{" "}
                    <span className={estilos.usuarioMeta}>DNI {usuario.dni}</span>
                    <div className={estilos.rolesUsuario}>
                      {usuario.roles.map((rol) => (
                        <span key={rol} className={estilos.insigniaRol}>
                          {rol.replace("ROLE_", "")}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className={estilos.saldoAcciones}>
                    <span className={usuario.saldo < 0 ? `${estilos.usuarioSaldo} ${estilos.saldoNegativo}` : estilos.usuarioSaldo}>
                      {formatearMonto(usuario.saldo)}
                    </span>
                    <button type="button" className={estilos.botonChico} onClick={() => abrirAjuste(usuario.id)}>
                      Ajustar saldo
                    </button>
                  </div>
                </div>

                {usuario.vehiculos.length > 0 && (
                  <div className={estilos.vehiculosUsuario}>
                    {usuario.vehiculos.map((vehiculo) => (
                      <span key={vehiculo.id} className={estilos.chipVehiculo}>
                        {vehiculo.patente} · {vehiculo.tipo === "AUTO" ? "Auto" : "Moto"}
                      </span>
                    ))}
                  </div>
                )}
                {usuario.vehiculos.length === 0 && (
                  <p className={estilos.sinVehiculos}>Sin vehículos registrados.</p>
                )}

                {edicionId === usuario.id && (
                  <form className={estilos.formularioAjuste} onSubmit={(evento) => manejarAjuste(evento, usuario.id)}>
                    <label className={estilos.campo}>
                      Monto (+/-)
                      <input
                        type="number"
                        step="0.01"
                        value={monto}
                        onChange={(evento) => setMonto(evento.target.value)}
                        placeholder="ej. 500 o -500"
                        required
                      />
                    </label>
                    <label className={estilos.campo}>
                      Motivo
                      <input
                        value={motivo}
                        onChange={(evento) => setMotivo(evento.target.value)}
                        placeholder="ej. compensación por error de cobro"
                        required
                      />
                    </label>
                    <button type="submit" className={estilos.botonChico} disabled={ajuste.isPending}>
                      {ajuste.isPending ? "Aplicando..." : "Aplicar"}
                    </button>
                    <button type="button" className={estilos.botonChico} onClick={() => setEdicionId(null)}>
                      Cancelar
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
