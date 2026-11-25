import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "../../refugio.css";

const API_URL = "http://127.0.0.1:8000/api";

function estadoBadgeClass(estado) {
  const e = (estado || "").toLowerCase();
  if (e === "disponible" || e === "aprobada" || e === "aprobado") return "badge-disponible";
  if (e === "pendiente") return "badge-pendiente";
  if (e === "adoptada") return "badge-adoptada";
  return "badge-rechazada";
}

function PanelRefugio() {
  const navigate = useNavigate();

  const [seccion, setSeccion] = useState("inicio");
  const [cargando, setCargando] = useState(true);
  const [errorGeneral, setErrorGeneral] = useState("");
  const [mensajeExito, setMensajeExito] = useState("");

  const [dashboard, setDashboard] = useState({
    total_mascotas: 0,
    mascotas_disponibles: 0,
    mascotas_adoptadas: 0,
    solicitudes_pendientes: 0,
    solicitudes_totales: 0,
  });
  const [mascotas, setMascotas] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [filtroSolicitudes, setFiltroSolicitudes] = useState("Todas");
  const [historial, setHistorial] = useState([]);
  const [perfil, setPerfil] = useState({
    nombre_refugio: "",
    nombre_responsable: "",
    correo: "",
    telefono: "",
    ciudad: "",
    direccion: "",
    estado: "",
  });

  // Modal detalle y gestión de solicitud de adopción
  const [solicitudActiva, setSolicitudActiva] = useState(null);
  const [accionSolicitud, setAccionSolicitud] = useState(null); // "aprobar" | "rechazar" | null
  const [motivoRechazoSol, setMotivoRechazoSol] = useState("");
  const [errorModalSol, setErrorModalSol] = useState("");
  const [procesandoSol, setProcesandoSol] = useState(false);

  // Modal confirmación para retirar mascota
  const [mascotaARetirar, setMascotaARetirar] = useState(null);
  const [retirandoMascota, setRetirandoMascota] = useState(false);

  // Estado formulario de mascotas
  const [mostrarFormMascota, setMostrarFormMascota] = useState(false);
  const [editandoMascotaId, setEditandoMascotaId] = useState(null);
  const [tipoLegacyMascota, setTipoLegacyMascota] = useState(null);
  const [guardandoMascota, setGuardandoMascota] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorMascota, setErrorMascota] = useState("");
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState("");
  const [formMascota, setFormMascota] = useState({
    nombre: "",
    tipo: "Perro",
    edad: "",
    tamano: "Mediano",
    descripcion: "",
  });

  // Estado formulario de perfil y contraseña
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState("");
  const [exitoPerfil, setExitoPerfil] = useState("");
  const [passwordForm, setPasswordForm] = useState({
    password_actual: "",
    nueva_password: "",
    confirmar_nueva_password: "",
  });
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [errorPass, setErrorPass] = useState("");
  const [exitoPass, setExitoPass] = useState("");

  const obtenerToken = () => localStorage.getItem("token");

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/iniciosesion");
  }, [navigate]);

  const fetchAuth = useCallback(
    async (ruta, options = {}) => {
      const token = obtenerToken();
      const headers = {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      };
      const respuesta = await fetch(`${API_URL}${ruta}`, {
        ...options,
        headers,
      });

      if (respuesta.status === 401) {
        cerrarSesion();
        throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
      }

      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) {
        const msg = Array.isArray(datos.detail)
          ? datos.detail.map((d) => d.msg || d).join(", ")
          : datos.detail || "Ocurrió un error al procesar la solicitud";
        throw new Error(msg);
      }
      return datos;
    },
    [cerrarSesion]
  );

  const cargarTodo = useCallback(async () => {
    setCargando(true);
    setErrorGeneral("");
    try {
      const [dashData, mascotasData, adopcionesData, historialData, perfilData] =
        await Promise.all([
          fetchAuth("/refugio/dashboard"),
          fetchAuth("/refugio/mascotas"),
          fetchAuth("/refugio/adopciones"),
          fetchAuth("/refugio/historial"),
          fetchAuth("/refugio/perfil"),
        ]);

      setDashboard(dashData);
      setMascotas(mascotasData);
      setSolicitudes(adopcionesData);
      setHistorial(historialData);
      setPerfil({
        nombre_refugio: perfilData.nombre_refugio || "",
        nombre_responsable: perfilData.nombre_responsable || "",
        correo: perfilData.correo || "",
        telefono: perfilData.telefono || "",
        ciudad: perfilData.ciudad || "",
        direccion: perfilData.direccion || "",
        estado: perfilData.estado || "",
      });
    } catch (err) {
      setErrorGeneral(err.message || "No se pudo cargar el panel del refugio.");
    } finally {
      setCargando(false);
    }
  }, [fetchAuth]);

  useEffect(() => {
    const token = obtenerToken();
    let usuario = null;
    try {
      usuario = JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
      usuario = null;
    }

    if (!token || !usuario || usuario.rol !== "refugio") {
      navigate("/iniciosesion");
      return;
    }

    cargarTodo();
  }, [navigate, cargarTodo]);

  // ================= MASCOTAS =================
  const limpiarFormMascota = () => {
    setFormMascota({
      nombre: "",
      tipo: "Perro",
      edad: "",
      tamano: "Mediano",
      descripcion: "",
    });
    setArchivoImagen(null);
    setPreviewImagen("");
    setEditandoMascotaId(null);
    setTipoLegacyMascota(null);
    setErrorMascota("");
  };

  const abrirNuevaMascota = () => {
    limpiarFormMascota();
    setMostrarFormMascota(true);
  };

  const abrirEditarMascota = (mascota) => {
    setEditandoMascotaId(mascota.id);
    const tam = mascota["tamaño"] || mascota.tamano || "Mediano";
    const tipoActual = mascota.tipo || "Perro";
    setTipoLegacyMascota(
      tipoActual !== "Perro" && tipoActual !== "Gato" ? tipoActual : null
    );
    setFormMascota({
      nombre: mascota.nombre,
      tipo: tipoActual,
      edad: String(mascota.edad),
      tamano: tam.toLowerCase() === "pequeno" ? "Pequeño" : tam,
      descripcion: mascota.descripcion || "",
    });
    setArchivoImagen(null);
    setPreviewImagen(mascota.imagen || "");
    setErrorMascota("");
    setMostrarFormMascota(true);
  };

  const manejarSeleccionImagen = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setArchivoImagen(archivo);
    setPreviewImagen(URL.createObjectURL(archivo));
  };

  const guardarMascota = async (e) => {
    e.preventDefault();
    setErrorMascota("");
    setMensajeExito("");
    setGuardandoMascota(true);

    try {
      let urlImagen = previewImagen && !archivoImagen ? previewImagen : "";

      if (archivoImagen) {
        setSubiendoImagen(true);
        const formData = new FormData();
        formData.append("archivo", archivoImagen);

        const respImg = await fetch(`${API_URL}/mascotas/subir-imagen`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${obtenerToken()}`,
          },
          body: formData,
        });
        const datosImg = await respImg.json().catch(() => ({}));
        if (!respImg.ok) {
          throw new Error(datosImg.detail || "No se pudo subir la imagen");
        }
        urlImagen = datosImg.url;
        setSubiendoImagen(false);
      }

      const cuerpo = {
        nombre: formMascota.nombre.trim(),
        tipo: formMascota.tipo,
        edad: Number(formMascota.edad),
        tamaño: formMascota.tamano,
        descripcion: formMascota.descripcion.trim() || null,
        imagen: urlImagen || null,
      };

      const esEdicion = editandoMascotaId !== null;
      await fetchAuth(
        esEdicion ? `/refugio/mascotas/${editandoMascotaId}` : "/refugio/mascotas",
        {
          method: esEdicion ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cuerpo),
        }
      );

      limpiarFormMascota();
      setMostrarFormMascota(false);
      setMensajeExito(
        esEdicion
          ? "Mascota actualizada correctamente."
          : "Mascota publicada correctamente."
      );
      await cargarTodo();
    } catch (err) {
      setErrorMascota(err.message);
    } finally {
      setGuardandoMascota(false);
      setSubiendoImagen(false);
    }
  };

  const confirmarRetiroMascota = async () => {
    if (!mascotaARetirar) return;
    setRetirandoMascota(true);
    setMensajeExito("");
    setErrorGeneral("");
    try {
      const resp = await fetchAuth(`/refugio/mascotas/${mascotaARetirar.id}`, {
        method: "DELETE",
      });
      setMascotaARetirar(null);
      setMensajeExito(resp.mensaje || "Mascota retirada correctamente.");
      await cargarTodo();
    } catch (err) {
      setErrorGeneral(err.message);
    } finally {
      setRetirandoMascota(false);
    }
  };

  // ================= MODAL SOLICITUDES =================
  const abrirModalSolicitud = (sol) => {
    setSolicitudActiva(sol);
    setAccionSolicitud(null);
    setMotivoRechazoSol("");
    setErrorModalSol("");
  };

  const cerrarModalSolicitud = () => {
    if (procesandoSol) return;
    setSolicitudActiva(null);
    setAccionSolicitud(null);
    setMotivoRechazoSol("");
    setErrorModalSol("");
  };

  const confirmarRespuestaSolicitud = async () => {
    if (!solicitudActiva || !accionSolicitud) return;

    const nuevoEstado = accionSolicitud === "aprobar" ? "Aprobada" : "Rechazada";
    if (nuevoEstado === "Rechazada" && motivoRechazoSol.trim().length < 5) {
      setErrorModalSol(
        "Por favor escribe un motivo claro de al menos 5 caracteres para rechazar la solicitud."
      );
      return;
    }

    setProcesandoSol(true);
    setErrorModalSol("");
    setErrorGeneral("");
    setMensajeExito("");

    try {
      const resp = await fetchAuth(`/refugio/adopciones/${solicitudActiva.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: nuevoEstado,
          motivo_rechazo:
            nuevoEstado === "Rechazada" ? motivoRechazoSol.trim() : null,
        }),
      });
      setMensajeExito(resp.mensaje || "Solicitud actualizada correctamente.");
      setSolicitudActiva(null);
      setAccionSolicitud(null);
      setMotivoRechazoSol("");
      await cargarTodo();
    } catch (err) {
      setErrorModalSol(err.message);
    } finally {
      setProcesandoSol(false);
    }
  };

  // ================= PERFIL Y CONTRASEÑA =================
  const guardarPerfil = async (e) => {
    e.preventDefault();
    setErrorPerfil("");
    setExitoPerfil("");
    setGuardandoPerfil(true);

    try {
      const actualizado = await fetchAuth("/refugio/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_refugio: perfil.nombre_refugio.trim(),
          nombre_responsable: perfil.nombre_responsable.trim(),
          telefono: perfil.telefono.trim(),
          ciudad: perfil.ciudad.trim(),
          direccion: perfil.direccion.trim(),
        }),
      });

      try {
        const u = JSON.parse(localStorage.getItem("usuario") || "null");
        if (u && actualizado.nombre_responsable) {
          u.nombre = actualizado.nombre_responsable;
          localStorage.setItem("usuario", JSON.stringify(u));
        }
      } catch {
        // ignorar
      }

      setExitoPerfil("Datos del refugio actualizados correctamente.");
    } catch (err) {
      setErrorPerfil(err.message);
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const cambiarPassword = async (e) => {
    e.preventDefault();
    setErrorPass("");
    setExitoPass("");

    if (passwordForm.nueva_password.length < 12) {
      setErrorPass("La nueva contraseña debe tener al menos 12 caracteres.");
      return;
    }
    if (passwordForm.nueva_password !== passwordForm.confirmar_nueva_password) {
      setErrorPass("Las nuevas contraseñas no coinciden.");
      return;
    }

    setGuardandoPass(true);
    try {
      const resp = await fetchAuth("/refugio/cambiar-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      setExitoPass(resp.mensaje || "Contraseña actualizada exitosamente.");
      setPasswordForm({
        password_actual: "",
        nueva_password: "",
        confirmar_nueva_password: "",
      });
    } catch (err) {
      setErrorPass(err.message);
    } finally {
      setGuardandoPass(false);
    }
  };

  const solicitudesFiltradas = solicitudes.filter((s) =>
    filtroSolicitudes === "Todas" ? true : s.estado === filtroSolicitudes
  );

  return (
    <div className="panel-shell">
      <aside className="panel-sidebar">
        <div className="panel-brand">
          <img src={logo} alt="RefugiPet Logo" className="panel-brand-logo" />
          <div>
            <h2>RefugiPet</h2>
            <p>Panel del Refugio</p>
          </div>
        </div>

        <nav className="panel-nav">
          <button
            type="button"
            className={seccion === "inicio" ? "activo" : ""}
            onClick={() => setSeccion("inicio")}
          >
            <span>🏠 Inicio</span>
          </button>
          <button
            type="button"
            className={seccion === "mascotas" ? "activo" : ""}
            onClick={() => setSeccion("mascotas")}
          >
            <span>🐾 Mascotas</span>
            <span className="panel-nav-badge">{mascotas.length}</span>
          </button>
          <button
            type="button"
            className={seccion === "solicitudes" ? "activo" : ""}
            onClick={() => setSeccion("solicitudes")}
          >
            <span>📋 Solicitudes</span>
            {dashboard.solicitudes_pendientes > 0 && (
              <span className="panel-nav-badge">
                {dashboard.solicitudes_pendientes}
              </span>
            )}
          </button>
          <button
            type="button"
            className={seccion === "historial" ? "activo" : ""}
            onClick={() => setSeccion("historial")}
          >
            <span>📜 Historial</span>
          </button>
          <button
            type="button"
            className={seccion === "perfil" ? "activo" : ""}
            onClick={() => setSeccion("perfil")}
          >
            <span>⚙️ Perfil</span>
          </button>
        </nav>

        <div className="panel-sidebar-footer">
          <Link to="/adopcion" className="panel-footer-link">
            🌐 Ver catálogo público
          </Link>
          <button
            type="button"
            className="panel-footer-logout"
            onClick={cerrarSesion}
          >
            🚪 Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="panel-main">
        <header className="panel-header">
          <div>
            <h1>{perfil.nombre_refugio || "Mi Refugio"}</h1>
            <p>
              Gestiona tus mascotas, evalúa solicitudes de adopción y administra tu perfil
            </p>
          </div>

          <div className="panel-user-chip">
            <span className="panel-status-dot"></span>
            <span>{perfil.nombre_responsable || "Refugio Aprobado"}</span>
          </div>
        </header>

        {errorGeneral && <div className="panel-alert-error">⚠️ {errorGeneral}</div>}
        {mensajeExito && <div className="panel-alert-success">✅ {mensajeExito}</div>}

        {cargando ? (
          <div className="panel-section-card">
            <p>Cargando información del refugio...</p>
          </div>
        ) : (
          <>
            {/* ================= INICIO ================= */}
            {seccion === "inicio" && (
              <section>
                <div className="panel-welcome-card">
                  <h2>Bienvenido, {perfil.nombre_refugio || "Refugio"}</h2>
                  <p>
                    Publica perros y gatos en adopción, consulta el perfil completo de cada solicitante antes de aprobar o rechazar y revisa tu historial.
                  </p>
                </div>

                <div className="panel-stats-grid">
                  <div className="panel-stat-card">
                    <h3>{dashboard.total_mascotas}</h3>
                    <p>Mascotas registradas</p>
                  </div>
                  <div className="panel-stat-card success">
                    <h3>{dashboard.mascotas_disponibles}</h3>
                    <p>Disponibles</p>
                  </div>
                  <div className="panel-stat-card">
                    <h3>{dashboard.mascotas_adoptadas}</h3>
                    <p>Adoptadas</p>
                  </div>
                  <div className="panel-stat-card accent">
                    <h3>{dashboard.solicitudes_pendientes}</h3>
                    <p>Solicitudes pendientes</p>
                  </div>
                  <div className="panel-stat-card">
                    <h3>{dashboard.solicitudes_totales}</h3>
                    <p>Solicitudes totales</p>
                  </div>
                </div>

                <div className="panel-section-card">
                  <div className="panel-section-header">
                    <div>
                      <h2>Mascotas recientes de tu refugio</h2>
                      <p>Últimos registros publicados</p>
                    </div>
                    <button
                      type="button"
                      className="panel-btn-primary"
                      onClick={() => {
                        setSeccion("mascotas");
                        abrirNuevaMascota();
                      }}
                    >
                      + Publicar mascota
                    </button>
                  </div>

                  {mascotas.length === 0 ? (
                    <p style={{ color: "var(--text-muted)" }}>
                      Aún no has publicado mascotas en tu refugio.
                    </p>
                  ) : (
                    <div className="panel-recent-grid">
                      {mascotas.slice(0, 4).map((m) => (
                        <div className="panel-recent-card" key={m.id}>
                          {m.imagen ? (
                            <img
                              src={m.imagen}
                              alt={m.nombre}
                              className="panel-thumb"
                            />
                          ) : (
                            <div
                              className="panel-thumb"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "1.35rem",
                              }}
                            >
                              🐾
                            </div>
                          )}
                          <div>
                            <h3 style={{ margin: "0 0 4px", fontSize: "1rem" }}>
                              {m.nombre}
                            </h3>
                            <p
                              style={{
                                margin: "0 0 6px",
                                fontSize: "0.84rem",
                                color: "var(--text-muted)",
                              }}
                            >
                              {m.tipo} · {m.edad} {m.edad === 1 ? "año" : "años"}
                            </p>
                            <span className={`badge-estado ${estadoBadgeClass(m.estado)}`}>
                              {m.estado}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ================= MASCOTAS ================= */}
            {seccion === "mascotas" && (
              <section className="panel-section-card">
                <div className="panel-section-header">
                  <div>
                    <h2>Mascotas de mi refugio</h2>
                    <p>Publica perros y gatos, edita sus datos o retira publicaciones.</p>
                  </div>
                  <button
                    type="button"
                    className="panel-btn-primary"
                    onClick={() => {
                      if (mostrarFormMascota) {
                        limpiarFormMascota();
                        setMostrarFormMascota(false);
                      } else {
                        abrirNuevaMascota();
                      }
                    }}
                  >
                    {mostrarFormMascota ? "Cancelar" : "+ Publicar mascota"}
                  </button>
                </div>

                {mostrarFormMascota && (
                  <div className="panel-form-box">
                    <h3>
                      {editandoMascotaId !== null
                        ? "Editar mascota"
                        : "Publicar nueva mascota"}
                    </h3>

                    {errorMascota && (
                      <div className="panel-alert-error">{errorMascota}</div>
                    )}

                    <form className="panel-form" onSubmit={guardarMascota}>
                      <div className="panel-form-grid">
                        <div className="panel-field">
                          <label htmlFor="ref-mascota-nombre">Nombre</label>
                          <input
                            id="ref-mascota-nombre"
                            type="text"
                            value={formMascota.nombre}
                            onChange={(e) =>
                              setFormMascota({ ...formMascota, nombre: e.target.value })
                            }
                            required
                          />
                        </div>

                        <div className="panel-field">
                          <label htmlFor="ref-mascota-edad">Edad (años)</label>
                          <input
                            id="ref-mascota-edad"
                            type="number"
                            min="0"
                            max="50"
                            value={formMascota.edad}
                            onChange={(e) =>
                              setFormMascota({ ...formMascota, edad: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>

                      <div className="panel-form-grid">
                        <div className="panel-field">
                          <label htmlFor="ref-mascota-tipo">Tipo / Especie</label>
                          <select
                            id="ref-mascota-tipo"
                            value={formMascota.tipo}
                            onChange={(e) =>
                              setFormMascota({ ...formMascota, tipo: e.target.value })
                            }
                          >
                            <option value="Perro">🐶 Perro</option>
                            <option value="Gato">🐱 Gato</option>
                            {tipoLegacyMascota && (
                              <option value={tipoLegacyMascota}>
                                {tipoLegacyMascota} (registro previo)
                              </option>
                            )}
                          </select>
                        </div>

                        <div className="panel-field">
                          <label htmlFor="ref-mascota-tamano">Tamaño</label>
                          <select
                            id="ref-mascota-tamano"
                            value={formMascota.tamano}
                            onChange={(e) =>
                              setFormMascota({ ...formMascota, tamano: e.target.value })
                            }
                          >
                            <option value="Pequeño">Pequeño</option>
                            <option value="Mediano">Mediano</option>
                            <option value="Grande">Grande</option>
                          </select>
                        </div>
                      </div>

                      <div className="panel-field">
                        <label htmlFor="ref-mascota-desc">Descripción</label>
                        <textarea
                          id="ref-mascota-desc"
                          rows="3"
                          placeholder="Personalidad, vacunas, cuidados especiales..."
                          value={formMascota.descripcion}
                          onChange={(e) =>
                            setFormMascota({
                              ...formMascota,
                              descripcion: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="panel-field">
                        <label htmlFor="ref-mascota-img">Foto de la mascota</label>
                        <input
                          id="ref-mascota-img"
                          type="file"
                          accept="image/*"
                          onChange={manejarSeleccionImagen}
                        />
                      </div>

                      {previewImagen && (
                        <div>
                          <img
                            src={previewImagen}
                            alt="Vista previa"
                            style={{
                              width: "150px",
                              height: "150px",
                              objectFit: "cover",
                              borderRadius: "10px",
                              border: "2px solid var(--border)",
                            }}
                          />
                        </div>
                      )}

                      <div>
                        <button
                          type="submit"
                          className="panel-btn-primary"
                          disabled={guardandoMascota}
                        >
                          {subiendoImagen
                            ? "Subiendo imagen..."
                            : guardandoMascota
                            ? "Guardando..."
                            : editandoMascotaId !== null
                            ? "Actualizar mascota"
                            : "Publicar mascota"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {mascotas.length === 0 ? (
                  <div className="state-box" style={{ margin: "1rem auto" }}>
                    <div className="state-box-icon">🐾</div>
                    <h3>Aún no hay mascotas registradas</h3>
                    <p>Publica tu primer perro o gato para que aparezca en el catálogo de adopción.</p>
                    <button
                      type="button"
                      className="panel-btn-primary"
                      onClick={abrirNuevaMascota}
                    >
                      + Publicar mascota
                    </button>
                  </div>
                ) : (
                  <div className="panel-pets-grid">
                    {mascotas.map((m) => (
                      <article className="panel-pet-card" key={m.id}>
                        <div className="panel-pet-media">
                          {m.imagen ? (
                            <img src={m.imagen} alt={m.nombre} />
                          ) : (
                            <span style={{ fontSize: "3.2rem" }}>
                              {m.tipo === "Gato" ? "🐱" : "🐶"}
                            </span>
                          )}
                          <span
                            className={`badge-estado ${estadoBadgeClass(
                              m.estado
                            )} panel-pet-badge-float`}
                          >
                            {m.estado}
                          </span>
                        </div>

                        <div className="panel-pet-body">
                          <div className="panel-pet-title">
                            <h3>{m.nombre}</h3>
                            <span>{m.tipo === "Gato" ? "🐱" : "🐶"}</span>
                          </div>

                          <div className="panel-pet-chips">
                            <span className="panel-chip">{m.tipo}</span>
                            <span className="panel-chip">
                              {m.edad} {m.edad === 1 ? "año" : "años"}
                            </span>
                            <span className="panel-chip">
                              {m["tamaño"] || m.tamano}
                            </span>
                          </div>

                          <p className="panel-pet-desc">
                            {m.descripcion || "Sin descripción registrada."}
                          </p>

                          <div className="panel-pet-actions">
                            <button
                              type="button"
                              className="btn-table btn-table-edit"
                              onClick={() => abrirEditarMascota(m)}
                            >
                              ✏️ Editar
                            </button>
                            {m.estado !== "Retirada" && (
                              <button
                                type="button"
                                className="btn-table btn-table-danger"
                                onClick={() => setMascotaARetirar(m)}
                              >
                                🗑️ Retirar
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* ================= SOLICITUDES ================= */}
            {seccion === "solicitudes" && (
              <section className="panel-section-card">
                <div className="panel-section-header">
                  <div>
                    <h2>Solicitudes de adopción</h2>
                    <p>
                      Haz clic en cualquier solicitud para ver el perfil completo del adoptante y tomar una decisión.
                    </p>
                  </div>

                  <div className="panel-filter-pills">
                    {["Todas", "Pendiente", "Aprobada", "Rechazada"].map((est) => (
                      <button
                        key={est}
                        type="button"
                        className={`panel-pill ${
                          filtroSolicitudes === est ? "active" : ""
                        }`}
                        onClick={() => setFiltroSolicitudes(est)}
                      >
                        {est}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="panel-table-wrap">
                  <table className="panel-table">
                    <thead>
                      <tr>
                        <th>Mascota</th>
                        <th>Solicitante</th>
                        <th>Ciudad y Teléfono</th>
                        <th>Vivienda</th>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitudesFiltradas.map((sol) => (
                        <tr
                          key={sol.id}
                          className="panel-row-clickable"
                          onClick={() => abrirModalSolicitud(sol)}
                        >
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                              {sol.imagen_mascota ? (
                                <img
                                  src={sol.imagen_mascota}
                                  alt={sol.nombre_mascota}
                                  className="panel-thumb"
                                />
                              ) : (
                                <span style={{ fontSize: "1.4rem" }}>🐾</span>
                              )}
                              <div>
                                <strong>{sol.nombre_mascota}</strong>
                                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                  {sol.tipo_mascota}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <strong>{sol.solicitante?.nombre}</strong>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                              {sol.solicitante?.correo}
                            </div>
                          </td>
                          <td>
                            <div>{sol.ciudad}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                              {sol.telefono}
                            </div>
                          </td>
                          <td>{sol.vivienda}</td>
                          <td>
                            {sol.fecha
                              ? new Date(sol.fecha).toLocaleDateString("es-CO")
                              : "-"}
                          </td>
                          <td>
                            <span
                              className={`badge-estado ${estadoBadgeClass(sol.estado)}`}
                            >
                              {sol.estado}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn-table btn-table-edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                abrirModalSolicitud(sol);
                              }}
                            >
                              Ver perfil
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {solicitudesFiltradas.length === 0 && (
                    <div className="state-box" style={{ margin: "1.5rem auto" }}>
                      <div className="state-box-icon">📋</div>
                      <h3>Sin solicitudes en esta categoría</h3>
                      <p>No hay solicitudes registradas con el filtro "{filtroSolicitudes}".</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ================= HISTORIAL ================= */}
            {seccion === "historial" && (
              <section className="panel-section-card">
                <div className="panel-section-header">
                  <div>
                    <h2>Historial de adopciones</h2>
                    <p>Adopciones aprobadas y entregadas por tu refugio.</p>
                  </div>
                </div>

                <div className="panel-table-wrap">
                  <table className="panel-table">
                    <thead>
                      <tr>
                        <th>Mascota</th>
                        <th>Adoptante</th>
                        <th>Correo</th>
                        <th>Teléfono</th>
                        <th>Ciudad</th>
                        <th>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historial.map((item) => (
                        <tr key={item.adopcion_id}>
                          <td>
                            <strong>{item.nombre_mascota}</strong> ({item.tipo_mascota})
                          </td>
                          <td>{item.adoptante_nombre}</td>
                          <td>{item.adoptante_correo}</td>
                          <td>{item.telefono}</td>
                          <td>{item.ciudad}</td>
                          <td>
                            {item.fecha_adopcion
                              ? new Date(item.fecha_adopcion).toLocaleDateString("es-CO")
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {historial.length === 0 && (
                    <p style={{ padding: "1rem 0", color: "var(--text-muted)" }}>
                      Todavía no hay adopciones aprobadas registradas.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* ================= PERFIL ================= */}
            {seccion === "perfil" && (
              <section className="panel-profile-grid">
                <div className="panel-section-card">
                  <div className="panel-section-header">
                    <div>
                      <h2>Datos del refugio</h2>
                      <p>Mantén actualizada la información de contacto de tu refugio.</p>
                    </div>
                  </div>

                  {errorPerfil && (
                    <div className="panel-alert-error">{errorPerfil}</div>
                  )}
                  {exitoPerfil && (
                    <div className="panel-alert-success">{exitoPerfil}</div>
                  )}

                  <form className="panel-form" onSubmit={guardarPerfil}>
                    <div className="panel-field">
                      <label htmlFor="perfil-nombre-refugio">Nombre del refugio</label>
                      <input
                        id="perfil-nombre-refugio"
                        type="text"
                        value={perfil.nombre_refugio}
                        onChange={(e) =>
                          setPerfil({ ...perfil, nombre_refugio: e.target.value })
                        }
                        minLength={2}
                        required
                      />
                    </div>

                    <div className="panel-field">
                      <label htmlFor="perfil-responsable">Responsable</label>
                      <input
                        id="perfil-responsable"
                        type="text"
                        value={perfil.nombre_responsable}
                        onChange={(e) =>
                          setPerfil({ ...perfil, nombre_responsable: e.target.value })
                        }
                        minLength={2}
                        required
                      />
                    </div>

                    <div className="panel-field">
                      <label htmlFor="perfil-correo">Correo institucional</label>
                      <input
                        id="perfil-correo"
                        type="email"
                        value={perfil.correo}
                        readOnly
                      />
                    </div>

                    <div className="panel-form-grid">
                      <div className="panel-field">
                        <label htmlFor="perfil-telefono">Teléfono</label>
                        <input
                          id="perfil-telefono"
                          type="text"
                          value={perfil.telefono}
                          onChange={(e) =>
                            setPerfil({ ...perfil, telefono: e.target.value })
                          }
                          minLength={7}
                          required
                        />
                      </div>

                      <div className="panel-field">
                        <label htmlFor="perfil-ciudad">Ciudad</label>
                        <input
                          id="perfil-ciudad"
                          type="text"
                          value={perfil.ciudad}
                          onChange={(e) =>
                            setPerfil({ ...perfil, ciudad: e.target.value })
                          }
                          minLength={2}
                          required
                        />
                      </div>
                    </div>

                    <div className="panel-field">
                      <label htmlFor="perfil-direccion">Dirección</label>
                      <input
                        id="perfil-direccion"
                        type="text"
                        value={perfil.direccion}
                        onChange={(e) =>
                          setPerfil({ ...perfil, direccion: e.target.value })
                        }
                        minLength={5}
                        required
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="panel-btn-blue"
                        disabled={guardandoPerfil}
                      >
                        {guardandoPerfil ? "Guardando..." : "Guardar cambios"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="panel-section-card">
                  <div className="panel-section-header">
                    <div>
                      <h2>Seguridad</h2>
                      <p>Actualiza la contraseña de tu cuenta de refugio.</p>
                    </div>
                  </div>

                  {errorPass && <div className="panel-alert-error">{errorPass}</div>}
                  {exitoPass && <div className="panel-alert-success">{exitoPass}</div>}

                  <form className="panel-form" onSubmit={cambiarPassword}>
                    <div className="panel-field">
                      <label htmlFor="pass-actual">Contraseña actual</label>
                      <input
                        id="pass-actual"
                        type="password"
                        value={passwordForm.password_actual}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            password_actual: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="panel-field">
                      <label htmlFor="pass-nueva">Nueva contraseña (mín. 12 caracteres)</label>
                      <input
                        id="pass-nueva"
                        type="password"
                        minLength={12}
                        value={passwordForm.nueva_password}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            nueva_password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="panel-field">
                      <label htmlFor="pass-confirmar">Confirmar nueva contraseña</label>
                      <input
                        id="pass-confirmar"
                        type="password"
                        minLength={12}
                        value={passwordForm.confirmar_nueva_password}
                        onChange={(e) =>
                          setPasswordForm({
                            ...passwordForm,
                            confirmar_nueva_password: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="panel-btn-primary"
                        disabled={guardandoPass}
                      >
                        {guardandoPass ? "Actualizando..." : "Cambiar contraseña"}
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {/* ================= MODAL PERFIL COMPLETO DE SOLICITUD ================= */}
      {solicitudActiva && (
        <div
          className="rp-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={cerrarModalSolicitud}
        >
          <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rp-modal-header">
              <div>
                <h3>Perfil completo de solicitud #{solicitudActiva.id}</h3>
                <p>
                  Recibida el{" "}
                  {solicitudActiva.fecha
                    ? new Date(solicitudActiva.fecha).toLocaleString("es-CO")
                    : "-"}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span
                  className={`badge-estado ${estadoBadgeClass(
                    solicitudActiva.estado
                  )}`}
                >
                  {solicitudActiva.estado}
                </span>
                <button
                  type="button"
                  className="rp-modal-close"
                  onClick={cerrarModalSolicitud}
                  aria-label="Cerrar ventana"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="rp-modal-body">
              {/* Mascota deseada */}
              <div className="rp-modal-pet-banner">
                {solicitudActiva.imagen_mascota ? (
                  <img
                    src={solicitudActiva.imagen_mascota}
                    alt={solicitudActiva.nombre_mascota}
                  />
                ) : (
                  <div
                    style={{
                      width: "84px",
                      height: "84px",
                      borderRadius: "8px",
                      background: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2.2rem",
                    }}
                  >
                    🐾
                  </div>
                )}
                <div>
                  <span className="rp-detail-label">Mascota solicitada</span>
                  <h4 style={{ margin: "0 0 4px", fontSize: "1.15rem", color: "var(--primary-dark)" }}>
                    {solicitudActiva.nombre_mascota}
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--text-main)" }}>
                    {solicitudActiva.tipo_mascota}
                    {solicitudActiva.edad_mascota !== undefined && solicitudActiva.edad_mascota !== null
                      ? ` · ${solicitudActiva.edad_mascota} ${
                          solicitudActiva.edad_mascota === 1 ? "año" : "años"
                        }`
                      : ""}
                    {solicitudActiva.tamano_mascota
                      ? ` · ${solicitudActiva.tamano_mascota}`
                      : ""}
                    {solicitudActiva.estado_mascota
                      ? ` · Estado actual: ${solicitudActiva.estado_mascota}`
                      : ""}
                  </p>
                </div>
              </div>

              {/* Datos del solicitante y respuestas */}
              <div className="rp-detail-grid">
                <div className="rp-detail-item">
                  <span className="rp-detail-label">Nombre del solicitante</span>
                  <span className="rp-detail-value">
                    {solicitudActiva.solicitante?.nombre || "No disponible"}
                  </span>
                </div>

                <div className="rp-detail-item">
                  <span className="rp-detail-label">Correo electrónico</span>
                  <span className="rp-detail-value">
                    {solicitudActiva.solicitante?.correo || "No disponible"}
                  </span>
                </div>

                <div className="rp-detail-item">
                  <span className="rp-detail-label">Teléfono de contacto</span>
                  <span className="rp-detail-value">{solicitudActiva.telefono}</span>
                </div>

                <div className="rp-detail-item">
                  <span className="rp-detail-label">Ciudad de residencia</span>
                  <span className="rp-detail-value">{solicitudActiva.ciudad}</span>
                </div>

                <div className="rp-detail-item">
                  <span className="rp-detail-label">Tipo de vivienda</span>
                  <span className="rp-detail-value">{solicitudActiva.vivienda}</span>
                </div>

                <div className="rp-detail-item">
                  <span className="rp-detail-label">¿Tiene otras mascotas?</span>
                  <span className="rp-detail-value">{solicitudActiva.otras_mascotas}</span>
                </div>

                <div className="rp-detail-item">
                  <span className="rp-detail-label">Convivencia en el hogar</span>
                  <span className="rp-detail-value">
                    {solicitudActiva.convivencia || "No especificada"}
                  </span>
                </div>

                <div className="rp-detail-item">
                  <span className="rp-detail-label">Experiencia previa con mascotas</span>
                  <span className="rp-detail-value">
                    {solicitudActiva.experiencia_mascotas || "No especificada"}
                  </span>
                </div>

                <div className="rp-detail-item full">
                  <span className="rp-detail-label">Motivo de adopción</span>
                  <span className="rp-detail-value">{solicitudActiva.motivo}</span>
                </div>

                <div className="rp-detail-item full">
                  <span className="rp-detail-label">Referencias</span>
                  <span className="rp-detail-value">
                    {solicitudActiva.referencias || "No especificadas"}
                  </span>
                </div>

                {solicitudActiva.motivo_rechazo && (
                  <div
                    className="rp-detail-item full"
                    style={{ background: "#fef2f2", borderColor: "#fecaca" }}
                  >
                    <span className="rp-detail-label" style={{ color: "#b91c1c" }}>
                      Motivo de rechazo registrado
                    </span>
                    <span className="rp-detail-value" style={{ color: "#991b1b" }}>
                      {solicitudActiva.motivo_rechazo}
                    </span>
                  </div>
                )}
              </div>

              {errorModalSol && (
                <div className="panel-alert-error" style={{ marginBottom: 0 }}>
                  ⚠️ {errorModalSol}
                </div>
              )}

              {/* Paso de confirmación dentro del modal */}
              {accionSolicitud === "aprobar" && (
                <div className="rp-confirm-box">
                  <strong>Confirmar aprobación de adopción</strong>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>
                    Al aprobar esta solicitud, la mascota <strong>{solicitudActiva.nombre_mascota}</strong> pasará a estado <strong>Adoptada</strong> y se registrará en tu historial.
                  </p>
                  <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="rp-btn-approve"
                      disabled={procesandoSol}
                      onClick={confirmarRespuestaSolicitud}
                    >
                      {procesandoSol ? "Procesando..." : "Sí, aprobar adopción"}
                    </button>
                    <button
                      type="button"
                      className="rp-btn-secondary"
                      disabled={procesandoSol}
                      onClick={() => setAccionSolicitud(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {accionSolicitud === "rechazar" && (
                <div className="rp-confirm-box danger">
                  <strong>Rechazar solicitud de adopción</strong>
                  <p style={{ margin: 0, fontSize: "0.9rem" }}>
                    Indica el motivo del rechazo para el adoptante (mínimo 5 caracteres).
                  </p>
                  <textarea
                    rows="3"
                    placeholder="Ej. El espacio de vivienda no se ajusta al tamaño de la mascota..."
                    value={motivoRechazoSol}
                    onChange={(e) => setMotivoRechazoSol(e.target.value)}
                    disabled={procesandoSol}
                  />
                  <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
                    <button
                      type="button"
                      className="rp-btn-danger"
                      disabled={procesandoSol}
                      onClick={confirmarRespuestaSolicitud}
                    >
                      {procesandoSol ? "Procesando..." : "Confirmar rechazo"}
                    </button>
                    <button
                      type="button"
                      className="rp-btn-secondary"
                      disabled={procesandoSol}
                      onClick={() => setAccionSolicitud(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="rp-modal-footer">
              <button
                type="button"
                className="rp-btn-secondary"
                onClick={cerrarModalSolicitud}
                disabled={procesandoSol}
              >
                Cerrar
              </button>

              {solicitudActiva.estado === "Pendiente" && !accionSolicitud && (
                <>
                  <button
                    type="button"
                    className="rp-btn-danger"
                    onClick={() => {
                      setErrorModalSol("");
                      setAccionSolicitud("rechazar");
                    }}
                  >
                    Rechazar solicitud
                  </button>
                  <button
                    type="button"
                    className="rp-btn-approve"
                    onClick={() => {
                      setErrorModalSol("");
                      setAccionSolicitud("aprobar");
                    }}
                  >
                    Aprobar adopción
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL CONFIRMACIÓN RETIRAR MASCOTA ================= */}
      {mascotaARetirar && (
        <div
          className="rp-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => !retirandoMascota && setMascotaARetirar(null)}
        >
          <div
            className="rp-modal rp-modal-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rp-modal-header">
              <div>
                <h3>Confirmar retiro de mascota</h3>
                <p>Esta acción quitará a la mascota del catálogo público</p>
              </div>
              <button
                type="button"
                className="rp-modal-close"
                onClick={() => !retirandoMascota && setMascotaARetirar(null)}
              >
                ✕
              </button>
            </div>
            <div className="rp-modal-body">
              <p style={{ margin: 0, lineHeight: 1.55 }}>
                ¿Estás seguro de que deseas retirar a{" "}
                <strong>{mascotaARetirar.nombre}</strong>? Si ya tiene solicitudes de adopción asociadas, se conservará su historial marcándola como <em>Retirada</em>.
              </p>
            </div>
            <div className="rp-modal-footer">
              <button
                type="button"
                className="rp-btn-secondary"
                disabled={retirandoMascota}
                onClick={() => setMascotaARetirar(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rp-btn-danger"
                disabled={retirandoMascota}
                onClick={confirmarRetiroMascota}
              >
                {retirandoMascota ? "Retirando..." : "Sí, retirar mascota"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PanelRefugio;
