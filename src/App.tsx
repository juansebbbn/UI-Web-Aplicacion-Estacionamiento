import { useAutenticacion } from "./contextos/useAutenticacion";

// Placeholder de la base del proyecto (cliente HTTP, tipos, contexto de
// autenticacion). Las paginas y el enrutado real se agregan en el siguiente modulo.
function App() {
  const { estaAutenticado, usuario } = useAutenticacion();

  return (
    <main style={{ padding: 16 }}>
      <h1>Estacionamiento Tandil</h1>
      <p>
        {estaAutenticado
          ? `Sesion activa: ${usuario?.username} (${usuario?.roles.join(", ")})`
          : "No hay sesion iniciada."}
      </p>
    </main>
  );
}

export default App;
