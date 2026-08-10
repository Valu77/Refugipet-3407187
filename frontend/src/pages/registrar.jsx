import "../registrar.css";

import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

function Registrar() {
  return (
    <div className="register-page">

      {/* LOGO */}
      <div className="register-logo">
        <img src={logo} alt="Logo RefugiPet" />
      </div>

      {/* TARJETA DE REGISTRO */}
      <div className="register-card">

        <h1>Crear una cuenta</h1>

        <p className="register-subtitle">
          Únete a RefugiPet y ayuda a encontrar un hogar
        </p>

        <form className="register-form">

          {/* NOMBRE */}
          <div className="register-input-group">
            <label htmlFor="nombre">
              Nombre completo
            </label>

            <input
              type="text"
              id="nombre"
              placeholder="Ingresa tu nombre completo"
              required
            />
          </div>

          {/* CORREO */}
          <div className="register-input-group">
            <label htmlFor="email">
              Correo electrónico
            </label>

            <input
              type="email"
              id="email"
              placeholder="Ingresa tu correo"
              required
            />
          </div>

          {/* TELÉFONO */}
          <div className="register-input-group">
            <label htmlFor="telefono">
              Teléfono
            </label>

            <input
              type="tel"
              id="telefono"
              placeholder="Ingresa tu teléfono"
              required
            />
          </div>

          {/* CONTRASEÑA */}
          <div className="register-input-group">
            <label htmlFor="password">
              Contraseña
            </label>

            <input
              type="password"
              id="password"
              placeholder="Crea una contraseña"
              required
            />
          </div>

          {/* CONFIRMAR CONTRASEÑA */}
          <div className="register-input-group">
            <label htmlFor="confirmPassword">
              Confirmar contraseña
            </label>

            <input
              type="password"
              id="confirmPassword"
              placeholder="Repite tu contraseña"
              required
            />
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            className="register-button"
          >
            Registrarme
          </button>

        </form>

        {/* INICIAR SESIÓN */}
        <p className="login-text">
          ¿Ya tienes una cuenta?
          {" "}
          <Link to="/login">
            Inicia sesión aquí
          </Link>
        </p>

        {/* VOLVER */}
        <Link to="/" className="register-back-home">
          ← Volver al inicio
        </Link>

      </div>

    </div>
  );
}

export default Registrar;