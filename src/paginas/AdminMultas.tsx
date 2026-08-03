import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buscarMultasAdmin, crearMultaAdmin, revocarMultaAdmin } from "../api/multas";
import { obtenerMensajeError } from "../api/errores";
import { MensajeError } from "../componentes/MensajeError";
import { useToasts } from "../contextos/contextoToasts";
import { formatearFecha, formatearMonto } from "../utils/formato";
import estilos from "./AdminComun.module.css";

const TAMANO_PAGINA = 10;

type FiltroRegistrado = "todas" | "registradas" | "no-registradas";

export function AdminMultas() {
  const queryClient = useQueryClient();
  const { mostrarExito, mostrarError } = useToasts();

  const [patenteAlta, setPatenteAlta] = useState("");
  const [precio, setPrecio] = useState("");
  const [razon, setRazon] = useState("");

  const crear = useMutation({
    mutationFn: crearMultaAdmin,
    onSuccess: (multa) => {
      mostrarExito(
        multa.vehiculoRegistrado
          ? `Multa creada para la patente ${multa.patente} (${multa.username}).`
          : `Multa creada para la patente ${multa.patente} (todavía no está registrada en el sistema).`,
      );
      setPatenteAlta("");
      setPrecio("");
      setRazon("");
      queryClient.invalidateQueries({ queryKey: ["multas-admin"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  function manejarAlta(evento: FormEvent) {
    evento.preventDefault();
    const precioNumerico = Number(precio);
    if (!patenteAlta.trim() || !precioNumerico || !razon.trim()) return;
    crear.mutate({ patente: patenteAlta.trim().toUpperCase(), precio: precioNumerico, razon: razon.trim() });
  }

  const [pagina, setPagina] = useState(0);
  const [patenteFiltro, setPatenteFiltro] = useState("");
  const [usernameFiltro, setUsernameFiltro] = useState("");
  const [filtroRegistrado, setFiltroRegistrado] = useState<FiltroRegistrado>("todas");

  const registrado = filtroRegistrado === "todas" ? undefined : filtroRegistrado === "registradas";

  const multas = useQuery({
    queryKey: ["multas-admin", pagina, patenteFiltro, usernameFiltro, filtroRegistrado],
    queryFn: () =>
      buscarMultasAdmin({
        page: pagina,
        size: TAMANO_PAGINA,
        sort: "fecha,desc",
        patente: patenteFiltro.trim() || undefined,
        username: usernameFiltro.trim() || undefined,
        registrado,
      }),
  });

  const revocar = useMutation({
    mutationFn: revocarMultaAdmin,
    onSuccess: () => {
      mostrarExito("Multa revocada.");
      queryClient.invalidateQueries({ queryKey: ["multas-admin"] });
    },
    onError: (err) => mostrarError(obtenerMensajeError(err)),
  });

  function manejarFiltro(evento: FormEvent) {
    evento.preventDefault();
    setPagina(0);
  }

  return (
    <section>
      <h2 className={estilos.tituloPagina}>Multas</h2>

      <div className={estilos.seccion}>
        <h3 className={estilos.tituloSeccion}>Nueva multa</h3>
        <p className={estilos.ayuda}>
          Alcanza con la patente: si ya está registrada se vincula automáticamente a su dueño; si no, la multa
          queda cargada igual y se vincula sola apenas alguien registre esa patente.
        </p>
        <form className={estilos.formulario} onSubmit={manejarAlta}>
          <label className={estilos.campo}>
            Patente
            <input
              value={patenteAlta}
              onChange={(evento) => setPatenteAlta(evento.target.value)}
              placeholder="ej. AB123CD"
              required
            />
          </label>
          <label className={estilos.campo}>
            Precio
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={precio}
              onChange={(evento) => setPrecio(evento.target.value)}
              placeholder="ej. 5000"
              required
            />
          </label>
          <label className={estilos.campo}>
            Razón
            <input
              value={razon}
              onChange={(evento) => setRazon(evento.target.value)}
              placeholder="ej. mal estacionado en zona exclusiva"
              required
            />
          </label>
          <button type="submit" className={estilos.boton} disabled={crear.isPending}>
            {crear.isPending ? "Creando..." : "Crear multa"}
          </button>
        </form>
      </div>

      <div className={estilos.seccion}>
        <h3 className={estilos.tituloSeccion}>Todas las multas</h3>

        <form className={estilos.formulario} onSubmit={manejarFiltro}>
          <label className={estilos.campo}>
            Patente
            <input value={patenteFiltro} onChange={(evento) => setPatenteFiltro(evento.target.value)} placeholder="filtrar por patente" />
          </label>
          <label className={estilos.campo}>
            Username
            <input value={usernameFiltro} onChange={(evento) => setUsernameFiltro(evento.target.value)} placeholder="filtrar por usuario" />
          </label>
          <label className={estilos.campo}>
            Vehículo
            <select
              value={filtroRegistrado}
              onChange={(evento) => {
                setFiltroRegistrado(evento.target.value as FiltroRegistrado);
                setPagina(0);
              }}
            >
              <option value="todas">Todas</option>
              <option value="registradas">Registradas</option>
              <option value="no-registradas">No registradas</option>
            </select>
          </label>
          <button type="submit" className={estilos.botonChico}>
            Filtrar
          </button>
        </form>

        {multas.isPending && <p>Cargando multas…</p>}
        {multas.isError && <MensajeError mensaje={obtenerMensajeError(multas.error)} />}
        {multas.data && multas.data.content.length === 0 && <p className={estilos.ayuda}>No hay multas para este filtro.</p>}

        {multas.data && multas.data.content.length > 0 && (
          <>
            <div className={estilos.contenedorTabla}>
              <table className={estilos.tabla}>
                <thead>
                  <tr>
                    <th>Patente</th>
                    <th>Usuario</th>
                    <th>Razón</th>
                    <th>Fecha</th>
                    <th className={estilos.colMonto}>Precio</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {multas.data.content.map((multa) => (
                    <tr key={multa.id}>
                      <td className={estilos.patenteCelda}>{multa.patente}</td>
                      <td>{multa.vehiculoRegistrado ? multa.username : "No registrado"}</td>
                      <td>{multa.razon}</td>
                      <td>{formatearFecha(multa.fecha)}</td>
                      <td className={estilos.colMonto}>{formatearMonto(multa.precio)}</td>
                      <td>
                        {multa.revocada && <span className={estilos.insigniaFinalizada}>Revocada</span>}
                        {!multa.revocada && multa.fuePagada && <span className={estilos.insigniaFinalizada}>Pagada</span>}
                        {!multa.revocada && !multa.fuePagada && <span className={estilos.insigniaActiva}>Pendiente</span>}
                      </td>
                      <td>
                        {!multa.revocada && !multa.fuePagada && (
                          <button
                            type="button"
                            className={estilos.botonChico}
                            onClick={() => revocar.mutate(multa.id)}
                            disabled={revocar.isPending}
                          >
                            Revocar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={estilos.paginacion}>
              <button
                type="button"
                className={estilos.botonChico}
                onClick={() => setPagina((p) => p - 1)}
                disabled={multas.data.first}
              >
                ← Anterior
              </button>
              <span className={estilos.paginaActual}>
                Página {multas.data.number + 1} de {Math.max(multas.data.totalPages, 1)}
              </span>
              <button
                type="button"
                className={estilos.botonChico}
                onClick={() => setPagina((p) => p + 1)}
                disabled={multas.data.last}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
