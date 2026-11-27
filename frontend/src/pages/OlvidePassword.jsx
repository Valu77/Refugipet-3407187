import "../inciosesion.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { apiFetch } from "../services/api";

function OlvidePassword() {
  const [correo, setCorreo] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensajeEnviado, setMensajeEnviado] = useState("");

  const manejarEnvio = async (e) => {
    e.preventDefault();
    setError("");
    setMensajeEnviado("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.trim())) {
      setError("Por favor ingresa un correo electrónico válido.");
      return;
    }

    setCargando(true);
    try {
      const datos = await apiFetch("/auth/olvide-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correo.trim().toLowerCase() }),
      });
      setMensajeEnviado(datos.mensaje);
      setCorreo("");
    } catch (err) {
      setError(err.message || "No se pudo procesar la solicitud.");
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
        <h1>Recuperar contraseña</h1>
        <p className="login-subtitle">
          Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña.
        </p>

        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: "#FEF2F2",
              color: "#B91C1C",
              border: "1px solid #FECACA",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              fontSize: "0.9rem",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {mensajeEnviado && (
          <div
            role="status"
            style={{
              backgroundColor: "#ECFDF5",
              color: "#065F46",
              border: "1px solid #A7F3D0",
              padding: "0.85rem 1rem",
              borderRadius: "8px",
              fontSize: "0.9rem",
              marginBottom: "1rem",
              lineHeight: 1.5,
            }}
          >
            {mensajeEnviado}
          </div>
        )}

        <form className="login-form" onSubmit={manejarEnvio}>
          <div className="input-group">
            <label htmlFor="reset-email">Correo electrónico</label>
            <input
              type="email"
              id="reset-email"
              placeholder="ejemplo@correo.com"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <button type="submit" className="login-button" disabled={cargando}>
            {cargando ? "Enviando solicitud..." : "Enviar enlace de recuperación"}
          </button>
        </form>

        <p className="register-text">
          ¿Recordaste tu contraseña?{" "}
          <Link to="/iniciosesion">Inicia sesión</Link>
        </p>

        <Link to="/" className="back-home">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default OlvidePassword;
