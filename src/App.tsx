import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { RutaProtegida } from "./rutas/RutaProtegida";
import { Layout } from "./componentes/Layout";
import { ConmutadorTema } from "./componentes/ConmutadorTema";
import { EnvoltorioLineas } from "./componentes/EnvoltorioLineas";
import { Login } from "./paginas/Login";
import { Registro } from "./paginas/Registro";
import { RegistroPrivilegiado } from "./paginas/RegistroPrivilegiado";
import { Inicio } from "./paginas/Inicio";
import { DashboardUsuario } from "./paginas/DashboardUsuario";
import { RecargarSaldo } from "./paginas/RecargarSaldo";
import { Vehiculos } from "./paginas/Vehiculos";
import { Historial } from "./paginas/Historial";
import { Reclamos } from "./paginas/Reclamos";
import { Notificaciones } from "./paginas/Notificaciones";
import { Multas } from "./paginas/Multas";
import { Lineas } from "./paginas/Lineas";
import { Inspeccion } from "./paginas/Inspeccion";
import { AdminUsuarios } from "./paginas/AdminUsuarios";
import { AdminReclamos } from "./paginas/AdminReclamos";
import { AdminSesiones } from "./paginas/AdminSesiones";
import { AdminTitularidad } from "./paginas/AdminTitularidad";
import { AdminMultas } from "./paginas/AdminMultas";
import { Metricas } from "./paginas/Metricas";
import { ROL_ADMINISTRADOR, ROL_INSPECTOR, ROL_USUARIO } from "./tipos/roles";

// Paginas sin Layout (sin sidebar/topbar propios): el toggle de tema queda
// como pill flotante, igual que antes de que Layout tuviera uno inline.
function LayoutPublico() {
  return (
    <>
      <ConmutadorTema variante="flotante" />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route element={<LayoutPublico />}>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/registro-privilegiado" element={<RegistroPrivilegiado />} />
      </Route>

      <Route element={<EnvoltorioLineas />}>
        <Route path="/lineas" element={<Lineas />} />
      </Route>

      <Route
        element={
          <RutaProtegida>
            <Layout />
          </RutaProtegida>
        }
      >
        <Route path="/" element={<Inicio />} />
        <Route
          path="/estacionamiento"
          element={
            <RutaProtegida rolRequerido={ROL_USUARIO}>
              <DashboardUsuario />
            </RutaProtegida>
          }
        />
        <Route
          path="/vehiculos"
          element={
            <RutaProtegida rolRequerido={ROL_USUARIO}>
              <Vehiculos />
            </RutaProtegida>
          }
        />
        <Route
          path="/recargar-saldo"
          element={
            <RutaProtegida rolRequerido={ROL_USUARIO}>
              <RecargarSaldo />
            </RutaProtegida>
          }
        />
        <Route
          path="/historial"
          element={
            <RutaProtegida rolRequerido={ROL_USUARIO}>
              <Historial />
            </RutaProtegida>
          }
        />
        <Route
          path="/reclamos"
          element={
            <RutaProtegida rolRequerido={ROL_USUARIO}>
              <Reclamos />
            </RutaProtegida>
          }
        />
        <Route
          path="/notificaciones"
          element={
            <RutaProtegida rolRequerido={ROL_USUARIO}>
              <Notificaciones />
            </RutaProtegida>
          }
        />
        <Route
          path="/multas"
          element={
            <RutaProtegida rolRequerido={ROL_USUARIO}>
              <Multas />
            </RutaProtegida>
          }
        />
        <Route
          path="/inspeccion"
          element={
            <RutaProtegida rolRequerido={ROL_INSPECTOR}>
              <Inspeccion />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/usuarios"
          element={
            <RutaProtegida rolRequerido={ROL_INSPECTOR}>
              <AdminUsuarios />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/reclamos"
          element={
            <RutaProtegida rolRequerido={ROL_INSPECTOR}>
              <AdminReclamos />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/sesiones"
          element={
            <RutaProtegida rolRequerido={ROL_INSPECTOR}>
              <AdminSesiones />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/titularidad"
          element={
            <RutaProtegida rolRequerido={ROL_INSPECTOR}>
              <AdminTitularidad />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/multas"
          element={
            <RutaProtegida rolRequerido={ROL_INSPECTOR}>
              <AdminMultas />
            </RutaProtegida>
          }
        />
        <Route
          path="/metricas"
          element={
            <RutaProtegida rolRequerido={ROL_ADMINISTRADOR}>
              <Metricas />
            </RutaProtegida>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
