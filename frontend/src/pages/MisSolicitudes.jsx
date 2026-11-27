import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../adopcion.css";

const API_URL = "http://127.0.0.1:8000/api";

function estadoClase(estado) {
  const e = (estado || "").toLowerCase();
  if (e === "aprobada") return "aprobada";
  if (e === "rechazada") return "rechazada";
  return "pendiente";
}

function MisSolicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState("Todas");
  const [detalle, setDetalle] = useState(null);

  const cargarSolicitudes = async () => {
    setCargando(true);
    setError("");
    const token = localStorage.getItem("token");

    try {
      const resp = await fetch(`${API_URL}/adopciones/mis-solicitudes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const datos = await resp.json().catch(() => []);
      if (!resp.ok) {
        throw new Error(datos.detail || "No se pudieron cargar tus solicitudes");
      }
      setSolicitudes(datos);
    } catch (err) {
      setError(err.message || "Error de conexión con el servidor");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarSolicitudes();
  }, []);

  useEffect(() => {
    if (!detalle) return;
    const onKey = (e) => {
      if (e.key === "Escape") setDetalle(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [detalle]);

  const filtradas = solicitudes.filter((s) =>
    filtro === "Todas" ? true : s.estado === filtro
  );

  return (
    <div className="adopcion-page-wrapper">
      <Navbar variant="app" />

      <main className="adopcion-main-content">
        <section className="adopcion-hero-banner">
          <div className="container">
            <span className="hero-pill-badge">📋 SEGUIMIENTO DE ADOPCIÓN</span>
            <h1>
              Mis <span>Solicitudes</span>
            </h1>
            <p>
              Consulta en tiempo real el estado de tus solicitudes de adopción enviadas a los refugios.
            </p>
          </div>
        </section>

        <div className="container catalog-container">
          <section className="filtros-card" style={{ padding: "1.25rem 1.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {["Todas", "Pendiente", "Aprobada", "Rechazada"].map((est) => (
                  <button
                    key={est}
                    type="button"
                    onClick={() => setFiltro(est)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "999px",
                      fontSize: "0.86rem",
                      fontWeight: 700,
                      border: "1px solid var(--border)",
                      background:
                        filtro === est ? "var(--primary)" : "var(--surface-alt)",
                      color: filtro === est ? "#fff" : "var(--text-muted)",
                    }}
                  >
                    {est}
                  </button>
                ))}
              </div>

              <Link to="/adopcion" className="btn-limpiar-filtros">
                Explorar más mascotas 🐾
              </Link>
            </div>
          </section>

          {cargando && (
            <div className="mis-solicitudes-list">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton skeleton-text medium"></div>
                  <div className="skeleton skeleton-text"></div>
                  <div className="skeleton skeleton-text short"></div>
                </div>
              ))}
            </div>
          )}

          {!cargando && error && (
            <div className="state-box">
              <div className="state-box-icon">⚠️</div>
              <h3>No pudimos cargar tus solicitudes</h3>
              <p>{error}</p>
              <button type="button" className="btn-retry" onClick={cargarSolicitudes}>
                Reintentar
              </button>
            </div>
          )}

          {!cargando && !error && filtradas.length === 0 && (
            <div className="state-box">
              <div className="state-box-icon">💌</div>
              <h3>
                {solicitudes.length === 0
                  ? "Todavía no has enviado solicitudes"
                  : "No hay solicitudes con ese estado"}
              </h3>
              <p>
                {solicitudes.length === 0
                  ? "Explora nuestro catálogo de perros y gatos y postúlate para darle un hogar a tu nuevo mejor amigo."
                  : `No tienes solicitudes registradas en estado "${filtro}".`}
              </p>
              <Link to="/adopcion" className="btn-retry">
                Explorar mascotas
              </Link>
            </div>
          )}

          {!cargando && !error && filtradas.length > 0 && (
            <div className="mis-solicitudes-list">
              {filtradas.map((sol) => (
                <article className="solicitud-user-card" key={sol.id}>
                  <div className="solicitud-card-top">
                    {sol.mascota_imagen ? (
                      <img
                        src={sol.mascota_imagen}
                        alt={sol.mascota_nombre}
                        className="solicitud-pet-thumb"
                      />
                    ) : (
                      <div className="solicitud-pet-thumb">
                        {sol.mascota_tipo === "Gato" ? "🐱" : "🐶"}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ margin: "0 0 2px", fontSize: "1.1rem", color: "var(--primary-dark)" }}>
                        {sol.mascota_nombre || `Mascota #${sol.mascota_id}`}
                      </h3>
                      <p style={{ margin: "0 0 6px", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        🏠 {sol.refugio_nombre || "RefugiPet"}
                      </p>
                      <span className={`solicitud-status-pill ${estadoClase(sol.estado)}`}>
                        {sol.estado}
                      </span>
                    </div>
                  </div>

                  <div className="solicitud-card-body">
                    <div style={{ color: "var(--text-muted)", fontSize: "0.83rem" }}>
                      <strong>Fecha:</strong>{" "}
                      {sol.fecha
                        ? new Date(sol.fecha).toLocaleDateString("es-CO")
                        : "-"}
                    </div>
                    <div>
                      <strong>Vivienda:</strong> {sol.vivienda} · <strong>Ciudad:</strong>{" "}
                      {sol.ciudad}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--text-muted)",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      <strong>Tu motivo:</strong> {sol.motivo}
                    </p>

                    {sol.estado === "Rechazada" && sol.motivo_rechazo && (
                      <div className="solicitud-rechazo-alert">
                        <strong>Motivo del refugio:</strong> {sol.motivo_rechazo}
                      </div>
                    )}

                    {sol.estado === "Aprobada" && (
                      <div
                        style={{
                          background: "#ecfdf5",
                          border: "1px solid #a7f3d0",
                          color: "#065f46",
                          padding: "0.65rem 0.8rem",
                          borderRadius: "8px",
                          fontSize: "0.84rem",
                        }}
                      >
                        🎉 ¡Felicidades! Tu solicitud fue aprobada. El refugio se comunicará contigo pronto.
                      </div>
                    )}

                    <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
                      <button
                        type="button"
                        className="btn-details-action"
                        style={{ width: "100%" }}
                        onClick={() => setDetalle(sol)}
                      >
                        Ver resumen completo
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      {detalle && (
        <div
          className="pet-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setDetalle(null)}
        >
          <div
            className="pet-modal-card"
            style={{ maxWidth: "620px", padding: "1.75rem" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="pet-modal-close"
              onClick={() => setDetalle(null)}
            >
              ✕
            </button>

            <h2 style={{ margin: "0 0 0.35rem", color: "var(--primary-dark)" }}>
              Solicitud #{detalle.id} — {detalle.mascota_nombre}
            </h2>
            <p style={{ margin: "0 0 1rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              {detalle.refugio_nombre} ·{" "}
              <span className={`solicitud-status-pill ${estadoClase(detalle.estado)}`}>
                {detalle.estado}
              </span>
            </p>

            <div style={{ display: "grid", gap: "0.7rem", fontSize: "0.92rem" }}>
              <div><strong>Teléfono:</strong> {detalle.telefono}</div>
              <div><strong>Ciudad:</strong> {detalle.ciudad}</div>
              <div><strong>Tipo de vivienda:</strong> {detalle.vivienda}</div>
              <div><strong>Otras mascotas:</strong> {detalle.otras_mascotas}</div>
              <div>
                <strong>Convivencia:</strong>{" "}
                {detalle.convivencia || "No especificada"}
              </div>
              <div>
                <strong>Experiencia previa:</strong>{" "}
                {detalle.experiencia_mascotas || "No especificada"}
              </div>
              <div><strong>Motivo:</strong> {detalle.motivo}</div>
              <div>
                <strong>Referencias:</strong>{" "}
                {detalle.referencias || "No especificadas"}
              </div>
              {detalle.motivo_rechazo && (
                <div className="solicitud-rechazo-alert">
                  <strong>Motivo de rechazo:</strong> {detalle.motivo_rechazo}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default MisSolicitudes;
