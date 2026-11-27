import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { apiFetch } from "../services/api";
import "../adopcion.css";

function obtenerEstadoVisual(mascota) {
  if (mascota.estado === "Adoptada") {
    return { texto: "Adoptada", clase: "adoptado" };
  }
  if (mascota.en_proceso) {
    return { texto: "En proceso de adopción", clase: "proceso" };
  }
  return { texto: "Disponible", clase: "disponible" };
}

function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarFavoritos = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const datos = await apiFetch("/favoritos/", {}, { auth: true });
      setFavoritos(datos);
    } catch (err) {
      setError(err.message || "No se pudieron cargar tus favoritos.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarFavoritos();
  }, [cargarFavoritos]);

  const quitarFavorito = async (mascotaId) => {
    try {
      await apiFetch(
        `/favoritos/${mascotaId}`,
        { method: "DELETE" },
        { auth: true }
      );
      setFavoritos((prev) => prev.filter((m) => m.id !== mascotaId));
    } catch (err) {
      setError(err.message || "No se pudo quitar de favoritos.");
    }
  };

  return (
    <div className="adopcion-page-wrapper">
      <Navbar variant="app" />

      <main className="adopcion-main-content">
        <section className="adopcion-hero-banner">
          <div className="container">
            <span className="hero-pill-badge">❤️ TUS FAVORITOS</span>
            <h1>
              Mascotas <span>Guardadas</span>
            </h1>
            <p>
              Aquí encuentras a los perros y gatos que marcaste como favoritos para revisar o iniciar su proceso de adopción.
            </p>
          </div>
        </section>

        <div className="container catalog-container">
          <div className="results-counter-bar" style={{ marginTop: "1rem" }}>
            <h2>Mis favoritos</h2>
            <Link to="/adopcion" className="btn-limpiar-filtros">
              Explorar catálogo 🐾
            </Link>
          </div>

          {cargando && (
            <div className="mascotas-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton skeleton-image"></div>
                  <div className="skeleton skeleton-text medium"></div>
                  <div className="skeleton skeleton-text short"></div>
                </div>
              ))}
            </div>
          )}

          {!cargando && error && (
            <div className="state-box">
              <div className="state-box-icon">⚠️</div>
              <h3>Error al cargar favoritos</h3>
              <p>{error}</p>
              <button type="button" className="btn-retry" onClick={cargarFavoritos}>
                Reintentar
              </button>
            </div>
          )}

          {!cargando && !error && favoritos.length === 0 && (
            <div className="state-box">
              <div className="state-box-icon">🤍</div>
              <h3>Aún no tienes mascotas favoritas</h3>
              <p>
                Explora nuestro catálogo de perros y gatos y haz clic en el corazón para guardarlos aquí.
              </p>
              <Link to="/adopcion" className="btn-retry">
                Explorar mascotas
              </Link>
            </div>
          )}

          {!cargando && !error && favoritos.length > 0 && (
            <div className="mascotas-grid">
              {favoritos.map((mascota) => {
                const estadoVis = obtenerEstadoVisual(mascota);
                return (
                  <article className="pet-catalog-card" key={mascota.id}>
                    <div className="pet-card-image-box">
                      <span className={`badge-status ${estadoVis.clase}`}>
                        {estadoVis.texto}
                      </span>
                      <button
                        type="button"
                        className="btn-fav-float active"
                        aria-label={`Quitar a ${mascota.nombre} de favoritos`}
                        onClick={() => quitarFavorito(mascota.id)}
                      >
                        ❤️
                      </button>

                      {mascota.imagen ? (
                        <img
                          src={mascota.imagen}
                          alt={mascota.nombre}
                          className="pet-image"
                          loading="lazy"
                        />
                      ) : (
                        <div className="pet-emoji-fallback">
                          {mascota.tipo === "Gato" ? "🐱" : "🐶"}
                        </div>
                      )}
                    </div>

                    <div className="pet-card-content">
                      <div className="pet-header">
                        <h3>{mascota.nombre}</h3>
                        <span className="pet-emoji-tag">
                          {mascota.tipo === "Gato" ? "🐱" : "🐶"}
                        </span>
                      </div>

                      <div className="pet-tags-list">
                        <span className="tag-pill">{mascota.tipo}</span>
                        <span className="tag-pill">
                          {mascota.edad} {mascota.edad === 1 ? "año" : "años"}
                        </span>
                        <span className="tag-pill">
                          {mascota.tamaño || mascota.tamano}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: "var(--primary-dark)",
                          fontWeight: 600,
                          marginBottom: "0.45rem",
                        }}
                      >
                        🏠{" "}
                        {mascota.nombre_refugio
                          ? `${mascota.nombre_refugio}${
                              mascota.ciudad_refugio
                                ? ` (${mascota.ciudad_refugio})`
                                : ""
                            }`
                          : "RefugiPet"}
                      </p>

                      {mascota.descripcion && (
                        <p className="pet-description">{mascota.descripcion}</p>
                      )}

                      <div className="pet-actions-row">
                        <button
                          type="button"
                          className="btn-details-action"
                          onClick={() => quitarFavorito(mascota.id)}
                        >
                          Quitar
                        </button>
                        {mascota.estado === "Adoptada" ? (
                          <button
                            className="btn-adopt-disabled"
                            style={{ flex: 1.25 }}
                            disabled
                          >
                            Adoptada
                          </button>
                        ) : (
                          <Link
                            to={`/solicitar-adopcion/${mascota.id}`}
                            className="btn-adopt-action"
                          >
                            Adoptar
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Favoritos;
