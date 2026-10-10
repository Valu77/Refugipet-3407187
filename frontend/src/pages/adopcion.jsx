import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../adopcion.css";

const API_URL = "http://127.0.0.1:8000/api";

const emojiPorTipo = {
  Perro: "🐶",
  Gato: "🐱",
  Ave: "🐦",
  Conejo: "🐰",
};

function Adopcion() {
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [tamaño, setTamaño] = useState("Todos");
  const [edad, setEdad] = useState("Todas");

  const cargarMascotas = async () => {
    setCargando(true);
    setError("");

    try {
      const respuesta = await fetch(`${API_URL}/mascotas/`);

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las mascotas");
      }

      const datos = await respuesta.json();
      setMascotas(datos);
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarMascotas();
  }, []);

  const mascotasFiltradas = mascotas.filter((mascota) => {
    const coincideBusqueda = mascota.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideTipo =
      tipo === "Todos" ||
      (mascota.tipo && mascota.tipo.toLowerCase().includes(tipo.toLowerCase()));

    const coincideTamaño =
      tamaño === "Todos" ||
      mascota.tamaño === tamaño ||
      mascota.tamano === tamaño;

    const coincideEdad =
      edad === "Todas" ||
      (edad === "Cachorro" && mascota.edad <= 1) ||
      (edad === "Joven" && mascota.edad >= 2 && mascota.edad <= 3) ||
      (edad === "Adulto" && mascota.edad >= 4);

    return (
      coincideBusqueda &&
      coincideTipo &&
      coincideTamaño &&
      coincideEdad
    );
  });

  const limpiarFiltros = () => {
    setBusqueda("");
    setTipo("Todos");
    setTamaño("Todos");
    setEdad("Todas");
  };

  return (
    <div className="adopcion-page-wrapper">
      <Navbar variant="app" />

      <main className="adopcion-main-content">
        {/* HEADER HERO */}
        <section className="adopcion-hero-banner">
          <div className="container">
            <span className="hero-pill-badge">🐾 CATÁLOGO DE ADOPCIÓN</span>
            <h1>
              Encuentra a tu <span>compañero ideal</span>
            </h1>
            <p>
              Explora nuestras mascotas disponibles y brinda una segunda oportunidad a un amigo que busca un hogar lleno de amor y cuidado.
            </p>
          </div>
        </section>

        <div className="container catalog-container">
          {/* SEARCH & FILTERS SECTION */}
          <section className="filtros-card">
            <div className="search-bar-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar mascota por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="search-input"
              />
              {busqueda && (
                <button
                  className="clear-search-btn"
                  onClick={() => setBusqueda("")}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filters-select-grid">
              <div className="select-group">
                <label htmlFor="tipo-filter">Especie / Tipo</label>
                <select
                  id="tipo-filter"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option value="Todos">Todos los tipos</option>
                  <option value="Perro">Perros</option>
                  <option value="Gato">Gatos</option>
                  <option value="Ave">Aves</option>
                  <option value="Conejo">Conejos</option>
                </select>
              </div>

              <div className="select-group">
                <label htmlFor="tamano-filter">Tamaño</label>
                <select
                  id="tamano-filter"
                  value={tamaño}
                  onChange={(e) => setTamaño(e.target.value)}
                >
                  <option value="Todos">Todos los tamaños</option>
                  <option value="Pequeño">Pequeño</option>
                  <option value="Mediano">Mediano</option>
                  <option value="Grande">Grande</option>
                </select>
              </div>

              <div className="select-group">
                <label htmlFor="edad-filter">Etapa de vida</label>
                <select
                  id="edad-filter"
                  value={edad}
                  onChange={(e) => setEdad(e.target.value)}
                >
                  <option value="Todas">Todas las edades</option>
                  <option value="Cachorro">Cachorro (&le; 1 año)</option>
                  <option value="Joven">Joven (2-3 años)</option>
                  <option value="Adulto">Adulto (&ge; 4 años)</option>
                </select>
              </div>

              <button
                className="btn-limpiar-filtros"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </button>
            </div>
          </section>

          {/* RESULTS METRICS */}
          <div className="results-counter-bar">
            <h2>Mascotas disponibles</h2>
            <span className="counter-chip">
              {mascotasFiltradas.length} {mascotasFiltradas.length === 1 ? "mascota encontrada" : "mascotas encontradas"}
            </span>
          </div>

          {/* SKELETON LOADING STATE */}
          {cargando && (
            <div className="mascotas-grid">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div key={idx} className="skeleton-card">
                  <div className="skeleton skeleton-image"></div>
                  <div className="skeleton skeleton-text medium"></div>
                  <div className="skeleton skeleton-text short"></div>
                  <div className="skeleton skeleton-text"></div>
                </div>
              ))}
            </div>
          )}

          {/* SERVER ERROR STATE WITH RETRY */}
          {!cargando && error && (
            <div className="state-box">
              <div className="state-box-icon">⚠️</div>
              <h3>No se pudieron cargar las mascotas</h3>
              <p>{error}</p>
              <button onClick={cargarMascotas} className="btn-retry">
                Intentar nuevamente
              </button>
            </div>
          )}

          {/* EMPTY FILTER RESULTS STATE */}
          {!cargando && !error && mascotasFiltradas.length === 0 && (
            <div className="state-box">
              <div className="state-box-icon">🐶</div>
              <h3>No encontramos mascotas que coincidan</h3>
              <p>Intenta ajustar los criterios de búsqueda o limpia los filtros aplicados.</p>
              <button onClick={limpiarFiltros} className="btn-retry">
                Limpiar filtros
              </button>
            </div>
          )}

          {/* PET CATALOG GRID */}
          {!cargando && !error && mascotasFiltradas.length > 0 && (
            <div className="mascotas-grid">
              {mascotasFiltradas.map((mascota) => (
                <article className="pet-catalog-card" key={mascota.id}>
                  <div className="pet-card-image-box">
                    {mascota.estado !== "Adoptada" ? (
                      <span className="badge-status disponible">Disponible</span>
                    ) : (
                      <span className="badge-status adoptado">Adoptada</span>
                    )}

                    {mascota.imagen ? (
                      <img
                        src={mascota.imagen}
                        alt={mascota.nombre}
                        className="pet-image"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}

                    <div
                      className="pet-emoji-fallback"
                      style={{ display: mascota.imagen ? "none" : "flex" }}
                    >
                      {emojiPorTipo[mascota.tipo] || "🐾"}
                    </div>
                  </div>

                  <div className="pet-card-content">
                    <div className="pet-header">
                      <h3>{mascota.nombre}</h3>
                      <span className="pet-emoji-tag">{emojiPorTipo[mascota.tipo] || "🐾"}</span>
                    </div>

                    <div className="pet-tags-list">
                      <span className="tag-pill">{mascota.tipo}</span>
                      <span className="tag-pill">
                        {mascota.edad} {mascota.edad === 1 ? "año" : "años"}
                      </span>
                      {mascota.tamaño || mascota.tamano ? (
                        <span className="tag-pill">{mascota.tamaño || mascota.tamano}</span>
                      ) : null}
                    </div>

                    {mascota.descripcion && (
                      <p className="pet-description">{mascota.descripcion}</p>
                    )}

                    {mascota.estado === "Adoptada" ? (
                      <button className="btn-adopt-disabled" disabled>
                        Ya adoptada
                      </button>
                    ) : (
                      <Link
                        to={`/solicitar-adopcion/${mascota.id}`}
                        className="btn-adopt-action"
                      >
                        Solicitar adopción
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Adopcion;
