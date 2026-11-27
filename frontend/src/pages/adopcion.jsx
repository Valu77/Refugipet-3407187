import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { apiFetch } from "../services/api";
import "../adopcion.css";

const emojiPorTipo = {
  Perro: "🐶",
  Gato: "🐱",
};

function obtenerEstadoVisual(mascota) {
  if (mascota.estado === "Adoptada") {
    return { texto: "Adoptada", clase: "adoptado" };
  }
  if (mascota.en_proceso) {
    return { texto: "En proceso de adopción", clase: "proceso" };
  }
  return { texto: "Disponible", clase: "disponible" };
}

function Adopcion() {
  const navigate = useNavigate();
  const [mascotas, setMascotas] = useState([]);
  const [favoritosIds, setFavoritosIds] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mensajeFav, setMensajeFav] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [tamaño, setTamaño] = useState("Todos");
  const [edad, setEdad] = useState("Todas");
  const [ciudadFiltro, setCiudadFiltro] = useState("Todas");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos");

  const [mascotaDetalle, setMascotaDetalle] = useState(null);

  const estaAutenticado = Boolean(localStorage.getItem("token"));

  const cargarMascotas = useCallback(async () => {
    setCargando(true);
    setError("");

    try {
      const datos = await apiFetch("/mascotas/");
      setMascotas(datos);
    } catch (err) {
      setError(err.message || "No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  }, []);

  const cargarFavoritos = useCallback(async () => {
    if (!localStorage.getItem("token")) {
      setFavoritosIds([]);
      return;
    }
    try {
      const ids = await apiFetch("/favoritos/ids", {}, { auth: true });
      setFavoritosIds(ids);
    } catch {
      setFavoritosIds([]);
    }
  }, []);

  useEffect(() => {
    cargarMascotas();
    cargarFavoritos();
  }, [cargarMascotas, cargarFavoritos]);

  useEffect(() => {
    if (!mascotaDetalle) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMascotaDetalle(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mascotaDetalle]);

  const ciudadesDisponibles = useMemo(() => {
    const unicas = new Set();
    mascotas.forEach((m) => {
      if (m.ciudad_refugio) unicas.add(m.ciudad_refugio.trim());
    });
    return Array.from(unicas).sort((a, b) => a.localeCompare(b));
  }, [mascotas]);

  const toggleFavorito = async (mascotaId) => {
    if (!estaAutenticado) {
      navigate("/iniciosesion");
      return;
    }

    const yaEsFav = favoritosIds.includes(mascotaId);
    try {
      if (yaEsFav) {
        await apiFetch(`/favoritos/${mascotaId}`, { method: "DELETE" }, { auth: true });
        setFavoritosIds((prev) => prev.filter((id) => id !== mascotaId));
        setMensajeFav("Mascota quitada de favoritos.");
      } else {
        await apiFetch(`/favoritos/${mascotaId}`, { method: "POST" }, { auth: true });
        setFavoritosIds((prev) => [...prev, mascotaId]);
        setMensajeFav("Mascota guardada en tus favoritos.");
      }
      setTimeout(() => setMensajeFav(""), 2500);
    } catch (err) {
      setError(err.message || "No se pudo actualizar favoritos.");
    }
  };

  const mascotasFiltradas = mascotas.filter((mascota) => {
    const q = busqueda.trim().toLowerCase();
    const coincideBusqueda =
      !q ||
      (mascota.nombre || "").toLowerCase().includes(q) ||
      (mascota.descripcion || "").toLowerCase().includes(q) ||
      (mascota.nombre_refugio || "").toLowerCase().includes(q) ||
      (mascota.ciudad_refugio || "").toLowerCase().includes(q);

    const coincideTipo =
      tipo === "Todos" ||
      (mascota.tipo && mascota.tipo.toLowerCase() === tipo.toLowerCase());

    const tamanoMascota = (mascota.tamaño || mascota.tamano || "").toLowerCase();
    const tamanoFiltro = tamaño.toLowerCase();
    const coincideTamaño =
      tamaño === "Todos" ||
      tamanoMascota === tamanoFiltro ||
      (tamanoFiltro === "pequeño" && tamanoMascota === "pequeno");

    const coincideEdad =
      edad === "Todas" ||
      (edad === "Cachorro" && mascota.edad <= 1) ||
      (edad === "Joven" && mascota.edad >= 2 && mascota.edad <= 3) ||
      (edad === "Adulto" && mascota.edad >= 4);

    const coincideCiudad =
      ciudadFiltro === "Todas" ||
      (mascota.ciudad_refugio || "").toLowerCase() === ciudadFiltro.toLowerCase();

    const coincideEstado =
      estadoFiltro === "Todos" ||
      (estadoFiltro === "Disponible" &&
        mascota.estado === "Disponible" &&
        !mascota.en_proceso) ||
      (estadoFiltro === "EnProceso" &&
        mascota.estado === "Disponible" &&
        mascota.en_proceso) ||
      (estadoFiltro === "Adoptada" && mascota.estado === "Adoptada");

    return (
      coincideBusqueda &&
      coincideTipo &&
      coincideTamaño &&
      coincideEdad &&
      coincideCiudad &&
      coincideEstado
    );
  });

  const limpiarFiltros = () => {
    setBusqueda("");
    setTipo("Todos");
    setTamaño("Todos");
    setEdad("Todas");
    setCiudadFiltro("Todas");
    setEstadoFiltro("Todos");
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
              Explora perros y gatos en adopción responsable, guarda tus favoritos y envía tu solicitud directamente al refugio.
            </p>
          </div>
        </section>

        <div className="container catalog-container">
          {/* SEARCH & FILTERS SECTION */}
          <section className="filtros-card" aria-label="Filtros de búsqueda">
            <div className="search-bar-wrapper">
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                type="text"
                aria-label="Buscar mascota"
                placeholder="Buscar perro o gato por nombre, descripción, refugio o ciudad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="search-input"
              />
              {busqueda && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setBusqueda("")}
                  aria-label="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filters-select-grid">
              <div className="select-group">
                <label htmlFor="tipo-filter">Especie</label>
                <select
                  id="tipo-filter"
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                >
                  <option value="Todos">Todos (Perros y Gatos)</option>
                  <option value="Perro">Perro</option>
                  <option value="Gato">Gato</option>
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

              <div className="select-group">
                <label htmlFor="ciudad-filter">Ciudad</label>
                <select
                  id="ciudad-filter"
                  value={ciudadFiltro}
                  onChange={(e) => setCiudadFiltro(e.target.value)}
                >
                  <option value="Todas">Todas las ciudades</option>
                  {ciudadesDisponibles.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="select-group">
                <label htmlFor="estado-filter">Disponibilidad</label>
                <select
                  id="estado-filter"
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value)}
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="Disponible">Disponible</option>
                  <option value="EnProceso">En proceso de adopción</option>
                  <option value="Adoptada">Adoptada</option>
                </select>
              </div>

              <button
                type="button"
                className="btn-limpiar-filtros"
                onClick={limpiarFiltros}
              >
                Limpiar
              </button>
            </div>
          </section>

          {mensajeFav && (
            <div className="perfil-success-alert" role="status" style={{ marginBottom: "1.25rem" }}>
              ❤️ {mensajeFav}
            </div>
          )}

          {/* RESULTS METRICS */}
          <div className="results-counter-bar">
            <h2>Perros y gatos en adopción</h2>
            <span className="counter-chip">
              {mascotasFiltradas.length}{" "}
              {mascotasFiltradas.length === 1
                ? "mascota encontrada"
                : "mascotas encontradas"}
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
              <p>
                Intenta ajustar los criterios de búsqueda o limpia los filtros aplicados para ver más opciones.
              </p>
              <button onClick={limpiarFiltros} className="btn-retry">
                Ver todas las mascotas
              </button>
            </div>
          )}

          {/* PET CATALOG GRID */}
          {!cargando && !error && mascotasFiltradas.length > 0 && (
            <div className="mascotas-grid">
              {mascotasFiltradas.map((mascota) => {
                const estadoVis = obtenerEstadoVisual(mascota);
                const esFav = favoritosIds.includes(mascota.id);
                return (
                  <article className="pet-catalog-card" key={mascota.id}>
                    <div
                      className="pet-card-image-box"
                      style={{ cursor: "pointer" }}
                      onClick={() => setMascotaDetalle(mascota)}
                    >
                      <span className={`badge-status ${estadoVis.clase}`}>
                        {estadoVis.texto}
                      </span>

                      <button
                        type="button"
                        className={`btn-fav-float ${esFav ? "active" : ""}`}
                        aria-label={
                          esFav
                            ? `Quitar a ${mascota.nombre} de favoritos`
                            : `Guardar a ${mascota.nombre} en favoritos`
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorito(mascota.id);
                        }}
                      >
                        {esFav ? "❤️" : "🤍"}
                      </button>

                      {mascota.imagen ? (
                        <img
                          src={mascota.imagen}
                          alt={mascota.nombre}
                          className="pet-image"
                          loading="lazy"
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
                        <span className="pet-emoji-tag" aria-hidden="true">
                          {emojiPorTipo[mascota.tipo] || "🐾"}
                        </span>
                      </div>

                      <div className="pet-tags-list">
                        <span className="tag-pill">{mascota.tipo}</span>
                        <span className="tag-pill">
                          {mascota.edad} {mascota.edad === 1 ? "año" : "años"}
                        </span>
                        {mascota.tamaño || mascota.tamano ? (
                          <span className="tag-pill">
                            {mascota.tamaño || mascota.tamano}
                          </span>
                        ) : null}
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
                          onClick={() => setMascotaDetalle(mascota)}
                        >
                          Ver detalles
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

      {/* MODAL DE DETALLE DE MASCOTA ANTES DE ADOPTAR */}
      {mascotaDetalle && (
        <div
          className="pet-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={`Detalles de ${mascotaDetalle.nombre}`}
          onClick={() => setMascotaDetalle(null)}
        >
          <div className="pet-modal-card" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="pet-modal-close"
              onClick={() => setMascotaDetalle(null)}
              aria-label="Cerrar detalle"
            >
              ✕
            </button>

            <div className="pet-modal-grid">
              <div className="pet-modal-media">
                <span
                  className={`badge-status ${
                    obtenerEstadoVisual(mascotaDetalle).clase
                  }`}
                >
                  {obtenerEstadoVisual(mascotaDetalle).texto}
                </span>

                {mascotaDetalle.imagen ? (
                  <img
                    src={mascotaDetalle.imagen}
                    alt={mascotaDetalle.nombre}
                  />
                ) : (
                  <div className="pet-emoji-fallback">
                    {emojiPorTipo[mascotaDetalle.tipo] || "🐾"}
                  </div>
                )}
              </div>

              <div className="pet-modal-info">
                <div>
                  <span
                    style={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "var(--primary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    Ficha de mascota
                  </span>
                  <h2>{mascotaDetalle.nombre}</h2>
                </div>

                <div className="pet-tags-list" style={{ marginBottom: 0 }}>
                  <span className="tag-pill">
                    {emojiPorTipo[mascotaDetalle.tipo] || "🐾"} {mascotaDetalle.tipo}
                  </span>
                  <span className="tag-pill">
                    {mascotaDetalle.edad}{" "}
                    {mascotaDetalle.edad === 1 ? "año" : "años"}
                  </span>
                  <span className="tag-pill">
                    Tamaño {mascotaDetalle.tamaño || mascotaDetalle.tamano}
                  </span>
                </div>

                <div className="pet-modal-shelter-box">
                  <strong>🏠 Refugio responsable:</strong>{" "}
                  {mascotaDetalle.nombre_refugio
                    ? `${mascotaDetalle.nombre_refugio}${
                        mascotaDetalle.ciudad_refugio
                          ? ` — ${mascotaDetalle.ciudad_refugio}`
                          : ""
                      }`
                    : "RefugiPet (Plataforma General)"}
                </div>

                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "var(--text-main)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {mascotaDetalle.descripcion ||
                    "Esta mascota está buscando un hogar amoroso y responsable."}
                </p>

                {mascotaDetalle.en_proceso && mascotaDetalle.estado !== "Adoptada" && (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      color: "#92400e",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "8px",
                      margin: 0,
                    }}
                  >
                    ⏳ Actualmente tiene solicitudes en revisión, pero aún puedes postularte si estás interesado.
                  </p>
                )}

                <div
                  style={{
                    marginTop: "auto",
                    display: "flex",
                    gap: "0.65rem",
                    paddingTop: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    className="btn-details-action"
                    onClick={() => toggleFavorito(mascotaDetalle.id)}
                  >
                    {favoritosIds.includes(mascotaDetalle.id)
                      ? "❤️ En favoritos"
                      : "🤍 Favorito"}
                  </button>

                  {mascotaDetalle.estado === "Adoptada" ? (
                    <button
                      className="btn-adopt-disabled"
                      style={{ flex: 1.4 }}
                      disabled
                    >
                      Ya fue adoptada
                    </button>
                  ) : (
                    <Link
                      to={`/solicitar-adopcion/${mascotaDetalle.id}`}
                      className="btn-adopt-action"
                      style={{ flex: 1.4 }}
                    >
                      Solicitar adopción
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Adopcion;
