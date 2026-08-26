import { useState } from "react";
import { Link } from "react-router-dom";
import "../contacto.css";

import logo from "../assets/logo.png";

function Contacto() {
  const [enviado, setEnviado] = useState(false);

  const enviarFormulario = (e) => {
    e.preventDefault();

    setEnviado(true);

    // Limpia el formulario
    e.target.reset();

    // Oculta el mensaje después de 4 segundos
    setTimeout(() => {
      setEnviado(false);
    }, 4000);
  };

  return (
    <div className="contacto-page">

      {/* ================= HEADER ================= */}

      <header className="contacto-header">
        <div className="contacto-container">

          {/* LOGO */}

          <div className="contacto-marca">
            <img
              src={logo}
              alt="Logo RefugioPet"
              className="contacto-logo"
            />

            <div>
              <h1>RefugiPet</h1>
              <p>Juntos construimos un hogar para cada mascota</p>
            </div>
          </div>

          {/* MENU */}

          <nav className="contacto-nav">
            <Link to="/principal">Inicio</Link>

            <Link to="/adopcion">
              Mascotas
            </Link>

            <Link to="/adopcion">
              Adopción
            </Link>

            <Link to="/contacto">
              Contacto
            </Link>

            <Link to="/">
              Cerrar sesión
            </Link>
          </nav>

        </div>
      </header>


      {/* ================= CONTENIDO ================= */}

      <main className="contacto-main">

        <section className="contacto-seccion">

          <h2>Contacto</h2>

          <p className="contacto-descripcion">
            Escríbenos y nos pondremos en contacto contigo.
          </p>


          {/* FORMULARIO */}

          <form
            className="contacto-formulario"
            onSubmit={enviarFormulario}
          >

            <div className="campo">
              <label>Nombre</label>

              <input
                type="text"
                placeholder="Escribe tu nombre"
                required
              />
            </div>


            <div className="campo">
              <label>Correo electrónico</label>

              <input
                type="email"
                placeholder="ejemplo@correo.com"
                required
              />
            </div>


            <div className="campo">
              <label>Asunto</label>

              <input
                type="text"
                placeholder="¿En qué podemos ayudarte?"
                required
              />
            </div>


            <div className="campo">
              <label>Mensaje</label>

              <textarea
                placeholder="Escribe tu mensaje..."
                required
              ></textarea>
            </div>


            <button
              type="submit"
              className="boton-enviar"
            >
              Enviar mensaje
            </button>


            {/* MENSAJE DE CONFIRMACION */}

            {enviado && (
              <div className="mensaje-enviado">
                ✅ ¡Tu mensaje ha sido enviado correctamente!
              </div>
            )}

          </form>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="contacto-footer">
        <p>
          © 2026 RefugiPet - Todos los derechos reservados
        </p>
      </footer>

    </div>
  );
}

export default Contacto;