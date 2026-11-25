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
  const [enviando, setEnviando] = useState(false);
  const [errorContacto, setErrorContacto] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value,
    });
    setMensajeEnviado(false);
    setErrorContacto("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErrorContacto("");
    setMensajeEnviado(false);

    const asuntoLimpio = formulario.asunto.trim();
    const mensajeFinal = asuntoLimpio
      ? `[Asunto: ${asuntoLimpio}] ${formulario.mensaje.trim()}`
      : formulario.mensaje.trim();

    try {
      const respuesta = await fetch("http://127.0.0.1:8000/api/contactos/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: formulario.nombre.trim(),
          correo: formulario.correo.trim().toLowerCase(),
          mensaje: mensajeFinal,
        }),
      });

      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) {
        const msg = Array.isArray(datos.detail)
          ? datos.detail.map((d) => d.msg || d).join(", ")
          : datos.detail || "No se pudo enviar tu mensaje.";
        setErrorContacto(msg);
        return;
      }

      setMensajeEnviado(true);
      setFormulario({
        nombre: "",
        correo: "",
        asunto: "",
        mensaje: "",
      });
    } catch (_err) {
      setErrorContacto("No se pudo conectar con el servidor.");
    } finally {
      setEnviando(false);
    }
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

              <button type="submit" className="btn-enviar-contacto" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar mensaje"}
              </button>

              {errorContacto && (
                <div className="form-error-alert" style={{ marginTop: "0.75rem", color: "#b91c1c" }}>
                  ⚠️ {errorContacto}
                </div>
              )}

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
