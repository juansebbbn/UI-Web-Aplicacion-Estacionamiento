import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { RutaProtegida } from "./rutas/RutaProtegida";
import { Layout } from "./componentes/Layout";
import { ConmutadorTema } from "./componentes/ConmutadorTema";
import { EnvoltorioLineas } from "./componentes/EnvoltorioLineas";
import { Login } from "./paginas/Login";
import { Registro } from "./paginas/Registro";
import { Inicio } from "./paginas/Inicio";
import { DashboardUsuario } from "./paginas/DashboardUsuario";
import { Vehiculos } from "./paginas/Vehiculos";
import { Historial } from "./paginas/Historial";
import { Reclamos } from "./paginas/Reclamos";
import { Lineas } from "./paginas/Lineas";
import { Inspeccion } from "./paginas/Inspeccion";
import { Administracion } from "./paginas/Administracion";
import { ROL_ADMINISTRADOR, ROL_USUARIO } from "./tipos/roles";

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
          path="/inspeccion"
          element={
            <RutaProtegida rolRequerido={ROL_ADMINISTRADOR}>
              <Inspeccion />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin"
          element={
            <RutaProtegida rolRequerido={ROL_ADMINISTRADOR}>
              <Administracion />
            </RutaProtegida>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
