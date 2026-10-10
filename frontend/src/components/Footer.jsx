import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "./layout.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        <div className="footer-brand-column">
          <div className="footer-logo">
            <img src={logo} alt="RefugiPet Logo" />
            <span className="footer-title">RefugiPet</span>
          </div>
          <p className="footer-slogan">
            Juntos construimos un hogar para cada mascota. Promovemos la adopción responsable y el bienestar animal.
          </p>
        </div>

        <div className="footer-links-column">
          <h4 className="footer-heading">Navegación</h4>
          <ul className="footer-links">
            <li>
              <Link to="/principal">Inicio</Link>
            </li>
            <li>
              <Link to="/adopcion">Mascotas en adopción</Link>
            </li>
            <li>
              <Link to="/contacto">Contacto</Link>
            </li>
          </ul>
        </div>

        <div className="footer-info-column">
          <h4 className="footer-heading">Contacto & Ayuda</h4>
          <p className="footer-info-item">📍 Calle Principal #123, Ciudad</p>
          <p className="footer-info-item">✉️ contacto@refugipet.org</p>
          <p className="footer-info-item">📞 +57 (300) 123-4567</p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-container">
          <p>© {currentYear} RefugiPet - Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
