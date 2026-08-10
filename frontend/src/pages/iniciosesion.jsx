import "../inciosesion.css";

import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";

function Iniciosesion() {

  const navigate = useNavigate();

  const iniciarSesion = (e) => {
    e.preventDefault();

    // Después de iniciar sesión, ir a Principal
    navigate("/principal");
  };

  return (
    <div className="login-container">

      {/* LOGO */}
      <div className="login-logo">
        <img src={logo} alt="Logo RefugiPet" />
      </div>

      {/* TARJETA DE INICIO DE SESIÓN */}
      <div className="login-card">

        <h1>Iniciar Sesión</h1>

        <p className="login-subtitle">
          Ingresa a tu cuenta de RefugiPet
        </p>

        <form
          className="login-form"
          onSubmit={iniciarSesion}
        >

          {/* CORREO */}
          <div className="input-group">

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


          {/* CONTRASEÑA */}
          <div className="input-group">

            <label htmlFor="password">
              Contraseña
            </label>

            <input
              type="password"
              id="password"
              placeholder="Ingresa tu contraseña"
              required
            />

          </div>


          {/* RECORDAR / OLVIDÉ CONTRASEÑA */}
          <div className="login-options">

            <label>
              <input type="checkbox" />
              Recordarme
            </label>

            <a href="#">
              ¿Olvidaste tu contraseña?
            </a>

          </div>


          {/* BOTÓN */}
          <button
            type="submit"
            className="login-button"
          >
            Iniciar Sesión
          </button>

        </form>


        {/* REGISTRO */}
        <p className="register-text">

          ¿No tienes una cuenta?{" "}

          <Link to="/registrar">
            Regístrate aquí
          </Link>

        </p>


        {/* VOLVER */}
        <Link
          to="/"
          className="back-home"
        >
          ← Volver al inicio
        </Link>

      </div>

    </div>
  );
}

export default Iniciosesion;