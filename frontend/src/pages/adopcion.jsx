import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../adopcion.css";
import logo from "../assets/logo.png";

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
      mascota.tipo
        .toLowerCase()
        .includes(tipo.toLowerCase());

    const coincideTamaño =
      tamaño === "Todos" ||
      mascota.tamaño === tamaño;

    const coincideEdad =
      edad === "Todas" ||
      (edad === "Cachorro" && mascota.edad <= 1) ||
      (edad === "Joven" &&
        mascota.edad >= 2 &&
        mascota.edad <= 3) ||
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
    <div className="adopcion-page">

      {/* NAVBAR */}

      <header className="adopcion-navbar">

        <Link
          to="/principal"
          className="adopcion-logo"
        >

          <img
            src={logo}
            alt="Logo RefugiPet"
            className="adopcion-logo-img"
          />

          <div className="logo-texto">

            <strong>
              RefugiPet
            </strong>

            <span>
              Juntos construimos un hogar para cada mascota
            </span>

          </div>

        </Link>

        <nav className="adopcion-menu">

          <Link to="/principal">
            Inicio
          </Link>

          <Link to="/adopcion">
            Mascotas
          </Link>

          <a href="#contacto">
            Contacto
          </a>

          <Link to="/">
            Cerrar sesion
          </Link>

        </nav>

      </header>


      {/* CONTENIDO */}

      <main className="adopcion-contenido">

        {/* INTRODUCCIÓN */}

        <section className="adopcion-intro">

          <span className="adopcion-etiqueta">
            ADOPTA CON AMOR
          </span>

          <h1>
            Encuentra a tu nuevo
            <span> mejor amigo</span> 🐾
          </h1>

          <p>
            Conoce nuestras mascotas disponibles para
            adopción y encuentra el compañero ideal para
            tu hogar.
          </p>

        </section>


        {/* FILTROS */}

        <section className="filtros">

          <div className="buscador">

            <span className="icono-busqueda">
              🔍
            </span>

            <input
              type="text"
              placeholder="Buscar mascota por nombre..."
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
            />

          </div>


          <div className="filtros-select">

            <select
              value={tipo}
              onChange={(e) =>
                setTipo(e.target.value)
              }
            >

              <option value="Todos">
                Todos los tipos
              </option>

              <option value="Perro">
                Perros
              </option>

              <option value="Gato">
                Gatos
              </option>

              <option value="Ave">
                Aves
              </option>

              <option value="Conejo">
                Conejos
              </option>

            </select>


            <select
              value={tamaño}
              onChange={(e) =>
                setTamaño(e.target.value)
              }
            >

              <option value="Todos">
                Todos los tamaños
              </option>

              <option value="Pequeño">
                Pequeño
              </option>

              <option value="Mediano">
                Mediano
              </option>

              <option value="Grande">
                Grande
              </option>

            </select>


            <select
              value={edad}
              onChange={(e) =>
                setEdad(e.target.value)
              }
            >

              <option value="Todas">
                Todas las edades
              </option>

              <option value="Cachorro">
                Cachorro
              </option>

              <option value="Joven">
                Joven
              </option>

              <option value="Adulto">
                Adulto
              </option>

            </select>


            <button
              className="limpiar-btn"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>

          </div>

        </section>


        {/* RESULTADOS */}

        <div className="resultados-header">

          <div>

            <h2>
              Mascotas disponibles
            </h2>

            <p>
              {mascotasFiltradas.length} mascota
              {mascotasFiltradas.length !== 1
                ? "s"
                : ""}{" "}
              encontrada
              {mascotasFiltradas.length !== 1
                ? "s"
                : ""}
            </p>

          </div>

        </div>


        {/* CARGANDO */}

        {cargando && (

          <div className="sin-resultados">

            <div>
              🐾
            </div>

            <h3>
              Cargando mascotas...
            </h3>

          </div>

        )}


        {/* ERROR */}

        {!cargando && error && (

          <div className="sin-resultados">

            <div>
              ⚠️
            </div>

            <h3>
              No se pudieron cargar las mascotas
            </h3>

            <p>
              {error}
            </p>

            <button onClick={cargarMascotas}>
              Intentar nuevamente
            </button>

          </div>

        )}


        {/* SIN RESULTADOS */}

        {!cargando &&
          !error &&
          mascotasFiltradas.length === 0 && (

            <div className="sin-resultados">

              <div>
                🐾
              </div>

              <h3>
                No encontramos mascotas
              </h3>

              <p>
                Intenta cambiar los filtros de búsqueda.
              </p>

              <button onClick={limpiarFiltros}>
                Limpiar filtros
              </button>

            </div>

          )}


        {/* MASCOTAS */}

        {!cargando &&
          !error &&
          mascotasFiltradas.length > 0 && (

            <div className="mascotas-grid">

              {mascotasFiltradas.map((mascota) => (

                <article
                  className="mascota-card"
                  key={mascota.id}
                >

                  {/* IMAGEN */}

                  <div className="mascota-imagen">

                    {mascota.estado !== "Adoptada" && (

                      <span className="disponible">
                        Disponible
                      </span>

                    )}

                    {mascota.imagen ? (

                      <img
                        src={mascota.imagen}
                        alt={mascota.nombre}
                      />

                    ) : (

                      <div className="mascota-emoji">
                        {emojiPorTipo[mascota.tipo] || "🐾"}
                      </div>

                    )}

                  </div>


                  {/* INFORMACIÓN */}

                  <div className="mascota-info">

                    <div className="nombre-mascota">

                      <h3>
                        {mascota.nombre}
                      </h3>

                      <span>
                        {emojiPorTipo[mascota.tipo] || "🐾"}
                      </span>

                    </div>


                    <div className="datos-mascota">

                      <span>
                        Tipo: {mascota.tipo}
                      </span>

                      <span>
                        Edad: {mascota.edad}{" "}
                        {mascota.edad === 1
                          ? "año"
                          : "años"}
                      </span>

                      <span>
                        Tamaño: {mascota.tamaño}
                      </span>

                      {mascota.raza && (
                        <span>
                          Raza: {mascota.raza}
                        </span>
                      )}

                    </div>


                    {/* SOLICITAR ADOPCIÓN */}

                    {mascota.estado === "Adoptada" ? (

                      <button
                        className="informacion-btn"
                        disabled
                      >
                        Ya adoptada
                      </button>

                    ) : (

                      <Link
                        to={`/solicitar-adopcion/${mascota.id}`}
                        className="informacion-btn"
                      >
                        Solicitar adopcion
                      </Link>

                    )}

                  </div>

                </article>

              ))}

            </div>

          )}


        {/* INFORMACIÓN */}

        <section
          className="adopcion-info"
          id="contacto"
        >

          <div className="info-icon">
            🐾
          </div>

          <div>

            <h2>
              ¿Por qué adoptar?
            </h2>

            <p>
              Adoptar una mascota es darle una segunda
              oportunidad y brindarle un hogar lleno de
              amor. En RefugiPet te ayudamos a encontrar
              el compañero ideal para ti.
            </p>

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="adopcion-footer">

        <div className="footer-logo">

          <img
            src={logo}
            alt="Logo RefugiPet"
          />

          <strong>
            RefugiPet
          </strong>

        </div>

        <p>
          © 2026 RefugiPet - Todos los derechos reservados
        </p>

        <span>
          Juntos construimos un hogar para cada mascota
        </span>

      </footer>

    </div>
  );
}

export default Adopcion;