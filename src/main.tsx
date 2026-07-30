import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "leaflet/dist/leaflet.css";
import "./index.css";
import App from "./App.tsx";
import { ProveedorAutenticacion } from "./contextos/ContextoAutenticacion";
import { ProveedorToasts } from "./contextos/ProveedorToasts";

const clienteConsultas = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={clienteConsultas}>
      <BrowserRouter>
        <ProveedorToasts>
          <ProveedorAutenticacion>
            <App />
          </ProveedorAutenticacion>
        </ProveedorToasts>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
