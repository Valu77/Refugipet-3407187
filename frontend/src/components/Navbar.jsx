import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import "./layout.css";

function Navbar({ variant = "app" }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setMenuAbierto(!menuAbierto);
  };

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    cerrarMenu();
    navigate("/");
  };

  const isPublic = variant === "public";

  return (
    <header className="site-header">
      <div className="header-container">
        {/* LOGO & BRAND */}
        <Link to={isPublic ? "/" : "/principal"} className="brand-logo" onClick={cerrarMenu}>
          <img src={logo} alt="RefugiPet Logo" className="logo-img" />
          <div className="brand-info">
            <span className="brand-title">RefugiPet</span>
            <span className="brand-slogan">Juntos construimos un hogar para cada mascota</span>
          </div>
        </Link>

        {/* MOBILE MENU BUTTON */}
        <button
          className={`mobile-menu-btn ${menuAbierto ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label="Abrir menú de navegación"
          aria-expanded={menuAbierto}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* NAVIGATION LINKS */}
        <nav className={`nav-menu ${menuAbierto ? "mobile-active" : ""}`}>
          {!isPublic ? (
            <>
              <Link
                to="/principal"
                className={`nav-link ${location.pathname === "/principal" ? "active" : ""}`}
                onClick={cerrarMenu}
              >
                Inicio
              </Link>
              <Link
                to="/adopcion"
                className={`nav-link ${location.pathname === "/adopcion" ? "active" : ""}`}
                onClick={cerrarMenu}
              >
                Mascotas
              </Link>
              <Link
                to="/contacto"
                className={`nav-link ${location.pathname === "/contacto" ? "active" : ""}`}
                onClick={cerrarMenu}
              >
                Contacto
              </Link>
              <button className="nav-btn-logout" onClick={cerrarSesion}>
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link
                to="/iniciosesion"
                className={`nav-link ${location.pathname === "/iniciosesion" ? "active" : ""}`}
                onClick={cerrarMenu}
              >
                Adopción
              </Link>
              <Link
                to="/iniciosesion"
                className="nav-btn-secondary"
                onClick={cerrarMenu}
              >
                Iniciar Sesión
              </Link>
              <Link
                to="/registrar"
                className="nav-btn-primary"
                onClick={cerrarMenu}
              >
                Registrarse
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
