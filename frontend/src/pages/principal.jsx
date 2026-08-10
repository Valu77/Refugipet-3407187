import "../principal.css";
import { Link } from "react-router-dom";

import logo from "../assets/logo.png";

function Principal() {
  return (
    <>
      {/* ================= HEADER ================= */}

      <header className="principal-header">

        <div className="principal-container">

          {/* LOGO */}
          <div className="principal-marca">

            <img
              src={logo}
              alt="Logo RefugioPet"
              className="principal-logo"
            />

            <div>
              <h1>RefugioPet</h1>
              <p>Juntos construimos un hogar para cada mascota</p>
            </div>

          </div>


          {/* MENÚ */}
          <nav className="principal-nav">

            <Link to="/principal">
              Inicio
            </Link>

            <a href="#mascotas">
              Mascotas
            </a>

            <a href="#adopcion">
              Adopción
            </a>

            <a href="#contacto">
              Contacto
            </a>

            <Link to="/">
              Cerrar Sesión
            </Link>

          </nav>

        </div>

      </header>


      {/* ================= BIENVENIDA ================= */}

      <main>

        <section className="bienvenida-principal">

          <div className="bienvenida-contenido">

            <h2>
              ¡Bienvenido a RefugioPet! 🐾
            </h2>

            <p>
              Gracias por ser parte de nuestra comunidad.
              Aquí podrás encontrar mascotas que buscan
              una familia y un hogar lleno de amor.
            </p>

            <a
              href="#mascotas"
              className="boton-principal"
            >
              Ver mascotas
            </a>

          </div>

        </section>


        {/* ================= MASCOTAS ================= */}

        <section
          className="mascotas"
          id="mascotas"
        >

          <h2>
            Mascotas disponibles para adopción
          </h2>

          <p className="texto-mascotas">
            Conoce algunos de nuestros amigos que están
            esperando encontrar un hogar.
          </p>


          <div className="contenedor-mascotas">


            {/* MASCOTA 1 */}

            <div className="mascota-card">

              <div className="mascota-imagen">
                🐶
              </div>

              <div className="mascota-info">

                <h3>Max</h3>

                <p>
                  Perro · 2 años
                </p>

                <button>
                  Ver información
                </button>

              </div>

            </div>


            {/* MASCOTA 2 */}

            <div className="mascota-card">

              <div className="mascota-imagen">
                🐕
              </div>

              <div className="mascota-info">

                <h3>Rocky</h3>

                <p>
                  Perro · 3 años
                </p>

                <button>
                  Ver información
                </button>

              </div>

            </div>


            {/* MASCOTA 3 */}

            <div className="mascota-card">

              <div className="mascota-imagen">
                🐱
              </div>

              <div className="mascota-info">

                <h3>Luna</h3>

                <p>
                  Gata · 1 año
                </p>

                <button>
                  Ver información
                </button>

              </div>

            </div>


            {/* MASCOTA 4 */}

            <div className="mascota-card">

              <div className="mascota-imagen">
                🐕‍🦺
              </div>

              <div className="mascota-info">

                <h3>Bruno</h3>

                <p>
                  Perro · 4 años
                </p>

                <button>
                  Ver información
                </button>

              </div>

            </div>

          </div>

        </section>


        {/* ================= ADOPCIÓN ================= */}

        <section
          className="seccion-adopcion"
          id="adopcion"
        >

          <h2>
            Adopta y cambia una vida ❤️
          </h2>

          <p>
            Adoptar es darle una segunda oportunidad a una
            mascota que necesita amor, cuidado y un hogar.
          </p>

          <button>
            Quiero adoptar
          </button>

        </section>


        {/* ================= CONTACTO ================= */}

        <section
          className="contacto-principal"
          id="contacto"
        >

          <h2>
            ¿Necesitas ayuda?
          </h2>

          <p>
            Si tienes alguna pregunta sobre una mascota
            o sobre el proceso de adopción, contáctanos.
          </p>

          <button>
            Contáctanos
          </button>

        </section>

      </main>


      {/* ================= FOOTER ================= */}

      <footer className="principal-footer">

        <p>
          © 2026 RefugioPet - Todos los derechos reservados
        </p>

      </footer>

    </>
  );
}

export default Principal;