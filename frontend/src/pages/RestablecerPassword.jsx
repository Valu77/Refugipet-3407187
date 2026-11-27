import "../inciosesion.css";
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import logo from "../assets/logo.png";
import { apiFetch } from "../services/api";

function RestablecerPassword() {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get("token") || "").trim();

  const [validandoToken, setValidandoToken] = useState(true);
  const [tokenValido, setTokenValido] = useState(false);
  const [errorToken, setErrorToken] = useState("");

  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    if (!token || token.length < 16) {
      setTokenValido(false);
      setErrorToken("El enlace de recuperación es inválido o está incompleto.");
      setValidandoToken(false);
      return;
    }

    let activo = true;
    apiFetch(`/auth/validar-token-reset?token=${encodeURIComponent(token)}`)
      .then(() => {
        if (activo) {
          setTokenValido(true);
          setErrorToken("");
        }
      })
      .catch((err) => {
        if (activo) {
          setTokenValido(false);
          setErrorToken(
            err.message || "El enlace de recuperación es inválido o ha expirado."
          );
        }
      })
      .finally(() => {
        if (activo) setValidandoToken(false);
      });

    return () => {
      activo = false;
    };
  }, [token]);

  const manejarRestablecimiento = async (e) => {
    e.preventDefault();
    setError("");

    if (nuevaPassword.length < 12) {
      setError("La nueva contraseña debe tener al menos 12 caracteres.");
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    try {
      await apiFetch("/auth/restablecer-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          nueva_password: nuevaPassword,
          confirmar_nueva_password: confirmarPassword,
        }),
      });
      setCompletado(true);
    } catch (err) {
      setError(err.message || "No se pudo restablecer la contraseña.");
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
        <h1>Nueva contraseña</h1>

        {validandoToken && (
          <p className="login-subtitle">Verificando enlace de recuperación...</p>
        )}

        {!validandoToken && !tokenValido && !completado && (
          <>
            <div
              role="alert"
              style={{
                backgroundColor: "#FEF2F2",
                color: "#B91C1C",
                border: "1px solid #FECACA",
                padding: "0.85rem 1rem",
                borderRadius: "8px",
                fontSize: "0.92rem",
                marginBottom: "1.25rem",
                textAlign: "center",
              }}
            >
              {errorToken}
            </div>
            <Link
              to="/olvide-password"
              className="login-button"
              style={{ display: "block", textAlign: "center", textDecoration: "none" }}
            >
              Solicitar un nuevo enlace
            </Link>
          </>
        )}

        {!validandoToken && tokenValido && completado && (
          <>
            <div
              role="status"
              style={{
                backgroundColor: "#ECFDF5",
                color: "#065F46",
                border: "1px solid #A7F3D0",
                padding: "0.9rem 1rem",
                borderRadius: "8px",
                fontSize: "0.92rem",
                marginBottom: "1.25rem",
                textAlign: "center",
              }}
            >
              ✅ Tu contraseña se restableció correctamente. Ya puedes iniciar sesión.
            </div>
            <Link
              to="/iniciosesion"
              className="login-button"
              style={{ display: "block", textAlign: "center", textDecoration: "none" }}
            >
              Ir a iniciar sesión
            </Link>
          </>
        )}

        {!validandoToken && tokenValido && !completado && (
          <>
            <p className="login-subtitle">
              Ingresa y confirma tu nueva contraseña segura (mínimo 12 caracteres).
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

            <form className="login-form" onSubmit={manejarRestablecimiento}>
              <div className="input-group">
                <label htmlFor="new-password">Nueva contraseña</label>
                <input
                  type="password"
                  id="new-password"
                  placeholder="Mínimo 12 caracteres"
                  value={nuevaPassword}
                  onChange={(e) => setNuevaPassword(e.target.value)}
                  minLength={12}
                  required
                  autoComplete="new-password"
                />
              </div>

              <div className="input-group">
                <label htmlFor="confirm-new-password">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  id="confirm-new-password"
                  placeholder="Repite la nueva contraseña"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  minLength={12}
                  required
                  autoComplete="new-password"
                />
              </div>

              <button type="submit" className="login-button" disabled={cargando}>
                {cargando ? "Guardando..." : "Guardar nueva contraseña"}
              </button>
            </form>
          </>
        )}

        <Link to="/iniciosesion" className="back-home">
          ← Volver al inicio de sesión
        </Link>
      </div>
    </div>
  );
}

export default RestablecerPassword;
