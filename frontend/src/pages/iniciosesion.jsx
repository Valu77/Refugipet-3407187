import "../inciosesion.css";

import { useState } from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

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
      const datos = await apiFetch("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          correo: correo.trim().toLowerCase(),
          password: password
        })
      });

      localStorage.setItem("token", datos.access_token);
      localStorage.setItem("usuario", JSON.stringify(datos.usuario));

      if (datos.usuario.rol === "admin") {
        navigate("/admin");
      } else if (datos.usuario.rol === "refugio") {
        navigate("/refugio");
      } else {
        navigate("/principal");
      }
    } catch (err) {
      setError(err.message || "No se pudo conectar con el servidor.");
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

            <Link to="/olvide-password">¿Olvidaste tu contraseña?</Link>
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