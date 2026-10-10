import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../principal.css";

const emojiPorTipo = {
  Perro: "🐶",
  Gato: "🐱",
  Ave: "🐦",
  Conejo: "🐰",
};

function Principal() {
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarMascotas = async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch("http://127.0.0.1:8000/api/mascotas/");

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las mascotas");
      }

      const datos = await respuesta.json();
      setMascotas(datos);
    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMascotas();
  }, []);

  const mascotasDestacadas = mascotas.slice(0, 4);

  return (
    <div className="principal-page-container">
      <Navbar variant="app" />

      <main className="principal-main">
        {/* HERO SECTION */}
        <section className="hero-principal">
          <div className="container hero-principal-content">
            <div className="hero-text-wrapper">
              <span className="hero-badge">💙 BIENVENIDO A REFUGIPET</span>
              <h1>Encuentra a tu nuevo <span>mejor amigo</span></h1>
              <p>
                Nos alegra tenerte en nuestra comunidad. Explora las mascotas disponibles y descubre algunos de nuestros amigos que están esperando encontrar una familia y un hogar lleno de amor.
              </p>

              <div className="hero-principal-buttons">
                <Link to="/adopcion" className="btn-primary-lg">
                  Encontrar mi mascota
                </Link>
                <Link to="/contacto" className="btn-secondary-lg">
                  Conoce el proceso
                </Link>
              </div>
            </div>

            <div className="hero-stats-card">
              <div className="stat-item">
                <span className="stat-number">100+</span>
                <span className="stat-label">Mascotas adoptadas</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Cuidado amoroso</span>
              </div>
            </div>
          </div>
        </section>

        {/* MASCOTAS DESTACADAS */}
        <section className="mascotas-destacadas-section">
          <div className="container">
            <div className="section-header center">
              <h2>Ellos esperan por ti</h2>
              <p>Conoce algunos de nuestros amigos que están esperando encontrar un hogar.</p>
            </div>

            {/* SKELETON LOADING */}
            {cargando && (
              <div className="mascotas-grid-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton-card">
                    <div className="skeleton skeleton-image"></div>
                    <div className="skeleton skeleton-text medium"></div>
                    <div className="skeleton skeleton-text short"></div>
                    <div className="skeleton skeleton-text"></div>
                  </div>
                ))}
              </div>
            )}

            {/* ERROR STATE */}
            {!cargando && error && (
              <div className="state-box">
                <div className="state-box-icon">⚠️</div>
                <h3>Error de conexión</h3>
                <p>{error}</p>
                <button onClick={cargarMascotas} className="btn-retry">
                  Intentar nuevamente
                </button>
              </div>
            )}

            {/* EMPTY STATE */}
            {!cargando && !error && mascotasDestacadas.length === 0 && (
              <div className="state-box">
                <div className="state-box-icon">🐾</div>
                <h3>No hay mascotas registradas</h3>
                <p>Pronto tendremos nuevas mascotas listas para encontrar un hogar.</p>
              </div>
            )}

            {/* PETS CARDS GRID */}
            {!cargando && !error && mascotasDestacadas.length > 0 && (
              <div className="mascotas-grid-4">
                {mascotasDestacadas.map((mascota) => (
                  <article className="pet-card" key={mascota.id}>
                    <div className="pet-card-image-wrapper">
                      {mascota.estado && mascota.estado !== "Adoptada" && (
                        <span className="status-badge disponible">Disponible</span>
                      )}
                      {mascota.imagen ? (
                        <img
                          src={mascota.imagen}
                          alt={mascota.nombre}
                          className="pet-card-img"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="pet-card-emoji-fallback"
                        style={{ display: mascota.imagen ? "none" : "flex" }}
                      >
                        {emojiPorTipo[mascota.tipo] || "🐾"}
                      </div>
                    </div>

                    <div className="pet-card-body">
                      <div className="pet-card-header">
                        <h3 className="pet-name">{mascota.nombre}</h3>
                        <span className="pet-type-icon">{emojiPorTipo[mascota.tipo] || "🐾"}</span>
                      </div>

                      <p className="pet-meta">
                        <span>{mascota.tipo}</span> · <span>{mascota.edad} {mascota.edad === 1 ? "año" : "años"}</span>
                      </p>

                      <Link to="/adopcion" className="btn-card-action">
                        Conocer más
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}

            <div className="view-more-container">
              <Link to="/adopcion" className="btn-view-all">
                Ver todas las mascotas 🐾
              </Link>
            </div>
          </div>
        </section>

        {/* ADOPCION BANNER */}
        <section className="adopcion-banner-section">
          <div className="container">
            <div className="adopcion-banner-card">
              <div className="adopcion-banner-text">
                <h2>Adopta y cambia una vida</h2>
                <p>
                  Adoptar es darle una segunda oportunidad a una mascota que necesita amor, cuidado y un hogar para siempre.
                </p>
              </div>
              <Link to="/adopcion" className="btn-banner-cta">
                Quiero adoptar
              </Link>
            </div>
          </div>
        </section>

        {/* AYUDA / CONTACTO PREVIEW */}
        <section className="ayuda-section">
          <div className="container text-center">
            <h2>¿Necesitas ayuda o tienes dudas?</h2>
            <p>
              Si tienes alguna pregunta sobre una mascota o sobre el proceso de adopción, contáctanos sin compromiso.
            </p>
            <Link to="/contacto" className="btn-contacto-lg">
              Contactar al equipo
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Principal;
