import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../ini.css";

import carru1 from "../assets/carrusel/carru1.png";
import carru2 from "../assets/carrusel/carru2 (2).png";
import carru3 from "../assets/carrusel/carru3 (2).png";

function Inicio() {
  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
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
      mensaje: formulario.mensaje,
      fecha: new Date().toLocaleString(),
    };

    mensajesGuardados.push(nuevoMensaje);
    localStorage.setItem("mensajesContacto", JSON.stringify(mensajesGuardados));

    setMensajeEnviado(true);
    setFormulario({
      nombre: "",
      correo: "",
      mensaje: "",
    });
  };

  return (
    <div className="landing-page-container">
      <Navbar variant="public" />

      <main className="landing-main">
        {/* HERO SECTION */}
        <section className="hero-landing">
          <div className="container hero-landing-grid">
            <div className="hero-landing-text">
              <span className="hero-badge">🐾 ADOPCIÓN RESPONSABLE</span>
              <h1 className="hero-landing-title">
                Encuentra a tu nuevo <span>mejor amigo</span>
              </h1>
              <p className="hero-landing-desc">
                Miles de animales abandonados o rescatados están esperando una oportunidad para llenar tu vida de alegría, compañía y amor incondicional.
              </p>
              <div className="hero-landing-cta">
                <Link to="/iniciosesion" className="btn-hero-primary">
                  Encontrar mi mascota
                </Link>
                <a href="#beneficios" className="btn-hero-secondary">
                  Conoce el proceso
                </a>
              </div>
            </div>

            <div className="hero-landing-gallery">
              <div className="hero-image-card card-main">
                <img src={carru1} alt="Mascota buscando hogar" />
              </div>
              <div className="hero-image-card card-sub1">
                <img src={carru2} alt="Gatito en adopción" />
              </div>
              <div className="hero-image-card card-sub2">
                <img src={carru3} alt="Perrito feliz" />
              </div>
            </div>
          </div>
        </section>

        {/* NOSOTROS SECTION */}
        <section className="nosotros-section">
          <div className="container">
            <div className="section-header center">
              <h2>¿Quiénes Somos?</h2>
              <p>
                RefugiPet es una plataforma dedicada a conectar mascotas que necesitan un hogar con familias amorosas y responsables.
              </p>
            </div>

            <div className="about-cards-grid">
              <div className="about-card">
                <div className="about-icon">❤️</div>
                <h3>Rescate y Cuidado</h3>
                <p>
                  Promovemos el rescate, vacunación y protección integral de perros y gatos en situación de vulnerabilidad.
                </p>
              </div>
              <div className="about-card">
                <div className="about-icon">🏠</div>
                <h3>Hogares Seguros</h3>
                <p>
                  Evaluamos cada solicitud de adopción para garantizar que las mascotas lleguen a entornos seguros y llenos de amor.
                </p>
              </div>
              <div className="about-card">
                <div className="about-icon">🤝</div>
                <h3>Comunidad Responsable</h3>
                <p>
                  Fomentamos la tenencia responsable y concientizamos sobre la esterilización y cuidado animal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFICIOS / POR QUE ADOPTAR */}
        <section className="beneficios-section" id="beneficios">
          <div className="container">
            <div className="section-header center">
              <h2>¿Por qué adoptar?</h2>
              <p>Descubre el impacto de transformar una vida a través de la adopción</p>
            </div>

            <div className="beneficios-grid">
              <div className="beneficio-card">
                <div className="beneficio-icon">🐶</div>
                <h3>Salvas una vida</h3>
                <p>
                  Le das una segunda oportunidad a una mascota que ha sufrido abandono o desprotección.
                </p>
              </div>

              <div className="beneficio-card highlight">
                <div className="beneficio-icon">💖</div>
                <h3>Amor Incondicional</h3>
                <p>
                  Una mascota adoptada expresa una gratitud infinita y se convierte en un miembro leal de tu familia.
                </p>
              </div>

              <div className="beneficio-card">
                <div className="beneficio-icon">🌱</div>
                <h3>Combates la sobrepoblación</h3>
                <p>
                  Contribuyes directamente a frenar la venta indiscriminada y el abandono animal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACTO */}
        <section className="contacto-landing-section">
          <div className="container">
            <div className="contacto-card-wrapper">
              <div className="contacto-info-side">
                <h2>¿Tienes dudas o comentarios?</h2>
                <p>
                  Escríbenos y nuestro equipo te asesorará en todo lo referente al proceso de adopción o voluntariado.
                </p>
                <div className="contacto-badge">
                  <span>✨ Respuestas en menos de 24 horas</span>
                </div>
              </div>

              <div className="contacto-form-side">
                <form onSubmit={handleSubmit} className="landing-form">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre completo</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      placeholder="Tu nombre completo"
                      value={formulario.nombre}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="correo">Correo electrónico</label>
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

                  <div className="form-group">
                    <label htmlFor="mensaje">Mensaje</label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      placeholder="Escribe tu mensaje aquí..."
                      rows="4"
                      value={formulario.mensaje}
                      onChange={handleChange}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-submit-landing">
                    Enviar Mensaje
                  </button>

                  {mensajeEnviado && (
                    <div className="form-success-banner">
                      ¡Gracias! Tu mensaje ha sido enviado correctamente.
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Inicio;
