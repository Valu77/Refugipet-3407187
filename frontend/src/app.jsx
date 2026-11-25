import { BrowserRouter, Routes, Route } from "react-router-dom";

import Inicio from "./pages/inicio";
import Iniciosesion from "./pages/iniciosesion";
import Registrar from "./pages/registrar";
import Principal from "./pages/principal";
import Adopcion from "./pages/adopcion";
import Contacto from "./pages/contacto";
import Admin from "./pages/admin/admin";
import PanelRefugio from "./pages/refugio/PanelRefugio";
import SolicitarAdopcion from "./pages/SolicitarAdopcion";
import RutaProtegida from "./components/RutaProtegida";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Página de inicio */}
        <Route path="/" element={<Inicio />} />

        {/* Inicio de sesión */}
        <Route
          path="/iniciosesion"
          element={<Iniciosesion />}
        />

        {/* Login */}
        <Route
          path="/login"
          element={<Iniciosesion />}
        />

        {/* Registro */}
        <Route
          path="/registrar"
          element={<Registrar />}
        />

        {/* Página principal */}
        <Route
          path="/principal"
          element={<Principal />}
        />

        {/* Adopción */}
        <Route
          path="/adopcion"
          element={<Adopcion />}
        />

        {/* Contacto */}
        <Route
          path="/contacto"
          element={<Contacto />}
        />

        {/* Administrador (Ruta protegida exclusiva para administradores) */}
        <Route
          path="/admin"
          element={
            <RutaProtegida soloAdmin>
              <Admin />
            </RutaProtegida>
          }
        />

        {/* Panel de Refugio (Ruta protegida exclusiva para refugios) */}
        <Route
          path="/refugio"
          element={
            <RutaProtegida soloRefugio>
              <PanelRefugio />
            </RutaProtegida>
          }
        />

        {/* Solicitar adopción (Requiere autenticación) */}
        <Route
          path="/solicitar-adopcion/:id"
          element={
            <RutaProtegida>
              <SolicitarAdopcion />
            </RutaProtegida>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;