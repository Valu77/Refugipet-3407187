import { BrowserRouter, Routes, Route } from "react-router-dom";

import Inicio from "./pages/inicio";
import Iniciosesion from "./pages/iniciosesion";
import Registrar from "./pages/registrar";
import Principal from "./pages/principal";
import Adopcion from "./pages/adopcion";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Página de inicio */}
        <Route path="/" element={<Inicio />} />

        {/* Inicio de sesión */}
        <Route path="/iniciosesion" element={<Iniciosesion />} />

        {/* Login */}
        <Route path="/login" element={<Iniciosesion />} />

        {/* Registro */}
        <Route path="/registrar" element={<Registrar />} />

        {/* Página después de iniciar sesión */}
        <Route path="/principal" element={<Principal />} />

        {/* Adopción */}
        <Route path="/adopcion" element={<Adopcion />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;