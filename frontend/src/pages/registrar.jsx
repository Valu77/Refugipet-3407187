import "../registrar.css";

import { useState } from "react";
import logo from "../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";

function Registrar() {
  const navigate = useNavigate();

  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  const registrar = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }

    setCargando(true);

    try {
      const respuesta = await fetch("http://127.0.0.1:8000/api/auth/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nombre: nombre,
          correo: correo,
          password: password
        })
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        setError(datos.detail || "No se pudo completar el registro");
        setCargando(false);
        return;
      }

      setRegistroExitoso(true);
    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  if (registroExitoso) {
    return (
      <div className="register-page">
        <div className="register-logo">
          <img src={logo} alt="Logo RefugiPet" />
        </div>

        <div className="register-card">
          <h1>Cuenta creada</h1>

          <p className="register-subtitle">
            Tu cuenta se registro correctamente. Ya puedes iniciar sesion.
          </p>

          <Link
            to="/iniciosesion"
            className="register-button"
            style={{
              display: "block",
              textAlign: "center",
              textDecoration: "none",
              marginTop: "1.5rem"
            }}
          >
            Ir a iniciar sesion
          </Link>

          <Link to="/" className="register-back-home">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-logo">
        <img src={logo} alt="Logo RefugiPet" />
      </div>

      <div className="register-card">
        <h1>Crear una cuenta</h1>

        <p className="register-subtitle">
          Unete a RefugiPet y ayuda a encontrar un hogar
        </p>

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}

        <form className="register-form" onSubmit={registrar}>
          <div className="register-input-group">
            <label htmlFor="nombre">Nombre completo</label>

            <input
              type="text"
              id="nombre"
              placeholder="Ingresa tu nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className="register-input-group">
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

          <div className="register-input-group">
            <label htmlFor="telefono">Telefono</label>

            <input
              type="tel"
              id="telefono"
              placeholder="Ingresa tu telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
          </div>

          <div className="register-input-group">
            <label htmlFor="password">Contrasena</label>

            <input
              type="password"
              id="password"
              placeholder="Crea una contrasena"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="register-input-group">
            <label htmlFor="confirmPassword">Confirmar contrasena</label>

            <input
              type="password"
              id="confirmPassword"
              placeholder="Repite tu contrasena"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="register-button" disabled={cargando}>
            {cargando ? "Registrando..." : "Registrarme"}
          </button>
        </form>

        <p className="login-text">
          Ya tienes una cuenta?{" "}
          <Link to="/iniciosesion">Inicia sesion aqui</Link>
        </p>

        <Link to="/" className="register-back-home">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default Registrar;