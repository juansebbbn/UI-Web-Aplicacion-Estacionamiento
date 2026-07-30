import { Navigate, Route, Routes } from "react-router-dom";
import { RutaProtegida } from "./rutas/RutaProtegida";
import { Layout } from "./componentes/Layout";
import { Login } from "./paginas/Login";
import { Registro } from "./paginas/Registro";
import { Inicio } from "./paginas/Inicio";
import { DashboardUsuario } from "./paginas/DashboardUsuario";
import { ROL_USUARIO } from "./tipos/roles";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

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
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
