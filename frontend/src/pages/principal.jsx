import "../principal.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import logo from "../assets/logo.png";

const emojiPorTipo = {
  Perro: "🐶",
  Gato: "🐱",
  Ave: "🐦",
  Conejo: "🐰",
};

function Principal() {
  const [mascotas, setMascotas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarMascotas = async () => {
      try {
        const respuesta = await fetch("http://127.0.0.1:8000/api/mascotas/");

        if (!respuesta.ok) {
          throw new Error("No se pudieron cargar las mascotas");
        }

        const datos = await respuesta.json();
        setMascotas(datos);
      } catch (err) {
        setError("No se pudo conectar con el servidor.");
      } finally {
        setCargando(false);
      }
    };

    cargarMascotas();
  }, []);

  // Mostramos solo las primeras 4 en la vista principal
  const mascotasDestacadas = mascotas.slice(0, 4);

  return (
    <>
      {/* ================= HEADER ================= */}

      <header className="principal-header">
        <div className="principal-container">
          <div className="principal-marca">
            <img src={logo} alt="Logo RefugioPet" className="principal-logo" />

            <div>
              <h1>RefugiPet</h1>
              <p>Juntos construimos un hogar para cada mascota</p>
            </div>
          </div>

          <nav className="principal-nav">
            <Link to="/adopcion">Mascotas</Link>
            <Link to="/adopcion">Adopcion</Link>
            <Link to="/contacto">Contacto</Link>
            <Link to="/">Cerrar Sesion</Link>
          </nav>
        </div>
      </header>

      {/* ================= CONTENIDO ================= */}

      <main>
        <section className="bienvenida-principal">
          <div className="bienvenida-contenido">
            <h2>Bienvenido a RefugiPet</h2>

            <p>
              Nos alegra tenerte en nuestra comunidad. Explora las mascotas
              disponibles y descubre algunos de nuestros amigos que estan
              esperando encontrar una familia y un hogar lleno de amor.
            </p>
          </div>
        </section>

        {/* ================= MASCOTAS ================= */}

        <section className="mascotas" id="mascotas">
          <h2>Mascotas disponibles para adopcion</h2>

          <p className="texto-mascotas">
            Conoce algunos de nuestros amigos que estan esperando encontrar un
            hogar.
          </p>

          {cargando && <p>Cargando mascotas...</p>}

          {error && (
            <p style={{ color: "red", textAlign: "center" }}>{error}</p>
          )}

          {!cargando && !error && mascotasDestacadas.length === 0 && (
            <p style={{ textAlign: "center" }}>
              Todavia no hay mascotas registradas.
            </p>
          )}

          <div className="contenedor-mascotas">
            {mascotasDestacadas.map((mascota) => (
              <div className="mascota-card" key={mascota.id}>
                <div className="mascota-imagen">
                  {mascota.imagen ? (
                    <img
                      src={mascota.imagen}
                      alt={mascota.nombre}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    emojiPorTipo[mascota.tipo] || "🐾"
                  )}
                </div>

                <div className="mascota-info">
                  <h3>{mascota.nombre}</h3>

                  <p>
                    {mascota.tipo} · {mascota.edad} anos
                  </p>

                  <Link to="/adopcion" className="boton-mascota">
                    Ver informacion
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="boton-ver-mascotas">
            <Link to="/adopcion">Ver todas las mascotas</Link>
          </div>
        </section>

        {/* ================= ADOPCION ================= */}

        <section className="seccion-adopcion">
          <h2>Adopta y cambia una vida</h2>

          <p>
            Adoptar es darle una segunda oportunidad a una mascota que
            necesita amor, cuidado y un hogar.
          </p>

          <Link to="/adopcion" className="boton-adopcion">
            Quiero adoptar
          </Link>
        </section>

        {/* ================= CONTACTO ================= */}

        <section className="contacto-principal">
          <h2>Necesitas ayuda?</h2>

          <p>
            Si tienes alguna pregunta sobre una mascota o sobre el proceso de
            adopcion, contactanos.
          </p>

          <Link to="/contacto" className="boton-contacto">
            Contactanos
          </Link>
        </section>
      </main>

      {/* ================= FOOTER ================= */}

      <footer className="principal-footer">
        <p>© 2026 RefugiPet - Todos los derechos reservados</p>
      </footer>
    </>
  );
}

export default Principal;