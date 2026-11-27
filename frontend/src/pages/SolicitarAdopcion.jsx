import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../solicitarAdopcion.css";

function SolicitarAdopcion() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mascotaInfo, setMascotaInfo] = useState(null);
  const [formulario, setFormulario] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    ciudad: "",
    vivienda: "Casa",
    otrasMascotas: "No",
    convivencia: "",
    experienciaMascotas: "",
    referencias: "",
    motivo: "",
  });

  useEffect(() => {
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
      if (usuario) {
        setFormulario((prev) => ({
          ...prev,
          nombre: prev.nombre || usuario.nombre || "",
          correo: prev.correo || usuario.correo || "",
        }));
      }
    } catch {
      // ignorar
    }

    fetch(`http://127.0.0.1:8000/api/mascotas/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setMascotaInfo(data);
      })
      .catch(() => {});
  }, [id]);

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
          convivencia: formulario.convivencia || null,
          experiencia_mascotas: formulario.experienciaMascotas || null,
          referencias: formulario.referencias || null,
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
              {mascotaInfo && (
                <div className="solicitar-pet-summary">
                  {mascotaInfo.imagen ? (
                    <img src={mascotaInfo.imagen} alt={mascotaInfo.nombre} />
                  ) : (
                    <div style={{ fontSize: "2.4rem" }}>
                      {mascotaInfo.tipo === "Gato" ? "🐱" : "🐶"}
                    </div>
                  )}
                  <div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "var(--primary)",
                      }}
                    >
                      Mascota seleccionada
                    </span>
                    <h3 style={{ margin: "2px 0", color: "var(--primary-dark)" }}>
                      {mascotaInfo.nombre}
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text-muted)" }}>
                      {mascotaInfo.tipo} · {mascotaInfo.edad}{" "}
                      {mascotaInfo.edad === 1 ? "año" : "años"} ·{" "}
                      {mascotaInfo.tamaño || mascotaInfo.tamano} ·{" "}
                      {mascotaInfo.nombre_refugio || "RefugiPet"}
                    </p>
                  </div>
                </div>
              )}

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

                <div className="solicitar-grid-2">
                  <div className="form-group">
                    <label htmlFor="convivencia">Convivencia en el hogar</label>
                    <input
                      type="text"
                      id="convivencia"
                      name="convivencia"
                      placeholder="Ej. Vivo con mi familia y dos niños"
                      value={formulario.convivencia}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="experienciaMascotas">Experiencia con mascotas</label>
                    <input
                      type="text"
                      id="experienciaMascotas"
                      name="experienciaMascotas"
                      placeholder="Ej. He tenido perros durante 5 años"
                      value={formulario.experienciaMascotas}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="referencias">Referencias personales o de contacto</label>
                  <input
                    type="text"
                    id="referencias"
                    name="referencias"
                    placeholder="Nombre y teléfono de una referencia o veterinario"
                    value={formulario.referencias}
                    onChange={handleChange}
                  />
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
                <Link to="/mis-solicitudes" className="btn-exito-primary">
                  Ver mis solicitudes
                </Link>
                <Link to="/adopcion" className="btn-exito-secondary">
                  Explorar más mascotas
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
