import { Routes, Route } from "react-router-dom";

import Inicio from "./pages/inicio";
import Iniciosesion from "./pages/iniciosesion";
import Registrar from "./pages/registrar";
import Principal from "./pages/principal";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Inicio />} />

      <Route path="/login" element={<Iniciosesion />} />

      <Route path="/registrar" element={<Registrar />} />

      <Route path="/principal" element={<Principal />} />

    </Routes>
  );
}

export default App;