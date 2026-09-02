import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../solicitarAdopcion.css";
import logo from "../assets/logo.png";

function SolicitarAdopcion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    ciudad: "",
    vivienda: "Casa",
    otrasMascotas: "No",
    motivo: "",
  });

  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormulario((anterior) => ({
      ...anterior,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setCargando(true);

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Debes iniciar sesión para solicitar una adopción.");
      setCargando(false);
      return;
    }

    try {
      const respuesta = await fetch(
        "http://127.0.0.1:8000/api/adopciones/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            mascota_id: Number(id),
            telefono: formulario.telefono,
            ciudad: formulario.ciudad,
            vivienda: formulario.vivienda,
            otras_mascotas: formulario.otrasMascotas,
            motivo: formulario.motivo,
          }),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        console.error("Error del servidor:", datos);

        setError(
          datos.detail || "No se pudo enviar la solicitud de adopción."
        );

        return;
      }

      console.log("Solicitud guardada:", datos);

      setEnviado(true);
    } catch (err) {
      console.error("Error de conexión:", err);

      setError(
        "No se pudo conectar con el servidor. Verifica que el backend esté funcionando."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="solicitar-page">

      {/* HEADER */}
      <header className="solicitar-header">
        <div className="solicitar-container">

          <Link
            to="/principal"
            className="solicitar-marca"
          >
            <img
              src={logo}
              alt="Logo RefugiPet"
              className="solicitar-logo"
            />

            <div>
              <h1>RefugiPet</h1>

              <p>
                Juntos construimos un hogar para cada mascota
              </p>
            </div>
          </Link>

          <nav className="solicitar-nav">

            <Link to="/principal">
              Inicio
            </Link>

            <Link to="/adopcion">
              Mascotas
            </Link>

            <Link to="/contacto">
              Contacto
            </Link>

            <Link to="/">
              Cerrar sesion
            </Link>

          </nav>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="solicitar-main">

        <section className="solicitar-seccion">

          <div className="solicitar-titulo">

            <span>🐾</span>

            <h2>
              Solicitud de adopción
            </h2>

            <p>
              Completa el siguiente formulario para iniciar
              el proceso de adopción.
            </p>

          </div>

          {!enviado ? (

            <form
              className="solicitar-formulario"
              onSubmit={handleSubmit}
            >

              {/* DATOS PERSONALES */}
              <h3>
                Datos personales
              </h3>

              <div className="formulario-fila">

                <div className="campo">

                  <label>
                    Nombre completo
                  </label>

                  <input
                    type="text"
                    name="nombre"
                    placeholder="Escribe tu nombre completo"
                    value={formulario.nombre}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="campo">

                  <label>
                    Correo electrónico
                  </label>

                  <input
                    type="email"
                    name="correo"
                    placeholder="ejemplo@correo.com"
                    value={formulario.correo}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              <div className="formulario-fila">

                <div className="campo">

                  <label>
                    Teléfono
                  </label>

                  <input
                    type="tel"
                    name="telefono"
                    placeholder="Número de teléfono"
                    value={formulario.telefono}
                    onChange={handleChange}
                    required
                  />

                </div>

                <div className="campo">

                  <label>
                    Ciudad
                  </label>

                  <input
                    type="text"
                    name="ciudad"
                    placeholder="Ciudad donde vives"
                    value={formulario.ciudad}
                    onChange={handleChange}
                    required
                  />

                </div>

              </div>

              {/* INFORMACIÓN DEL HOGAR */}
              <h3>
                Información del hogar
              </h3>

              <div className="formulario-fila">

                <div className="campo">

                  <label>
                    Tipo de vivienda
                  </label>

                  <select
                    name="vivienda"
                    value={formulario.vivienda}
                    onChange={handleChange}
                  >

                    <option value="Casa">
                      Casa
                    </option>

                    <option value="Apartamento">
                      Apartamento
                    </option>

                    <option value="Finca">
                      Finca
                    </option>

                    <option value="Otro">
                      Otro
                    </option>

                  </select>

                </div>

                <div className="campo">

                  <label>
                    ¿Tienes otras mascotas?
                  </label>

                  <select
                    name="otrasMascotas"
                    value={formulario.otrasMascotas}
                    onChange={handleChange}
                  >

                    <option value="No">
                      No
                    </option>

                    <option value="Si">
                      Sí
                    </option>

                  </select>

                </div>

              </div>

              {/* MOTIVO */}
              <div className="campo">

                <label>
                  ¿Por qué deseas adoptar?
                </label>

                <textarea
                  name="motivo"
                  placeholder="Cuéntanos por qué quieres adoptar esta mascota..."
                  value={formulario.motivo}
                  onChange={handleChange}
                  rows="5"
                  required
                ></textarea>

              </div>

              {/* ERROR */}
              {error && (
                <p
                  style={{
                    color: "red",
                    textAlign: "center",
                    marginTop: "15px",
                  }}
                >
                  {error}
                </p>
              )}

              {/* BOTONES */}
              <div className="solicitar-botones">

                <button
                  type="button"
                  className="boton-volver"
                  onClick={() => navigate("/adopcion")}
                  disabled={cargando}
                >
                  Volver
                </button>

                <button
                  type="submit"
                  className="boton-solicitar"
                  disabled={cargando}
                >
                  {cargando
                    ? "Enviando..."
                    : "Enviar solicitud"}
                </button>

              </div>

            </form>

          ) : (

            <div className="solicitud-exitosa">

              <div className="exito-icono">
                ✅
              </div>

              <h2>
                ¡Solicitud enviada!
              </h2>

              <p>
                Tu solicitud de adopción fue enviada
                correctamente.
              </p>

              <p>
                El equipo de RefugiPet revisará la información
                y se pondrá en contacto contigo.
              </p>

              <div className="exito-botones">

                <Link
                  to="/adopcion"
                  className="boton-solicitar"
                >
                  Volver a mascotas
                </Link>

                <Link
                  to="/principal"
                  className="boton-volver"
                >
                  Ir al inicio
                </Link>

              </div>

            </div>

          )}

        </section>

      </main>

      {/* FOOTER */}
      <footer className="solicitar-footer">

        <p>
          © 2026 RefugiPet - Todos los derechos reservados
        </p>

      </footer>

    </div>
  );
}

export default SolicitarAdopcion;