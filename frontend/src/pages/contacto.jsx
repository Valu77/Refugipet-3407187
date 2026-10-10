import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../contacto.css";

function Contacto() {
  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    asunto: "",
    mensaje: "",
  });

  const [mensajeEnviado, setMensajeEnviado] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value,
    });
    setMensajeEnviado(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const mensajesGuardados = JSON.parse(
      localStorage.getItem("mensajesContacto") || "[]"
    );

    const nuevoMensaje = {
      id: Date.now(),
      nombre: formulario.nombre,
      correo: formulario.correo,
      asunto: formulario.asunto,
      mensaje: formulario.mensaje,
      fecha: new Date().toLocaleString(),
    };

    mensajesGuardados.push(nuevoMensaje);
    localStorage.setItem("mensajesContacto", JSON.stringify(mensajesGuardados));

    setMensajeEnviado(true);
    setFormulario({
      nombre: "",
      correo: "",
      asunto: "",
      mensaje: "",
    });
  };

  return (
    <div className="contacto-page-container">
      <Navbar variant="app" />

      <main className="contacto-main-content">
        <section className="contacto-hero-banner">
          <div className="container">
            <span className="contacto-badge">📩 CONTÁCTANOS</span>
            <h1>Estamos para <span>ayudarte</span></h1>
            <p>
              ¿Tienes preguntas sobre alguna mascota, deseas colaborar con nuestro refugio o conocer más del proceso de adopción? Déjanos tu mensaje.
            </p>
          </div>
        </section>

        <section className="container contacto-content-grid">
          {/* INFO SIDEBAR */}
          <div className="contacto-info-card">
            <h2>Información de contacto</h2>
            <p className="contacto-info-desc">
              Ponte en contacto directo con nuestro equipo de atención al usuario y adopciones.
            </p>

            <div className="contacto-details-list">
              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <div>
                  <strong>Ubicación</strong>
                  <p>Calle Principal #123, Ciudad</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">✉️</span>
                <div>
                  <strong>Correo electrónico</strong>
                  <p>contacto@refugipet.org</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">📞</span>
                <div>
                  <strong>Teléfono / WhatsApp</strong>
                  <p>+57 (300) 123-4567</p>
                </div>
              </div>

              <div className="detail-item">
                <span className="detail-icon">🕒</span>
                <div>
                  <strong>Horario de atención</strong>
                  <p>Lunes a Sábado: 8:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* FORM CONTAINER */}
          <div className="contacto-form-card">
            <h2>Envíanos un mensaje</h2>
            <p className="form-subtitle">
              Los campos con <span className="required-star">*</span> son obligatorios.
            </p>

            <form onSubmit={handleSubmit} className="contacto-form-modern">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="nombre">
                    Nombre completo <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    placeholder="Escribe tu nombre completo"
                    value={formulario.nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="correo">
                    Correo electrónico <span className="required-star">*</span>
                  </label>
                  <input
                    type="email"
                    id="correo"
                    name="correo"
                    placeholder="ejemplo@correo.com"
                    value={formulario.correo}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="asunto">
                  Asunto <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  id="asunto"
                  name="asunto"
                  placeholder="¿En qué podemos ayudarte?"
                  value={formulario.asunto}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="mensaje">
                  Mensaje <span className="required-star">*</span>
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  placeholder="Escribe tu mensaje o consulta detallada..."
                  rows="5"
                  value={formulario.mensaje}
                  onChange={handleChange}
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-enviar-contacto">
                Enviar mensaje
              </button>

              {mensajeEnviado && (
                <div className="contacto-success-alert">
                  ✅ ¡Tu mensaje ha sido enviado correctamente! Nos pondremos en contacto pronto.
                </div>
              )}
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Contacto;
