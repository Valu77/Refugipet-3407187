import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { apiFetch } from "../services/api";
import "../adopcion.css";

function PerfilUsuario() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [rol, setRol] = useState("");
  const [cargando, setCargando] = useState(true);

  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState("");
  const [exitoPerfil, setExitoPerfil] = useState("");

  const [passwordActual, setPasswordActual] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [errorPass, setErrorPass] = useState("");
  const [exitoPass, setExitoPass] = useState("");

  useEffect(() => {
    apiFetch("/auth/me", {}, { auth: true })
      .then((datos) => {
        setNombre(datos.nombre || "");
        setCorreo(datos.correo || "");
        setRol(datos.rol || "");
      })
      .catch((err) => {
        setErrorPerfil(err.message || "No se pudo cargar tu perfil.");
      })
      .finally(() => setCargando(false));
  }, []);

  const guardarPerfil = async (e) => {
    e.preventDefault();
    setErrorPerfil("");
    setExitoPerfil("");

    if (nombre.trim().length < 2) {
      setErrorPerfil("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    setGuardandoPerfil(true);
    try {
      const actualizado = await apiFetch(
        "/auth/perfil",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: nombre.trim() }),
        },
        { auth: true }
      );
      try {
        const local = JSON.parse(localStorage.getItem("usuario") || "null");
        if (local) {
          local.nombre = actualizado.nombre;
          localStorage.setItem("usuario", JSON.stringify(local));
        }
      } catch {
        // ignorar
      }
      setExitoPerfil("Perfil actualizado correctamente.");
    } catch (err) {
      setErrorPerfil(err.message || "No se pudo actualizar el perfil.");
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const cambiarPassword = async (e) => {
    e.preventDefault();
    setErrorPass("");
    setExitoPass("");

    if (nuevaPassword.length < 12) {
      setErrorPass("La nueva contraseña debe tener mínimo 12 caracteres.");
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setErrorPass("Las contraseñas nuevas no coinciden.");
      return;
    }

    setGuardandoPass(true);
    try {
      const resp = await apiFetch(
        "/auth/cambiar-password",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            password_actual: passwordActual,
            nueva_password: nuevaPassword,
            confirmar_nueva_password: confirmarPassword,
          }),
        },
        { auth: true }
      );
      setExitoPass(resp.mensaje || "Contraseña actualizada exitosamente.");
      setPasswordActual("");
      setNuevaPassword("");
      setConfirmarPassword("");
    } catch (err) {
      setErrorPass(err.message || "No se pudo cambiar la contraseña.");
    } finally {
      setGuardandoPass(false);
    }
  };

  return (
    <div className="adopcion-page-wrapper">
      <Navbar variant="app" />

      <main className="adopcion-main-content">
        <section className="adopcion-hero-banner">
          <div className="container">
            <span className="hero-pill-badge">👤 MI CUENTA</span>
            <h1>
              Mi <span>Perfil</span>
            </h1>
            <p>
              Actualiza tu información personal y mantén segura la contraseña de tu cuenta RefugiPet.
            </p>
          </div>
        </section>

        <div className="container catalog-container">
          {cargando ? (
            <div className="filtros-card">
              <p>Cargando perfil...</p>
            </div>
          ) : (
            <div className="perfil-user-grid">
              <section className="filtros-card" style={{ marginBottom: 0 }}>
                <h2 style={{ color: "var(--primary-dark)", marginBottom: "0.25rem" }}>
                  Datos personales
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                  Edita tu nombre visible en RefugiPet.
                </p>

                {errorPerfil && (
                  <div className="solicitud-rechazo-alert" role="alert">
                    ⚠️ {errorPerfil}
                  </div>
                )}
                {exitoPerfil && (
                  <div className="perfil-success-alert" role="status">
                    ✅ {exitoPerfil}
                  </div>
                )}

                <form onSubmit={guardarPerfil} className="perfil-form">
                  <div className="select-group">
                    <label htmlFor="perfil-user-nombre">Nombre completo</label>
                    <input
                      id="perfil-user-nombre"
                      type="text"
                      className="perfil-input"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      minLength={2}
                      required
                    />
                  </div>

                  <div className="select-group">
                    <label htmlFor="perfil-user-correo">Correo electrónico</label>
                    <input
                      id="perfil-user-correo"
                      type="email"
                      className="perfil-input readonly"
                      value={correo}
                      readOnly
                    />
                  </div>

                  <div className="select-group">
                    <label htmlFor="perfil-user-rol">Tipo de cuenta</label>
                    <input
                      id="perfil-user-rol"
                      type="text"
                      className="perfil-input readonly"
                      value={rol}
                      readOnly
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-adopt-action"
                    disabled={guardandoPerfil}
                    style={{ marginTop: "0.5rem" }}
                  >
                    {guardandoPerfil ? "Guardando..." : "Guardar cambios"}
                  </button>
                </form>
              </section>

              <section className="filtros-card" style={{ marginBottom: 0 }}>
                <h2 style={{ color: "var(--primary-dark)", marginBottom: "0.25rem" }}>
                  Cambiar contraseña
                </h2>
                <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "0.5rem" }}>
                  Usa una contraseña segura de al menos 12 caracteres.
                </p>

                {errorPass && (
                  <div className="solicitud-rechazo-alert" role="alert">
                    ⚠️ {errorPass}
                  </div>
                )}
                {exitoPass && (
                  <div className="perfil-success-alert" role="status">
                    ✅ {exitoPass}
                  </div>
                )}

                <form onSubmit={cambiarPassword} className="perfil-form">
                  <div className="select-group">
                    <label htmlFor="perfil-pass-actual">Contraseña actual</label>
                    <input
                      id="perfil-pass-actual"
                      type="password"
                      className="perfil-input"
                      value={passwordActual}
                      onChange={(e) => setPasswordActual(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <div className="select-group">
                    <label htmlFor="perfil-pass-nueva">Nueva contraseña</label>
                    <input
                      id="perfil-pass-nueva"
                      type="password"
                      className="perfil-input"
                      value={nuevaPassword}
                      onChange={(e) => setNuevaPassword(e.target.value)}
                      minLength={12}
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="select-group">
                    <label htmlFor="perfil-pass-confirmar">Confirmar nueva contraseña</label>
                    <input
                      id="perfil-pass-confirmar"
                      type="password"
                      className="perfil-input"
                      value={confirmarPassword}
                      onChange={(e) => setConfirmarPassword(e.target.value)}
                      minLength={12}
                      required
                      autoComplete="new-password"
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-adopt-action"
                    disabled={guardandoPass}
                    style={{ marginTop: "0.5rem" }}
                  >
                    {guardandoPass ? "Actualizando..." : "Actualizar contraseña"}
                  </button>
                </form>
              </section>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default PerfilUsuario;
