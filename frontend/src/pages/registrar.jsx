import "../registrar.css";

import { useState } from "react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api";

function Registrar() {
  const [tipoCuenta, setTipoCuenta] = useState("usuario");

  // Campos comunes y de usuario
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Campos adicionales para refugio
  const [nombreRefugio, setNombreRefugio] = useState("");
  const [nombreResponsable, setNombreResponsable] = useState("");
  const [telefono, setTelefono] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [direccion, setDireccion] = useState("");

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [registroExitoso, setRegistroExitoso] = useState(false);

  const cambiarTipoCuenta = (nuevoTipo) => {
    setTipoCuenta(nuevoTipo);
    setError("");
  };

  const registrar = async (e) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo.trim())) {
      setError("Por favor ingresa un correo electrónico válido");
      return;
    }

    if (password.length < 12) {
      setError("La contraseña debe tener un mínimo de 12 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (tipoCuenta === "refugio") {
      if (nombreRefugio.trim().length < 2) {
        setError("El nombre del refugio debe tener al menos 2 caracteres");
        return;
      }
      if (nombreResponsable.trim().length < 2) {
        setError("El nombre del responsable debe tener al menos 2 caracteres");
        return;
      }
      if (telefono.trim().length < 7) {
        setError("Ingresa un teléfono válido (mínimo 7 caracteres)");
        return;
      }
      if (ciudad.trim().length < 2) {
        setError("Ingresa una ciudad válida");
        return;
      }
      if (direccion.trim().length < 5) {
        setError("La dirección debe tener al menos 5 caracteres");
        return;
      }
    } else if (nombre.trim().length < 2) {
      setError("El nombre completo debe tener al menos 2 caracteres");
      return;
    }

    setCargando(true);

    try {
      const endpoint =
        tipoCuenta === "refugio"
          ? `${API_URL}/auth/registrar-refugio`
          : `${API_URL}/auth/registrar`;

      const payload =
        tipoCuenta === "refugio"
          ? {
              nombre_refugio: nombreRefugio.trim(),
              nombre_responsable: nombreResponsable.trim(),
              correo: correo.trim().toLowerCase(),
              telefono: telefono.trim(),
              ciudad: ciudad.trim(),
              direccion: direccion.trim(),
              password: password,
              confirmar_password: confirmPassword,
            }
          : {
              nombre: nombre.trim(),
              correo: correo.trim().toLowerCase(),
              password: password,
              confirmar_password: confirmPassword,
            };

      const respuesta = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        let mensajeError = "No se pudo completar el registro";
        if (datos.detail) {
          if (Array.isArray(datos.detail)) {
            mensajeError = datos.detail.map((err) => err.msg || err).join(", ");
          } else {
            mensajeError = datos.detail;
          }
        }
        setError(mensajeError);
        return;
      }

      setRegistroExitoso(true);
    } catch {
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
          <div className="register-success-badge">
            {tipoCuenta === "refugio" ? "⏳" : "✅"}
          </div>

          <h1>
            {tipoCuenta === "refugio"
              ? "Solicitud enviada"
              : "Cuenta creada"}
          </h1>

          <p className="register-subtitle">
            {tipoCuenta === "refugio"
              ? `El refugio "${nombreRefugio}" fue registrado correctamente. Tu solicitud quedó pendiente de aprobación por el administrador general.`
              : "Tu cuenta se registró correctamente. Ya puedes iniciar sesión."}
          </p>

          {tipoCuenta === "refugio" && (
            <div className="register-info-banner">
              Podrás iniciar sesión y acceder al panel de tu refugio una vez que el administrador apruebe tu solicitud.
            </div>
          )}

          <Link
            to="/iniciosesion"
            className="register-button"
            style={{
              display: "block",
              textAlign: "center",
              textDecoration: "none",
              marginTop: "1.25rem",
            }}
          >
            Ir a iniciar sesión
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
          Únete a RefugiPet como adoptante o registra tu refugio
        </p>

        <div className="register-type-selector" role="tablist" aria-label="Tipo de cuenta">
          <button
            type="button"
            role="tab"
            aria-selected={tipoCuenta === "usuario"}
            className={`btn-type-tab ${tipoCuenta === "usuario" ? "active" : ""}`}
            onClick={() => cambiarTipoCuenta("usuario")}
          >
            👤 Soy Adoptante
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tipoCuenta === "refugio"}
            className={`btn-type-tab ${tipoCuenta === "refugio" ? "active" : ""}`}
            onClick={() => cambiarTipoCuenta("refugio")}
          >
            🏠 Soy un Refugio
          </button>
        </div>

        {tipoCuenta === "refugio" && (
          <div className="register-info-banner">
            Las cuentas de refugio pasan por revisión del administrador antes de poder publicar mascotas y gestionar adopciones.
          </div>
        )}

        {error && <div className="register-error-alert">{error}</div>}

        <form className="register-form" onSubmit={registrar}>
          {tipoCuenta === "usuario" ? (
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
          ) : (
            <>
              <div className="register-form-grid">
                <div className="register-input-group">
                  <label htmlFor="nombreRefugio">Nombre del refugio</label>
                  <input
                    type="text"
                    id="nombreRefugio"
                    placeholder="Ej. Huellitas Felices"
                    value={nombreRefugio}
                    onChange={(e) => setNombreRefugio(e.target.value)}
                    required
                  />
                </div>

                <div className="register-input-group">
                  <label htmlFor="nombreResponsable">Responsable</label>
                  <input
                    type="text"
                    id="nombreResponsable"
                    placeholder="Nombre del encargado"
                    value={nombreResponsable}
                    onChange={(e) => setNombreResponsable(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="register-form-grid">
                <div className="register-input-group">
                  <label htmlFor="telefono">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    placeholder="Ej. 3001234567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    required
                  />
                </div>

                <div className="register-input-group">
                  <label htmlFor="ciudad">Ciudad</label>
                  <input
                    type="text"
                    id="ciudad"
                    placeholder="Ej. Bogotá"
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="register-input-group">
                <label htmlFor="direccion">Dirección del refugio</label>
                <input
                  type="text"
                  id="direccion"
                  placeholder="Calle, carrera y barrio"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="register-input-group">
            <label htmlFor="email">Correo electrónico</label>
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
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              placeholder="Crea una contraseña segura (mín. 12 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={12}
              required
            />
            <small style={{ color: "#666", fontSize: "0.8rem", marginTop: "2px", display: "block" }}>
              Mínimo 12 caracteres.
            </small>
          </div>

          <div className="register-input-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Repite tu contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={12}
              required
            />
          </div>

          <button type="submit" className="register-button" disabled={cargando}>
            {cargando
              ? "Registrando..."
              : tipoCuenta === "refugio"
              ? "Enviar solicitud de refugio"
              : "Registrarme"}
          </button>
        </form>

        <p className="login-text">
          ¿Ya tienes una cuenta?{" "}
          <Link to="/iniciosesion">Inicia sesión aquí</Link>
        </p>

        <Link to="/" className="register-back-home">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default Registrar;