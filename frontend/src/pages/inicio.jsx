import "../ini.css";
import { Link } from "react-router-dom";
import { useState } from "react";

import logo from "../assets/logo.png";

import carru1 from "../assets/carrusel/carru1.png";
import carru2 from "../assets/carrusel/carru2 (2).png";
import carru3 from "../assets/carrusel/carru3 (2).png";

function Inicio() {

  // ================= CONTACTO =================

  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    mensaje: ""
  });

  const [mensajeEnviado, setMensajeEnviado] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value
    });

    setMensajeEnviado(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Obtener mensajes que ya existen
    const mensajesGuardados = JSON.parse(
      localStorage.getItem("mensajesContacto") || "[]"
    );

    // Crear nuevo mensaje
    const nuevoMensaje = {
      id: Date.now(),
      nombre: formulario.nombre,
      correo: formulario.correo,
      mensaje: formulario.mensaje,
      fecha: new Date().toLocaleString()
    };

    // Agregar el nuevo mensaje
    mensajesGuardados.push(nuevoMensaje);

    // Guardarlo en localStorage
    localStorage.setItem(
      "mensajesContacto",
      JSON.stringify(mensajesGuardados)
    );

    // Mostrar confirmación
    setMensajeEnviado(true);

    // Limpiar formulario
    setFormulario({
      nombre: "",
      correo: "",
      mensaje: ""
    });
  };

  return (
    <>
      {/* ================= HEADER ================= */}

      <header className="header-inicio">
        <div className="container-header">

          {/* LOGO + NOMBRE */}
          <div className="marca">

            <img
              src={logo}
              alt="Logo Refugipet"
              className="logo"
            />

            <div className="texto-marca">
              <h1>RefugiPet</h1>

              <p>
                Juntos construimos un hogar para cada mascota
              </p>
            </div>

          </div>

          {/* MENÚ */}
          <nav>
            <ul>

              <li>
                <Link to="/iniciosesion">
                  Adopción
                </Link>
              </li>

              <li>
                <Link to="/iniciosesion">
                  Iniciar Sesión
                </Link>
              </li>

              <li>
                <Link to="/registrar">
                  Registrarse
                </Link>
              </li>

            </ul>
          </nav>

        </div>
      </header>


      {/* ================= CARRUSEL ================= */}

      <section className="slider">

        <div className="slides">

          <div className="slide">
            <img
              src={carru1}
              alt="Mascotas en adopción"
            />
          </div>

          <div className="slide">
            <img
              src={carru2}
              alt="Mascotas buscando hogar"
            />
          </div>

          <div className="slide">
            <img
              src={carru3}
              alt="Adopción responsable"
            />
          </div>

        </div>

      </section>


      {/* ================= NOSOTROS ================= */}

      <section className="nosotros">

        <h2>¿Quiénes Somos?</h2>

        <p>
          RefugioPet es una plataforma dedicada a conectar mascotas
          que necesitan un hogar con familias responsables. Nuestro
          objetivo es promover la adopción responsable y brindar una
          segunda oportunidad a miles de animales.
        </p>

      </section>


      {/* ================= BENEFICIOS ================= */}

      <section className="beneficios">

        <h2>¿Por qué adoptar?</h2>

        <div className="contenedor-beneficios">

          <div className="card">

            <h3>🐶 Salvas una vida</h3>

            <p>
              Miles de mascotas esperan una familia que les brinde
              amor y protección.
            </p>

          </div>


          <div className="card">

            <h3>❤️ Amor incondicional</h3>

            <p>
              Una mascota adoptada se convierte en un amigo fiel
              para toda la vida.
            </p>

          </div>


          <div className="card">

            <h3>🏠 Hogar responsable</h3>

            <p>
              Ayudas a reducir el abandono y mejorar la calidad
              de vida animal.
            </p>

          </div>

        </div>

      </section>


      {/* ================= CONTACTO ================= */}

      <section className="contacto">

        <h2>Contáctanos</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="nombre"
            placeholder="Nombre completo"
            value={formulario.nombre}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="correo"
            placeholder="Correo electrónico"
            value={formulario.correo}
            onChange={handleChange}
            required
          />

          <textarea
            name="mensaje"
            placeholder="Escribe tu mensaje"
            value={formulario.mensaje}
            onChange={handleChange}
            required
          ></textarea>

          <button type="submit">
            Enviar Mensaje
          </button>

        </form>

        {mensajeEnviado && (
          <p
            style={{
              color: "#20a35a",
              fontWeight: "bold",
              marginTop: "15px",
              textAlign: "center"
            }}
          >
            ¡Mensaje enviado correctamente!
          </p>
        )}

      </section>


      {/* ================= FOOTER ================= */}

      <footer>

        <p>
          © 2026 RefugiPet - Todos los derechos reservados
        </p>

      </footer>

    </>
  );
}

export default Inicio;