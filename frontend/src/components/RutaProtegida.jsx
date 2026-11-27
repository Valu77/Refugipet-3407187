import React from "react";
import { Navigate } from "react-router-dom";
import { obtenerUsuarioLocal } from "../services/api";

/**
 * Componente para proteger rutas privadas y administrativas.
 * - Redirige a /iniciosesion si el usuario no ha iniciado sesión.
 * - Redirige a /principal si un usuario no administrador intenta ingresar a una ruta de admin.
 */
function RutaProtegida({ children, soloAdmin = false, soloRefugio = false }) {
  const token = localStorage.getItem("token");
  const usuario = obtenerUsuarioLocal();

  // Si no hay token ni usuario autenticado, redirigir al login
  if (!token || !usuario) {
    return <Navigate to="/iniciosesion" replace />;
  }

  // Si la ruta requiere privilegios de administrador y el usuario no lo es, redirigir a inicio
  if (soloAdmin && usuario.rol !== "admin") {
    return <Navigate to="/principal" replace />;
  }

  // Si la ruta es exclusiva para refugios y el usuario no es refugio, redirigir a inicio
  if (soloRefugio && usuario.rol !== "refugio") {
    return <Navigate to="/principal" replace />;
  }

  return children;
}

export default RutaProtegida;
