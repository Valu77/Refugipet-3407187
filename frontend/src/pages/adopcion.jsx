import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../adopcion.css";

import logo from "../assets/logo.png";

const mascotas = [
  {
    id: 1,
    nombre: "Max",
    tipo: "Perro",
    edad: 2,
    tamaño: "Mediano",
    imagen: "",
    emoji: "🐶",
  },
  {
    id: 2,
    nombre: "Rocky",
    tipo: "Perro",
    edad: 3,
    tamaño: "Grande",
    imagen: "",
    emoji: "🐕",
  },
  {
    id: 3,
    nombre: "Luna",
    tipo: "Gata",
    edad: 1,
    tamaño: "Pequeño",
    imagen: "",
    emoji: "🐱",
  },
  {
    id: 4,
    nombre: "Bruno",
    tipo: "Perro",
    edad: 4,
    tamaño: "Mediano",
    imagen: "",
    emoji: "🐕",
  },
  {
    id: 5,
    nombre: "Mia",
    tipo: "Gata",
    edad: 2,
    tamaño: "Pequeño",
    imagen: "",
    emoji: "🐈",
  },
  {
    id: 6,
    nombre: "Toby",
    tipo: "Perro",
    edad: 1,
    tamaño: "Pequeño",
    imagen: "",
    emoji: "🐕‍🦺",
  },
];

function Adopcion() {
  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [tamaño, setTamaño] = useState("Todos");
  const [edad, setEdad] = useState("Todas");

  const mascotasFiltradas = mascotas.filter((mascota) => {
    const coincideBusqueda = mascota.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    const coincideTipo =
      tipo === "Todos" ||
      mascota.tipo.toLowerCase().includes(tipo.toLowerCase());

    const coincideTamaño =
      tamaño === "Todos" || mascota.tamaño === tamaño;

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

      {/* ================= NAVBAR ================= */}

      <header className="adopcion-navbar">

        {/* LOGO */}

        <Link to="/principal" className="adopcion-logo">

          <img
            src={logo}
            alt="Logo RefugioPet"
            className="adopcion-logo-img"
          />

          <div className="logo-texto">

            <strong>
              RefugioPet
            </strong>

            <span>
              Juntos construimos un hogar para cada mascota
            </span>

          </div>

        </Link>


        {/* MENÚ */}

        <nav className="adopcion-menu">

          <Link to="/principal">
            Inicio
          </Link>

          <a href="#contacto">
            Contacto
          </a>

          <Link to="/">
            Cerrar sesión
          </Link>

        </nav>

      </header>


      {/* ================= CONTENIDO ================= */}

      <main className="adopcion-contenido">

        {/* ================= INTRO ================= */}

        <section className="adopcion-intro">

          <span className="adopcion-etiqueta">
            🐾 ADOPTA CON AMOR
          </span>

          <h1>
            Encuentra a tu nuevo
            <span> mejor amigo</span>
          </h1>

          <p>
            Explora nuestras mascotas disponibles para adopción
            y encuentra el compañero ideal para formar parte de
            tu familia.
          </p>

        </section>


        {/* ================= BUSCADOR ================= */}

        <section className="filtros">

          <div className="buscador">

            <span className="icono-busqueda">
              🔎
            </span>

            <input
              type="text"
              placeholder="Buscar mascota por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

          </div>


          <div className="filtros-select">

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >

              <option value="Todos">
                Todos los tipos
              </option>

              <option value="Perro">
                Perros
              </option>

              <option value="Gata">
                Gatos
              </option>

            </select>


            <select
              value={tamaño}
              onChange={(e) => setTamaño(e.target.value)}
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
              onChange={(e) => setEdad(e.target.value)}
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
              Limpiar
            </button>

          </div>

        </section>


        {/* ================= RESULTADOS ================= */}

        <section className="resultados">

          <div className="resultados-header">

            <div>

              <h2>
                Mascotas disponibles
              </h2>

              <p>
                {mascotasFiltradas.length} mascotas encontradas
              </p>

            </div>

          </div>


          {/* ================= TARJETAS ================= */}

          {mascotasFiltradas.length > 0 ? (

            <div className="mascotas-grid">

              {mascotasFiltradas.map((mascota) => (

                <article
                  className="mascota-card"
                  key={mascota.id}
                >

                  {/* IMAGEN */}

                  <div className="mascota-imagen">

                    {mascota.imagen ? (

                      <img
                        src={mascota.imagen}
                        alt={`Foto de ${mascota.nombre}`}
                      />

                    ) : (

                      <span className="mascota-emoji">
                        {mascota.emoji}
                      </span>

                    )}

                    <div className="disponible">
                      Disponible
                    </div>

                  </div>


                  {/* INFORMACION */}

                  <div className="mascota-info">

                    <div className="nombre-mascota">

                      <h3>
                        {mascota.nombre}
                      </h3>

                      <span>
                        ❤️
                      </span>

                    </div>


                    <div className="datos-mascota">

                      <span>
                        🐾 {mascota.tipo}
                      </span>

                      <span>
                        🎂 {mascota.edad}{" "}
                        {mascota.edad === 1
                          ? "año"
                          : "años"}
                      </span>

                      <span>
                        📏 {mascota.tamaño}
                      </span>

                    </div>


                    <Link
                      to={`/adopcion/${mascota.id}`}
                      className="informacion-btn"
                    >
                      Ver información
                    </Link>

                  </div>

                </article>

              ))}

            </div>

          ) : (

            <div className="sin-resultados">

              <div>
                🐶
              </div>

              <h3>
                No encontramos mascotas
              </h3>

              <p>
                Intenta cambiar los filtros de búsqueda.
              </p>

              <button
                onClick={limpiarFiltros}
              >
                Ver todas las mascotas
              </button>

            </div>

          )}

        </section>


        {/* ================= INFORMACION ================= */}

        <section className="adopcion-info">

          <div className="info-icon">
            ❤️
          </div>

          <div>

            <h2>
              ¿Por qué adoptar?
            </h2>

            <p>
              Adoptar le brinda una segunda oportunidad a una
              mascota y permite que encuentre un hogar donde
              pueda recibir amor, cuidado y protección.
            </p>

          </div>

        </section>


        {/* ================= CONTACTO ================= */}

        <section
          className="adopcion-contacto"
          id="contacto"
        >

          <h2>
            ¿Necesitas ayuda?
          </h2>

          <p>
            Si tienes alguna pregunta sobre el proceso de
            adopción, estamos aquí para ayudarte.
          </p>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="adopcion-footer">

        <div className="footer-logo">

          <img
            src={logo}
            alt="Logo RefugioPet"
          />

          <strong>
            RefugioPet
          </strong>

        </div>

        <p>
          Juntos construimos un hogar para cada mascota.
        </p>

        <span>
          ©️ 2026 RefugioPet · Proyecto SENA ADSO
        </span>

      </footer>

    </div>
  );
}

export default Adopcion;