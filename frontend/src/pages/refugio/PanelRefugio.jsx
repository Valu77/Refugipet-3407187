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

  // Estado formulario de mascotas
  const [mostrarFormMascota, setMostrarFormMascota] = useState(false);
  const [editandoMascotaId, setEditandoMascotaId] = useState(null);
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
    } catch (_e) {
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
    setErrorMascota("");
  };

  const abrirNuevaMascota = () => {
    limpiarFormMascota();
    setMostrarFormMascota(true);
  };

  const abrirEditarMascota = (mascota) => {
    setEditandoMascotaId(mascota.id);
    const tam = mascota["tamaño"] || mascota.tamano || "Mediano";
    setFormMascota({
      nombre: mascota.nombre,
      tipo: mascota.tipo,
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

  const retirarMascota = async (mascota) => {
    const confirmar = window.confirm(
      `¿Seguro que deseas retirar o eliminar a "${mascota.nombre}"?`
    );
    if (!confirmar) return;

    setMensajeExito("");
    setErrorGeneral("");
    try {
      const resp = await fetchAuth(`/refugio/mascotas/${mascota.id}`, {
        method: "DELETE",
      });
      setMensajeExito(resp.mensaje || "Mascota retirada correctamente.");
      await cargarTodo();
    } catch (err) {
      setErrorGeneral(err.message);
    }
  };

  // ================= SOLICITUDES =================
  const responderSolicitud = async (adopcionId, nuevoEstado) => {
    const accion = nuevoEstado === "Aprobada" ? "aprobar" : "rechazar";
    if (
      !window.confirm(
        `¿Confirmas que deseas ${accion} esta solicitud de adopción?`
      )
    ) {
      return;
    }

    setErrorGeneral("");
    setMensajeExito("");
    try {
      const resp = await fetchAuth(`/refugio/adopciones/${adopcionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      setMensajeExito(resp.mensaje || "Solicitud actualizada.");
      await cargarTodo();
    } catch (err) {
      setErrorGeneral(err.message);
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

      // Sincronizar nombre en localStorage si cambió el responsable
      try {
        const u = JSON.parse(localStorage.getItem("usuario") || "null");
        if (u && actualizado.nombre_responsable) {
          u.nombre = actualizado.nombre_responsable;
          localStorage.setItem("usuario", JSON.stringify(u));
        }
      } catch (_e) {
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
              Gestiona tus mascotas, solicitudes de adopción y perfil institucional
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
                  <h2>
                    Bienvenido, {perfil.nombre_refugio || "Refugio"}
                  </h2>
                  <p>
                    Desde este panel puedes publicar tus mascotas disponibles para adopción, revisar solicitudes de adoptantes y consultar tu historial de adopciones aprobadas.
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
                    <p>Publica, edita o retira las mascotas a tu cargo.</p>
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
                    {mostrarFormMascota ? "Cancelar" : "+ Agregar mascota"}
                  </button>
                </div>

                {mostrarFormMascota && (
                  <div className="panel-form-box">
                    <h3>
                      {editandoMascotaId !== null
                        ? "Editar mascota"
                        : "Nueva mascota del refugio"}
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
                            <option value="Perro">Perro</option>
                            <option value="Gato">Gato</option>
                            <option value="Ave">Ave</option>
                            <option value="Conejo">Conejo</option>
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
                              width: "140px",
                              height: "140px",
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
                            : "Guardar mascota"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="panel-table-wrap">
                  <table className="panel-table">
                    <thead>
                      <tr>
                        <th>Foto</th>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Tamaño</th>
                        <th>Edad</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mascotas.map((m) => (
                        <tr key={m.id}>
                          <td>
                            {m.imagen ? (
                              <img
                                src={m.imagen}
                                alt={m.nombre}
                                className="panel-thumb"
                              />
                            ) : (
                              "🐾"
                            )}
                          </td>
                          <td>
                            <strong>{m.nombre}</strong>
                          </td>
                          <td>{m.tipo}</td>
                          <td>{m["tamaño"] || m.tamano}</td>
                          <td>
                            {m.edad} {m.edad === 1 ? "año" : "años"}
                          </td>
                          <td>
                            <span className={`badge-estado ${estadoBadgeClass(m.estado)}`}>
                              {m.estado}
                            </span>
                          </td>
                          <td>
                            <div className="panel-actions">
                              <button
                                type="button"
                                className="btn-table btn-table-edit"
                                onClick={() => abrirEditarMascota(m)}
                              >
                                Editar
                              </button>
                              {m.estado !== "Retirada" && (
                                <button
                                  type="button"
                                  className="btn-table btn-table-danger"
                                  onClick={() => retirarMascota(m)}
                                >
                                  Retirar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {mascotas.length === 0 && (
                    <p style={{ padding: "1rem 0", color: "var(--text-muted)" }}>
                      No hay mascotas registradas todavía en este refugio.
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* ================= SOLICITUDES ================= */}
            {seccion === "solicitudes" && (
              <section className="panel-section-card">
                <div className="panel-section-header">
                  <div>
                    <h2>Solicitudes de adopción</h2>
                    <p>Evalúa y responde las solicitudes para las mascotas de tu refugio.</p>
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
                        <th>Contacto</th>
                        <th>Hogar</th>
                        <th>Motivo</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {solicitudesFiltradas.map((sol) => (
                        <tr key={sol.id}>
                          <td>
                            <strong>{sol.nombre_mascota}</strong>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                              {sol.tipo_mascota}
                            </div>
                          </td>
                          <td>
                            <strong>{sol.solicitante?.nombre}</strong>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                              {sol.solicitante?.correo}
                            </div>
                          </td>
                          <td>
                            <div>{sol.telefono}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                              {sol.ciudad}
                            </div>
                          </td>
                          <td>
                            <div>{sol.vivienda}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                              Otras mascotas: {sol.otras_mascotas}
                            </div>
                          </td>
                          <td style={{ maxWidth: "240px" }}>{sol.motivo}</td>
                          <td>
                            <span
                              className={`badge-estado ${estadoBadgeClass(sol.estado)}`}
                            >
                              {sol.estado}
                            </span>
                          </td>
                          <td>
                            {sol.estado === "Pendiente" ? (
                              <div className="panel-actions">
                                <button
                                  type="button"
                                  className="btn-table btn-table-approve"
                                  onClick={() =>
                                    responderSolicitud(sol.id, "Aprobada")
                                  }
                                >
                                  Aprobar
                                </button>
                                <button
                                  type="button"
                                  className="btn-table btn-table-danger"
                                  onClick={() =>
                                    responderSolicitud(sol.id, "Rechazada")
                                  }
                                >
                                  Rechazar
                                </button>
                              </div>
                            ) : (
                              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                                Gestionada
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {solicitudesFiltradas.length === 0 && (
                    <p style={{ padding: "1rem 0", color: "var(--text-muted)" }}>
                      No hay solicitudes en esta categoría.
                    </p>
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
    </div>
  );
}

export default PanelRefugio;
