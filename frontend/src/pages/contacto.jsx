import { useState } from "react";
import { Link } from "react-router-dom";
import "../contacto.css";

import logo from "../assets/logo.png";

function Contacto() {

  // ================= FORMULARIO DE CONTACTO =================

  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    asunto: "",
    mensaje: ""
  });

  const [mensajeEnviado, setMensajeEnviado] = useState(false);


  // ================= MANEJAR CAMBIOS =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value
    });

    setMensajeEnviado(false);
  };


  // ================= ENVIAR FORMULARIO =================

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
      asunto: formulario.asunto,
      mensaje: formulario.mensaje,
      fecha: new Date().toLocaleString()
    };

    // Agregar el nuevo mensaje
    mensajesGuardados.push(nuevoMensaje);

    // Guardar en localStorage
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
      asunto: "",
      mensaje: ""
    });
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
              alt="Logo RefugiPet"
              className="contacto-logo"
            />

            <div>
              <h1>RefugiPet</h1>

              <p>
                Juntos construimos un hogar para cada mascota
              </p>
            </div>

          </div>


          {/* MENU */}

          <nav className="contacto-nav">

            <Link to="/principal">
              Inicio
            </Link>

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


          {/* ================= FORMULARIO ================= */}

          <form
            className="contacto-formulario"
            onSubmit={handleSubmit}
          >

            {/* NOMBRE */}

            <div className="campo">

              <label>Nombre</label>

              <input
                type="text"
                name="nombre"
                placeholder="Escribe tu nombre"
                value={formulario.nombre}
                onChange={handleChange}
                required
              />

            </div>


            {/* CORREO */}

            <div className="campo">

              <label>Correo electrónico</label>

              <input
                type="email"
                name="correo"
                placeholder="ejemplo@correo.com"
                value={formulario.correo}
                onChange={handleChange}
                required
              />

            </div>


            {/* ASUNTO */}

            <div className="campo">

              <label>Asunto</label>

              <input
                type="text"
                name="asunto"
                placeholder="¿En qué podemos ayudarte?"
                value={formulario.asunto}
                onChange={handleChange}
                required
              />

            </div>


            {/* MENSAJE */}

            <div className="campo">

              <label>Mensaje</label>

              <textarea
                name="mensaje"
                placeholder="Escribe tu mensaje..."
                value={formulario.mensaje}
                onChange={handleChange}
                required
              ></textarea>

            </div>


            {/* BOTÓN */}

            <button
              type="submit"
              className="boton-enviar"
            >
              Enviar mensaje
            </button>


            {/* MENSAJE DE CONFIRMACIÓN */}

            {mensajeEnviado && (
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