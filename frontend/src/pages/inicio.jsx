import "../ini.css";
import { Link } from "react-router-dom";

import logo from "../assets/logo.png";

import carru1 from "../assets/carrusel/carru1.png";
import carru2 from "../assets/carrusel/carru2 (2).png";
import carru3 from "../assets/carrusel/carru3 (2).png";

function Inicio() {
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
              <h1>RefugioPet</h1>

              <p>
                Juntos construimos un hogar para cada mascota
              </p>
            </div>

          </div>


          {/* MENÚ */}
          <nav>
            <ul>

              <li>
                <Link to="/">Inicio</Link>
              </li>

              <li>
                <a href="#">Adopción</a>
              </li>

              <li>
                <a href="#">Contacto</a>
              </li>

              <li>
                <Link to="/login">
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


        <div className="btn-carrusel">
          <Link to="#">
            Ver Mascotas
          </Link>
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

        <form>

          <input
            type="text"
            placeholder="Nombre completo"
          />

          <input
            type="email"
            placeholder="Correo electrónico"
          />

          <textarea
            placeholder="Escribe tu mensaje"
          ></textarea>

          <button type="submit">
            Enviar Mensaje
          </button>

        </form>

      </section>


      {/* ================= FOOTER ================= */}

      <footer>

        <p>
          © 2026 RefugioPet - Todos los derechos reservados
        </p>

      </footer>

    </>
  );
}

export default Inicio;