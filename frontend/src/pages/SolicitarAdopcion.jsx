import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../solicitarAdopcion.css";

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
      const respuesta = await fetch("http://127.0.0.1:8000/api/adopciones/", {
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
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        console.error("Error del servidor:", datos);
        setError(datos.detail || "No se pudo enviar la solicitud de adopción.");
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
    <div className="solicitar-page-container">
      <Navbar variant="app" />

      <main className="solicitar-main-content">
        <section className="solicitar-hero-banner">
          <div className="container">
            <span className="solicitar-badge">🐾 PROCESO DE ADOPCIÓN</span>
            <h1>Solicitud de <span>Adopción</span></h1>
            <p>
              Completa la información a continuación para iniciar la solicitud. Queremos asegurarnos de que la mascota llegue al hogar ideal.
            </p>
          </div>
        </section>

        <section className="container solicitar-form-wrapper">
          {!enviado ? (
            <div className="solicitar-card">
              <form onSubmit={handleSubmit} className="solicitar-form">
                {/* SECCIÓN 1: DATOS PERSONALES */}
                <div className="form-section-header">
                  <span className="section-step-num">1</span>
                  <h3>Datos personales</h3>
                </div>

                <div className="solicitar-grid-2">
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

                <div className="solicitar-grid-2">
                  <div className="form-group">
                    <label htmlFor="telefono">
                      Teléfono <span className="required-star">*</span>
                    </label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      placeholder="Número de teléfono de contacto"
                      value={formulario.telefono}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="ciudad">
                      Ciudad <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      id="ciudad"
                      name="ciudad"
                      placeholder="Ciudad de residencia"
                      value={formulario.ciudad}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* SECCIÓN 2: INFORMACIÓN DEL HOGAR */}
                <div className="form-section-header margin-top">
                  <span className="section-step-num">2</span>
                  <h3>Información del hogar</h3>
                </div>

                <div className="solicitar-grid-2">
                  <div className="form-group">
                    <label htmlFor="vivienda">Tipo de vivienda</label>
                    <select
                      id="vivienda"
                      name="vivienda"
                      value={formulario.vivienda}
                      onChange={handleChange}
                    >
                      <option value="Casa">Casa</option>
                      <option value="Apartamento">Apartamento</option>
                      <option value="Finca">Finca</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="otrasMascotas">¿Tienes otras mascotas?</label>
                    <select
                      id="otrasMascotas"
                      name="otrasMascotas"
                      value={formulario.otrasMascotas}
                      onChange={handleChange}
                    >
                      <option value="No">No</option>
                      <option value="Si">Sí</option>
                    </select>
                  </div>
                </div>

                {/* SECCIÓN 3: MOTIVACIÓN */}
                <div className="form-section-header margin-top">
                  <span className="section-step-num">3</span>
                  <h3>Motivo de adopción</h3>
                </div>

                <div className="form-group">
                  <label htmlFor="motivo">
                    ¿Por qué deseas adoptar a esta mascota? <span className="required-star">*</span>
                  </label>
                  <textarea
                    id="motivo"
                    name="motivo"
                    placeholder="Cuéntanos brevemente las razones para adoptar y la experiencia previa con animales..."
                    value={formulario.motivo}
                    onChange={handleChange}
                    rows="4"
                    required
                  ></textarea>
                </div>

                {error && <div className="form-error-alert">⚠️ {error}</div>}

                <div className="solicitar-actions">
                  <button
                    type="button"
                    className="btn-solicitar-back"
                    onClick={() => navigate("/adopcion")}
                    disabled={cargando}
                  >
                    ← Volver a catálogo
                  </button>

                  <button
                    type="submit"
                    className="btn-solicitar-submit"
                    disabled={cargando}
                  >
                    {cargando ? "Enviando solicitud..." : "Enviar solicitud"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="solicitud-exito-card">
              <div className="exito-badge">✅</div>
              <h2>¡Solicitud enviada con éxito!</h2>
              <p>
                Tu solicitud de adopción ha sido recibida correctamente por nuestro equipo.
              </p>
              <p className="subtext">
                Evaluaremos los datos proporcionados y te contactaremos por correo o teléfono en el menor tiempo posible.
              </p>

              <div className="exito-buttons-group">
                <Link to="/adopcion" className="btn-exito-primary">
                  Explorar más mascotas
                </Link>
                <Link to="/principal" className="btn-exito-secondary">
                  Ir al inicio
                </Link>
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default SolicitarAdopcion;
