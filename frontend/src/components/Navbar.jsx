import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import NotificacionesCampana from "./NotificacionesCampana";
import { obtenerUsuarioLocal } from "../services/api";
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

  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 960) {
        setMenuAbierto(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    cerrarMenu();
    navigate("/");
  };

  const isPublic = variant === "public";
  const usuario = obtenerUsuarioLocal();
  const estaAutenticado = Boolean(localStorage.getItem("token") && usuario);
  const esAdmin = usuario && usuario.rol === "admin";
  const esRefugio = usuario && usuario.rol === "refugio";
  const esAdoptante = usuario && usuario.rol === "usuario";

  return (
    <header className="site-header">
      <div className="header-container">
        {/* LOGO & BRAND */}
        <Link
          to={isPublic ? "/" : "/principal"}
          className="brand-logo"
          onClick={cerrarMenu}
        >
          <img src={logo} alt="RefugiPet Logo" className="logo-img" />
          <div className="brand-info">
            <span className="brand-title">RefugiPet</span>
            <span className="brand-slogan">
              Juntos construimos un hogar para cada mascota
            </span>
          </div>
        </Link>

        {/* MOBILE MENU BUTTON */}
        <button
          className={`mobile-menu-btn ${menuAbierto ? "open" : ""}`}
          onClick={toggleMenu}
          aria-label={
            menuAbierto
              ? "Cerrar menú de navegación"
              : "Abrir menú de navegación"
          }
          aria-expanded={menuAbierto}
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* NAVIGATION LINKS */}
        <nav
          className={`nav-menu ${menuAbierto ? "mobile-active" : ""}`}
          aria-label="Navegación principal"
        >
          {!isPublic ? (
            <>
              <Link
                to="/principal"
                className={`nav-link ${
                  location.pathname === "/principal" ? "active" : ""
                }`}
                onClick={cerrarMenu}
              >
                Inicio
              </Link>
              <Link
                to="/adopcion"
                className={`nav-link ${
                  location.pathname === "/adopcion" ? "active" : ""
                }`}
                onClick={cerrarMenu}
              >
                Mascotas
              </Link>
              <Link
                to="/contacto"
                className={`nav-link ${
                  location.pathname === "/contacto" ? "active" : ""
                }`}
                onClick={cerrarMenu}
              >
                Contacto
              </Link>
              {esAdoptante && (
                <>
                  <Link
                    to="/favoritos"
                    className={`nav-link ${
                      location.pathname === "/favoritos" ? "active" : ""
                    }`}
                    onClick={cerrarMenu}
                  >
                    Favoritos
                  </Link>
                  <Link
                    to="/mis-solicitudes"
                    className={`nav-link ${
                      location.pathname === "/mis-solicitudes" ? "active" : ""
                    }`}
                    onClick={cerrarMenu}
                  >
                    Mis solicitudes
                  </Link>
                  <Link
                    to="/perfil"
                    className={`nav-link ${
                      location.pathname === "/perfil" ? "active" : ""
                    }`}
                    onClick={cerrarMenu}
                  >
                    Mi perfil
                  </Link>
                </>
              )}
              {esAdmin && (
                <Link
                  to="/admin"
                  className={`nav-link nav-link-admin ${
                    location.pathname === "/admin" ? "active" : ""
                  }`}
                  onClick={cerrarMenu}
                >
                  <span className="admin-badge-dot"></span>
                  Panel Admin
                </Link>
              )}
              {esRefugio && (
                <Link
                  to="/refugio"
                  className={`nav-link nav-link-admin ${
                    location.pathname === "/refugio" ? "active" : ""
                  }`}
                  onClick={cerrarMenu}
                >
                  <span
                    className="admin-badge-dot"
                    style={{ backgroundColor: "#10B981" }}
                  ></span>
                  Mi Refugio
                </Link>
              )}
              {estaAutenticado && <NotificacionesCampana />}
              {estaAutenticado ? (
                <button className="nav-btn-logout" onClick={cerrarSesion}>
                  Cerrar Sesión
                </button>
              ) : (
                <Link
                  to="/iniciosesion"
                  className="nav-btn-primary"
                  onClick={cerrarMenu}
                >
                  Iniciar Sesión
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/adopcion"
                className={`nav-link ${
                  location.pathname === "/adopcion" ? "active" : ""
                }`}
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

      {/* OVERLAY BACKDROP EN MÓVIL */}
      {menuAbierto && (
        <div
          className="nav-backdrop"
          onClick={cerrarMenu}
          aria-hidden="true"
        />
      )}
    </header>
  );
}

export default Navbar;
