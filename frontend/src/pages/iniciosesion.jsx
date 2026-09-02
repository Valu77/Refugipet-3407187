import "../inciosesion.css";

import { useState } from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";

function Iniciosesion() {
  const navigate = useNavigate();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const iniciarSesion = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const respuesta = await fetch("http://127.0.0.1:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          correo: correo,
          password: password
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.detail || "Correo o contrasena incorrectos");
        setCargando(false);
        return;
      }

      localStorage.setItem("token", datos.access_token);
      localStorage.setItem("usuario", JSON.stringify(datos.usuario));

            if (datos.usuario.rol === "admin") {
        navigate("/admin");
      } else {
        navigate("/principal");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-logo">
        <img src={logo} alt="Logo RefugiPet" />
      </div>

      <div className="login-card">
        <h1>Iniciar Sesion</h1>

        <p className="login-subtitle">Ingresa a tu cuenta de RefugiPet</p>

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        <form className="login-form" onSubmit={iniciarSesion}>
          <div className="input-group">
            <label htmlFor="email">Correo electronico</label>

            <input
              type="email"
              id="email"
              placeholder="Ingresa tu correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Contrasena</label>

            <input
              type="password"
              id="password"
              placeholder="Ingresa tu contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-options">
            <label>
              <input type="checkbox" />
              Recordarme
            </label>

            <a href="#">Olvidaste tu contrasena?</a>
          </div>

          <button type="submit" className="login-button" disabled={cargando}>
            {cargando ? "Ingresando..." : "Iniciar Sesion"}
          </button>
        </form>

        <p className="register-text">
          No tienes una cuenta?{" "}
          <Link to="/registrar">Registrate aqui</Link>
        </p>

        <Link to="/" className="back-home">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default Iniciosesion;