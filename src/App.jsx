import { Routes, Route } from "react-router-dom";

import Inicio from "./pages/inicio";
import Iniciosesion from "./pages/iniciosesion";
import Registrar from "./pages/registrar";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Inicio />} />
      <Route path="/login" element={<Iniciosesion />} />
      <Route path="/registrar" element={<Registrar />} />
    </Routes>
  );
}

export default App;