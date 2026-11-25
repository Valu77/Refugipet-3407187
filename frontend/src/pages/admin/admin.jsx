import "../../admin.css";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const API_URL = "http://127.0.0.1:8000/api";

function claseEstado(estado) {
  const e = (estado || "").toLowerCase();
  if (e === "disponible" || e === "aprobado" || e === "aprobada" || e === "leído") {
    return "estado-admin disponible-admin";
  }
  if (e === "adoptada") {
    return "estado-admin adoptada-admin";
  }
  if (e === "rechazado" || e === "rechazada" || e === "suspendido" || e === "retirada") {
    return "estado-admin rechazado-admin";
  }
  return "estado-admin proceso-admin";
}

function Admin() {
  const navigate = useNavigate();

  const [seccion, setSeccion] = useState("inicio");
  const [mensajeGlobal, setMensajeGlobal] = useState("");
  const [errorGlobal, setErrorGlobal] = useState("");

  // ================= ESTADÍSTICAS =================
  const [estadisticas, setEstadisticas] = useState({
    total_usuarios: 0,
    total_refugios: 0,
    refugios_pendientes: 0,
    refugios_aprobados: 0,
    total_mascotas: 0,
    mascotas_disponibles: 0,
    mascotas_adoptadas: 0,
    total_adopciones: 0,
    adopciones_pendientes: 0,
    contactos_no_leidos: 0,
  });

  // ================= MASCOTAS =================
  const [mascotas, setMascotas] = useState([]);
  const [cargandoMascotas, setCargandoMascotas] = useState(true);
  const [errorMascotas, setErrorMascotas] = useState("");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState("");
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [nuevaMascota, setNuevaMascota] = useState({
    nombre: "",
    tipo: "Perro",
    edad: "",
    tamano: "Mediano",
    descripcion: "",
  });

  // ================= USUARIOS =================
  const [usuarios, setUsuarios] = useState([]);

  // ================= REFUGIOS =================
  const [refugios, setRefugios] = useState([]);
  const [cargandoRefugios, setCargandoRefugios] = useState(false);
  const [filtroRefugio, setFiltroRefugio] = useState("todos");
  const [refugioRechazando, setRefugioRechazando] = useState(null);
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [refugioSupervisado, setRefugioSupervisado] = useState(null);
  const [mascotasRefugio, setMascotasRefugio] = useState([]);

  // ================= ADOPCIONES =================
  const [adopciones, setAdopciones] = useState([]);
  const [cargandoAdopciones, setCargandoAdopciones] = useState(false);
  const [filtroAdopcion, setFiltroAdopcion] = useState("Todas");

  // ================= MENSAJES =================
  const [mensajes, setMensajes] = useState([]);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);

  const obtenerToken = () => localStorage.getItem("token");

  const cerrarSesion = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/iniciosesion");
  }, [navigate]);

  const fetchAdmin = useCallback(
    async (ruta, options = {}) => {
      const respuesta = await fetch(`${API_URL}${ruta}`, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${obtenerToken()}`,
        },
      });

      if (respuesta.status === 401 || respuesta.status === 403) {
        cerrarSesion();
        throw new Error("Sesión no autorizada.");
      }

      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) {
        const msg = Array.isArray(datos.detail)
          ? datos.detail.map((d) => d.msg || d).join(", ")
          : datos.detail || "No se pudo completar la operación.";
        throw new Error(msg);
      }
      return datos;
    },
    [cerrarSesion]
  );

  const cargarEstadisticas = useCallback(async () => {
    try {
      const datos = await fetchAdmin("/admin/estadisticas");
      setEstadisticas(datos);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    }
  }, [fetchAdmin]);

  const cargarUsuarios = useCallback(async () => {
    try {
      const datos = await fetchAdmin("/auth/usuarios");
      setUsuarios(datos);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    }
  }, [fetchAdmin]);

  const cargarMascotas = useCallback(async () => {
    setCargandoMascotas(true);
    setErrorMascotas("");
    try {
      const datos = await fetchAdmin("/admin/mascotas");
      setMascotas(datos);
    } catch (err) {
      setErrorMascotas(err.message || "No se pudo conectar con el servidor.");
    } finally {
      setCargandoMascotas(false);
    }
  }, [fetchAdmin]);

  const cargarRefugios = useCallback(
    async (estadoFiltro = filtroRefugio) => {
      setCargandoRefugios(true);
      try {
        const query =
          estadoFiltro && estadoFiltro !== "todos"
            ? `?estado=${encodeURIComponent(estadoFiltro)}`
            : "";
        const datos = await fetchAdmin(`/admin/refugios${query}`);
        setRefugios(datos);
      } catch (err) {
        setErrorGlobal(err.message);
      } finally {
        setCargandoRefugios(false);
      }
    },
    [fetchAdmin, filtroRefugio]
  );

  const cargarAdopciones = useCallback(async () => {
    setCargandoAdopciones(true);
    try {
      const datos = await fetchAdmin("/adopciones/");
      setAdopciones(datos);
    } catch (err) {
      setErrorGlobal(err.message);
    } finally {
      setCargandoAdopciones(false);
    }
  }, [fetchAdmin]);

  const cargarMensajes = useCallback(async () => {
    setCargandoMensajes(true);
    try {
      const datos = await fetchAdmin("/contactos/");
      setMensajes(datos);
    } catch (err) {
      setErrorGlobal(err.message);
    } finally {
      setCargandoMensajes(false);
    }
  }, [fetchAdmin]);

  useEffect(() => {
    const token = obtenerToken();
    let usuario = null;
    try {
      usuario = JSON.parse(localStorage.getItem("usuario") || "null");
    } catch (_e) {
      usuario = null;
    }

    if (!token || !usuario || usuario.rol !== "admin") {
      navigate("/iniciosesion");
      return;
    }

    cargarEstadisticas();
    cargarUsuarios();
    cargarMascotas();
    cargarRefugios("todos");
    cargarAdopciones();
    cargarMensajes();
  }, [
    navigate,
    cargarEstadisticas,
    cargarUsuarios,
    cargarMascotas,
    cargarRefugios,
    cargarAdopciones,
    cargarMensajes,
  ]);

  // ================= MASCOTAS FORM =================
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setNuevaMascota((prev) => ({ ...prev, [name]: value }));
  };

  const manejarSeleccionImagen = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    setArchivoImagen(archivo);
    setPreviewImagen(URL.createObjectURL(archivo));
  };

  const limpiarFormulario = () => {
    setNuevaMascota({
      nombre: "",
      tipo: "Perro",
      edad: "",
      tamano: "Mediano",
      descripcion: "",
    });
    setArchivoImagen(null);
    setPreviewImagen("");
    setEditandoId(null);
    setErrorFormulario("");
  };

  const abrirFormularioAgregar = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (mascota) => {
    setEditandoId(mascota.id);
    const tam = mascota["tamaño"] || mascota.tamano || "Mediano";
    setNuevaMascota({
      nombre: mascota.nombre,
      tipo: mascota.tipo,
      edad: String(mascota.edad),
      tamano: tam.toLowerCase() === "pequeno" ? "Pequeño" : tam,
      descripcion: mascota.descripcion || "",
    });
    setArchivoImagen(null);
    setPreviewImagen(mascota.imagen || "");
    setErrorFormulario("");
    setMostrarFormulario(true);
  };

  const cancelarFormulario = () => {
    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const guardarMascota = async (e) => {
    e.preventDefault();
    setErrorFormulario("");
    setGuardando(true);

    try {
      let urlImagen = previewImagen && !archivoImagen ? previewImagen : "";

      if (archivoImagen) {
        setSubiendoImagen(true);
        const formData = new FormData();
        formData.append("archivo", archivoImagen);

        const respuestaImagen = await fetch(`${API_URL}/mascotas/subir-imagen`, {
          method: "POST",
          headers: { Authorization: `Bearer ${obtenerToken()}` },
          body: formData,
        });

        const datosImagen = await respuestaImagen.json();
        if (!respuestaImagen.ok) {
          throw new Error(datosImagen.detail || "No se pudo subir la imagen");
        }
        urlImagen = datosImagen.url;
        setSubiendoImagen(false);
      }

      const cuerpo = {
        nombre: nuevaMascota.nombre.trim(),
        tipo: nuevaMascota.tipo,
        edad: Number(nuevaMascota.edad),
        tamaño: nuevaMascota.tamano,
        descripcion: nuevaMascota.descripcion.trim() || null,
        imagen: urlImagen || null,
      };

      const esEdicion = editandoId !== null;
      await fetchAdmin(esEdicion ? `/mascotas/${editandoId}` : "/mascotas/", {
        method: esEdicion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cuerpo),
      });

      limpiarFormulario();
      setMostrarFormulario(false);
      setMensajeGlobal(
        esEdicion ? "Mascota actualizada correctamente." : "Mascota registrada."
      );
      await Promise.all([cargarMascotas(), cargarEstadisticas()]);
    } catch (err) {
      setErrorFormulario(err.message);
    } finally {
      setGuardando(false);
      setSubiendoImagen(false);
    }
  };

  const eliminarMascota = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar o retirar esta mascota?")) return;
    setErrorGlobal("");
    setMensajeGlobal("");
    try {
      const resp = await fetchAdmin(`/mascotas/${id}`, { method: "DELETE" });
      setMensajeGlobal(resp.mensaje || "Mascota actualizada.");
      await Promise.all([cargarMascotas(), cargarEstadisticas()]);
    } catch (err) {
      setErrorGlobal(err.message);
    }
  };

  // ================= GESTIÓN DE REFUGIOS =================
  const aprobarRefugio = async (refugio) => {
    if (!window.confirm(`¿Aprobar al refugio "${refugio.nombre_refugio}"?`)) return;
    setErrorGlobal("");
    setMensajeGlobal("");
    try {
      await fetchAdmin(`/admin/refugios/${refugio.id}/aprobar`, { method: "PUT" });
      setMensajeGlobal(`Refugio "${refugio.nombre_refugio}" aprobado.`);
      await Promise.all([cargarRefugios(filtroRefugio), cargarEstadisticas()]);
    } catch (err) {
      setErrorGlobal(err.message);
    }
  };

  const confirmarRechazoRefugio = async (e) => {
    e.preventDefault();
    if (!refugioRechazando) return;
    if (motivoRechazo.trim().length < 5) {
      setErrorGlobal("El motivo de rechazo debe tener al menos 5 caracteres.");
      return;
    }
    setErrorGlobal("");
    setMensajeGlobal("");
    try {
      await fetchAdmin(`/admin/refugios/${refugioRechazando.id}/rechazar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: "rechazado",
          motivo_rechazo: motivoRechazo.trim(),
        }),
      });
      setMensajeGlobal(`Refugio "${refugioRechazando.nombre_refugio}" rechazado.`);
      setRefugioRechazando(null);
      setMotivoRechazo("");
      await Promise.all([cargarRefugios(filtroRefugio), cargarEstadisticas()]);
    } catch (err) {
      setErrorGlobal(err.message);
    }
  };

  const suspenderRefugio = async (refugio) => {
    if (!window.confirm(`¿Suspender temporalmente al refugio "${refugio.nombre_refugio}"?`)) {
      return;
    }
    setErrorGlobal("");
    setMensajeGlobal("");
    try {
      await fetchAdmin(`/admin/refugios/${refugio.id}/suspender`, { method: "PUT" });
      setMensajeGlobal(`Refugio "${refugio.nombre_refugio}" suspendido.`);
      await Promise.all([cargarRefugios(filtroRefugio), cargarEstadisticas()]);
    } catch (err) {
      setErrorGlobal(err.message);
    }
  };

  const reactivarRefugio = async (refugio) => {
    if (!window.confirm(`¿Reactivar al refugio "${refugio.nombre_refugio}"?`)) return;
    setErrorGlobal("");
    setMensajeGlobal("");
    try {
      await fetchAdmin(`/admin/refugios/${refugio.id}/reactivar`, { method: "PUT" });
      setMensajeGlobal(`Refugio "${refugio.nombre_refugio}" reactivado.`);
      await Promise.all([cargarRefugios(filtroRefugio), cargarEstadisticas()]);
    } catch (err) {
      setErrorGlobal(err.message);
    }
  };

  const verMascotasDeRefugio = async (refugio) => {
    setErrorGlobal("");
    try {
      const lista = await fetchAdmin(`/admin/refugios/${refugio.id}/mascotas`);
      setRefugioSupervisado(refugio);
      setMascotasRefugio(lista);
    } catch (err) {
      setErrorGlobal(err.message);
    }
  };

  // ================= GESTIÓN DE ADOPCIONES =================
  const responderAdopcion = async (adopcionId, nuevoEstado) => {
    const verbo = nuevoEstado === "Aprobada" ? "aprobar" : "rechazar";
    if (!window.confirm(`¿Confirmas ${verbo} esta solicitud de adopción?`)) return;
    setErrorGlobal("");
    setMensajeGlobal("");
    try {
      await fetchAdmin(`/adopciones/${adopcionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      setMensajeGlobal(`Solicitud #${adopcionId} marcada como "${nuevoEstado}".`);
      await Promise.all([cargarAdopciones(), cargarMascotas(), cargarEstadisticas()]);
    } catch (err) {
      setErrorGlobal(err.message);
    }
  };

  // ================= GESTIÓN DE MENSAJES =================
  const cambiarEstadoMensaje = async (msg) => {
    const nuevoEstado = msg.estado === "No leído" ? "Leído" : "No leído";
    setErrorGlobal("");
    try {
      await fetchAdmin(`/contactos/${msg.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      await Promise.all([cargarMensajes(), cargarEstadisticas()]);
    } catch (err) {
      setErrorGlobal(err.message);
    }
  };

  const eliminarMensaje = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este mensaje?")) return;
    setErrorGlobal("");
    setMensajeGlobal("");
    try {
      await fetchAdmin(`/contactos/${id}`, { method: "DELETE" });
      setMensajeGlobal("Mensaje eliminado.");
      await Promise.all([cargarMensajes(), cargarEstadisticas()]);
    } catch (err) {
      setErrorGlobal(err.message);
    }
  };

  const adopcionesFiltradas = adopciones.filter((a) =>
    filtroAdopcion === "Todas" ? true : a.estado === filtroAdopcion
  );

  return (
    <div className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <img src={logo} alt="Logo RefugiPet" className="admin-logo-icon" />
          <div>
            <h2>RefugiPet</h2>
            <p>Panel Administrativo</p>
          </div>
        </div>

        <nav className="admin-menu">
          <button
            className={seccion === "inicio" ? "activo" : ""}
            onClick={() => setSeccion("inicio")}
          >
            Inicio
          </button>

          <button
            className={seccion === "refugios" ? "activo" : ""}
            onClick={() => {
              setSeccion("refugios");
              cargarRefugios(filtroRefugio);
            }}
          >
            Refugios
            {estadisticas.refugios_pendientes > 0 && (
              <span className="admin-menu-badge">
                {estadisticas.refugios_pendientes}
              </span>
            )}
          </button>

          <button
            className={seccion === "mascotas" ? "activo" : ""}
            onClick={() => setSeccion("mascotas")}
          >
            Mascotas
          </button>

          <button
            className={seccion === "usuarios" ? "activo" : ""}
            onClick={() => setSeccion("usuarios")}
          >
            Usuarios
          </button>

          <button
            className={seccion === "adopciones" ? "activo" : ""}
            onClick={() => {
              setSeccion("adopciones");
              cargarAdopciones();
            }}
          >
            Adopciones
            {estadisticas.adopciones_pendientes > 0 && (
              <span className="admin-menu-badge">
                {estadisticas.adopciones_pendientes}
              </span>
            )}
          </button>

          <button
            className={seccion === "mensajes" ? "activo" : ""}
            onClick={() => {
              setSeccion("mensajes");
              cargarMensajes();
            }}
          >
            Mensajes
            {estadisticas.contactos_no_leidos > 0 && (
              <span className="admin-menu-badge">
                {estadisticas.contactos_no_leidos}
              </span>
            )}
          </button>
        </nav>

        <div className="admin-salir">
          <Link to="/principal" style={{ marginBottom: "6px" }}>
            Ver sitio público
          </Link>
          <Link to="/iniciosesion" onClick={cerrarSesion}>
            Cerrar sesión
          </Link>
        </div>
      </aside>

      <main className="admin-contenido">
        <header className="admin-header">
          <div>
            <h1>Panel de Administración</h1>
            <p>Gestiona refugios, mascotas, usuarios, adopciones y mensajes de RefugiPet</p>
          </div>

          <div className="admin-user">Administrador</div>
        </header>

        {errorGlobal && <div className="admin-alerta-error">⚠️ {errorGlobal}</div>}
        {mensajeGlobal && <div className="admin-alerta-exito">✅ {mensajeGlobal}</div>}

        {/* ================= INICIO ================= */}
        {seccion === "inicio" && (
          <section>
            <div className="admin-bienvenida">
              <h2>Bienvenido al panel de RefugiPet</h2>
              <p>
                Supervisa toda la plataforma: aprueba nuevos refugios, administra mascotas generales, revisa adopciones y atiende mensajes de contacto.
              </p>
            </div>

            <div className="admin-estadisticas">
              <div className="estadistica-card">
                <h3>{estadisticas.total_refugios}</h3>
                <p>Refugios registrados ({estadisticas.refugios_pendientes} pendientes)</p>
              </div>

              <div className="estadistica-card">
                <h3>{estadisticas.total_mascotas}</h3>
                <p>Mascotas activas ({estadisticas.mascotas_disponibles} disponibles)</p>
              </div>

              <div className="estadistica-card">
                <h3>{estadisticas.total_usuarios}</h3>
                <p>Adoptantes registrados</p>
              </div>

              <div className="estadistica-card">
                <h3>{estadisticas.total_adopciones}</h3>
                <p>Solicitudes de adopción ({estadisticas.adopciones_pendientes} pendientes)</p>
              </div>

              <div className="estadistica-card">
                <h3>{mensajes.length}</h3>
                <p>Mensajes ({estadisticas.contactos_no_leidos} sin leer)</p>
              </div>
            </div>

            <div className="admin-seccion-titulo">
              <h2>Mascotas recientes</h2>
              <button onClick={() => setSeccion("mascotas")}>Ver todas</button>
            </div>

            <div className="admin-mascotas-recientes">
              {mascotas.slice(0, 3).map((mascota) => (
                <div className="admin-mascota-card" key={mascota.id}>
                  <div className="admin-mascota-icon">
                    {mascota.imagen ? (
                      <img
                        src={mascota.imagen}
                        alt={mascota.nombre}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      "🐾"
                    )}
                  </div>

                  <div>
                    <h3>{mascota.nombre}</h3>
                    <p>
                      {mascota.tipo} · {mascota.edad} {mascota.edad === 1 ? "año" : "años"}
                    </p>
                    <span className={claseEstado(mascota.estado)}>
                      {mascota.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ================= REFUGIOS ================= */}
        {seccion === "refugios" && (
          <section className="admin-tabla-seccion">
            <div className="admin-seccion-titulo">
              <div>
                <h2>Gestión de Refugios</h2>
                <p>Aprueba, rechaza, suspende o supervisa los refugios registrados.</p>
              </div>
            </div>

            <div className="admin-filtros">
              {["todos", "pendiente", "aprobado", "rechazado", "suspendido"].map((est) => (
                <button
                  key={est}
                  type="button"
                  className={`admin-filtro-btn ${filtroRefugio === est ? "activo" : ""}`}
                  onClick={() => {
                    setFiltroRefugio(est);
                    cargarRefugios(est);
                  }}
                >
                  {est.charAt(0).toUpperCase() + est.slice(1)}
                </button>
              ))}
            </div>

            {refugioRechazando && (
              <form className="admin-rechazo-box" onSubmit={confirmarRechazoRefugio}>
                <h3>Rechazar solicitud de "{refugioRechazando.nombre_refugio}"</h3>
                <textarea
                  rows="3"
                  placeholder="Escribe el motivo del rechazo (mínimo 5 caracteres)..."
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  required
                  minLength={5}
                />
                <div className="acciones">
                  <button type="submit" className="eliminar">
                    Confirmar rechazo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRefugioRechazando(null);
                      setMotivoRechazo("");
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            {cargandoRefugios ? (
              <p>Cargando refugios...</p>
            ) : (
              <div className="admin-tabla">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Refugio</th>
                      <th>Responsable</th>
                      <th>Correo / Teléfono</th>
                      <th>Ubicación</th>
                      <th>Mascotas</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refugios.map((r) => (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td>
                          <strong>{r.nombre_refugio}</strong>
                          {r.motivo_rechazo && (
                            <div style={{ fontSize: "12px", color: "#b91c1c", marginTop: "4px" }}>
                              Motivo: {r.motivo_rechazo}
                            </div>
                          )}
                        </td>
                        <td>{r.nombre_responsable}</td>
                        <td>
                          <div>{r.correo}</div>
                          <div style={{ fontSize: "12px", color: "#777" }}>{r.telefono}</div>
                        </td>
                        <td>
                          <div>{r.ciudad}</div>
                          <div style={{ fontSize: "12px", color: "#777" }}>{r.direccion}</div>
                        </td>
                        <td>{r.total_mascotas ?? 0}</td>
                        <td>
                          <span className={claseEstado(r.estado)}>{r.estado}</span>
                        </td>
                        <td>
                          <div className="acciones" style={{ flexWrap: "wrap" }}>
                            {r.estado === "pendiente" && (
                              <>
                                <button
                                  type="button"
                                  className="aprobar"
                                  onClick={() => aprobarRefugio(r)}
                                >
                                  Aprobar
                                </button>
                                <button
                                  type="button"
                                  className="eliminar"
                                  onClick={() => {
                                    setRefugioRechazando(r);
                                    setMotivoRechazo("");
                                  }}
                                >
                                  Rechazar
                                </button>
                              </>
                            )}
                            {r.estado === "aprobado" && (
                              <button
                                type="button"
                                className="eliminar"
                                onClick={() => suspenderRefugio(r)}
                              >
                                Suspender
                              </button>
                            )}
                            {(r.estado === "suspendido" || r.estado === "rechazado") && (
                              <button
                                type="button"
                                className="aprobar"
                                onClick={() => reactivarRefugio(r)}
                              >
                                Reactivar
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => verMascotasDeRefugio(r)}
                            >
                              Ver mascotas
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {refugios.length === 0 && (
                  <p style={{ padding: "1rem" }}>
                    No hay refugios registrados para este filtro.
                  </p>
                )}
              </div>
            )}

            {refugioSupervisado && (
              <div className="admin-supervision-box">
                <div className="admin-seccion-titulo" style={{ marginBottom: "12px" }}>
                  <div>
                    <h3>Mascotas de {refugioSupervisado.nombre_refugio}</h3>
                    <p>Supervisión de publicaciones del refugio</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRefugioSupervisado(null);
                      setMascotasRefugio([]);
                    }}
                  >
                    Cerrar vista
                  </button>
                </div>

                {mascotasRefugio.length === 0 ? (
                  <p>Este refugio aún no tiene mascotas registradas.</p>
                ) : (
                  <div className="admin-tabla">
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Nombre</th>
                          <th>Tipo</th>
                          <th>Tamaño</th>
                          <th>Edad</th>
                          <th>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mascotasRefugio.map((m) => (
                          <tr key={m.id}>
                            <td>{m.id}</td>
                            <td>{m.nombre}</td>
                            <td>{m.tipo}</td>
                            <td>{m["tamaño"] || m.tamano}</td>
                            <td>{m.edad} años</td>
                            <td>
                              <span className={claseEstado(m.estado)}>{m.estado}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* ================= MASCOTAS ================= */}
        {seccion === "mascotas" && (
          <section className="admin-tabla-seccion">
            <div className="admin-seccion-titulo">
              <div>
                <h2>Mascotas</h2>
                <p>Administra las mascotas generales y supervisa todas las registradas.</p>
              </div>

              <button
                className="admin-btn-principal"
                onClick={mostrarFormulario ? cancelarFormulario : abrirFormularioAgregar}
              >
                {mostrarFormulario ? "Cancelar" : "Agregar mascota"}
              </button>
            </div>

            {mostrarFormulario && (
              <form
                onSubmit={guardarMascota}
                style={{
                  background: "#fff",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  marginBottom: "1.5rem",
                  maxWidth: "520px",
                  border: "1px solid #dbe4ee",
                }}
              >
                <h3 style={{ margin: "0 0 0.5rem", color: "#075f99" }}>
                  {editandoId !== null ? "Editar mascota" : "Nueva mascota"}
                </h3>

                {errorFormulario && <p style={{ color: "red" }}>{errorFormulario}</p>}

                <label>
                  Nombre
                  <input
                    type="text"
                    name="nombre"
                    value={nuevaMascota.nombre}
                    onChange={manejarCambio}
                    required
                  />
                </label>

                <div className="admin-form-fila">
                  <label>
                    Tipo
                    <select name="tipo" value={nuevaMascota.tipo} onChange={manejarCambio}>
                      <option value="Perro">Perro</option>
                      <option value="Gato">Gato</option>
                      <option value="Ave">Ave</option>
                      <option value="Conejo">Conejo</option>
                    </select>
                  </label>

                  <label>
                    Tamaño
                    <select name="tamano" value={nuevaMascota.tamano} onChange={manejarCambio}>
                      <option value="Pequeño">Pequeño</option>
                      <option value="Mediano">Mediano</option>
                      <option value="Grande">Grande</option>
                    </select>
                  </label>
                </div>

                <label>
                  Edad (años)
                  <input
                    type="number"
                    name="edad"
                    value={nuevaMascota.edad}
                    onChange={manejarCambio}
                    min="0"
                    max="50"
                    required
                  />
                </label>

                <label>
                  Descripción
                  <textarea
                    name="descripcion"
                    value={nuevaMascota.descripcion}
                    onChange={manejarCambio}
                    rows="3"
                  />
                </label>

                <label>
                  Foto de la mascota
                  <div className="admin-file-input">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={manejarSeleccionImagen}
                    />
                  </div>
                </label>

                {previewImagen && (
                  <div className="admin-preview-imagen">
                    <img
                      src={previewImagen}
                      alt="Vista previa"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="admin-btn-principal"
                  disabled={guardando}
                >
                  {subiendoImagen
                    ? "Subiendo foto..."
                    : guardando
                    ? "Guardando..."
                    : editandoId !== null
                    ? "Actualizar mascota"
                    : "Guardar mascota"}
                </button>
              </form>
            )}

            {cargandoMascotas && <p>Cargando mascotas...</p>}
            {errorMascotas && <p style={{ color: "red" }}>{errorMascotas}</p>}

            {!cargandoMascotas && !errorMascotas && (
              <div className="admin-tabla">
                <table>
                  <thead>
                    <tr>
                      <th>Foto</th>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Origen</th>
                      <th>Tipo</th>
                      <th>Edad</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mascotas.map((mascota) => (
                      <tr key={mascota.id}>
                        <td>
                          {mascota.imagen ? (
                            <img
                              src={mascota.imagen}
                              alt={mascota.nombre}
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                borderRadius: "6px",
                              }}
                            />
                          ) : (
                            "🐾"
                          )}
                        </td>
                        <td>{mascota.id}</td>
                        <td>{mascota.nombre}</td>
                        <td>{mascota.nombre_refugio || "RefugiPet (General)"}</td>
                        <td>{mascota.tipo}</td>
                        <td>{mascota.edad} años</td>
                        <td>
                          <span className={claseEstado(mascota.estado)}>
                            {mascota.estado}
                          </span>
                        </td>
                        <td className="acciones">
                          <button onClick={() => abrirFormularioEditar(mascota)}>
                            Editar
                          </button>
                          <button
                            className="eliminar"
                            onClick={() => eliminarMascota(mascota.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {mascotas.length === 0 && (
                  <p style={{ padding: "1rem" }}>Todavía no hay mascotas registradas.</p>
                )}
              </div>
            )}
          </section>
        )}

        {/* ================= USUARIOS ================= */}
        {seccion === "usuarios" && (
          <section className="admin-tabla-seccion">
            <div className="admin-seccion-titulo">
              <div>
                <h2>Usuarios</h2>
                <p>Usuarios registrados en RefugiPet (adoptantes, refugios y administradores).</p>
              </div>
            </div>

            <div className="admin-tabla">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>{usuario.id}</td>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.correo}</td>
                      <td>
                        <span className="estado-admin disponible-admin">
                          {usuario.rol}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ================= ADOPCIONES ================= */}
        {seccion === "adopciones" && (
          <section className="admin-tabla-seccion">
            <div className="admin-seccion-titulo">
              <div>
                <h2>Solicitudes de adopción</h2>
                <p>Consulta todas las solicitudes reales registradas en la base de datos.</p>
              </div>
            </div>

            <div className="admin-filtros">
              {["Todas", "Pendiente", "Aprobada", "Rechazada"].map((est) => (
                <button
                  key={est}
                  type="button"
                  className={`admin-filtro-btn ${filtroAdopcion === est ? "activo" : ""}`}
                  onClick={() => setFiltroAdopcion(est)}
                >
                  {est}
                </button>
              ))}
            </div>

            {cargandoAdopciones ? (
              <p>Cargando solicitudes...</p>
            ) : (
              <div className="admin-tabla">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Solicitante</th>
                      <th>Mascota / Refugio</th>
                      <th>Hogar y contacto</th>
                      <th>Motivo</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adopcionesFiltradas.map((adopcion) => (
                      <tr key={adopcion.id}>
                        <td>{adopcion.id}</td>
                        <td>
                          <strong>{adopcion.usuario_nombre || `Usuario #${adopcion.usuario_id}`}</strong>
                          <div style={{ fontSize: "12px", color: "#777" }}>
                            {adopcion.usuario_correo}
                          </div>
                        </td>
                        <td>
                          <strong>{adopcion.mascota_nombre || `Mascota #${adopcion.mascota_id}`}</strong>
                          <div style={{ fontSize: "12px", color: "#777" }}>
                            {adopcion.refugio_nombre || "RefugiPet (General)"}
                          </div>
                        </td>
                        <td>
                          <div>{adopcion.telefono} · {adopcion.ciudad}</div>
                          <div style={{ fontSize: "12px", color: "#777" }}>
                            {adopcion.vivienda} · Otras mascotas: {adopcion.otras_mascotas}
                          </div>
                        </td>
                        <td style={{ maxWidth: "220px" }}>{adopcion.motivo}</td>
                        <td>
                          {adopcion.fecha
                            ? new Date(adopcion.fecha).toLocaleDateString("es-CO")
                            : "-"}
                        </td>
                        <td>
                          <span className={claseEstado(adopcion.estado)}>
                            {adopcion.estado}
                          </span>
                        </td>
                        <td>
                          {adopcion.estado === "Pendiente" ? (
                            <div className="acciones">
                              <button
                                type="button"
                                className="aprobar"
                                onClick={() => responderAdopcion(adopcion.id, "Aprobada")}
                              >
                                Aprobar
                              </button>
                              <button
                                type="button"
                                className="eliminar"
                                onClick={() => responderAdopcion(adopcion.id, "Rechazada")}
                              >
                                Rechazar
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#777" }}>Gestionada</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {adopcionesFiltradas.length === 0 && (
                  <p style={{ padding: "1rem" }}>
                    No hay solicitudes de adopción registradas para este filtro.
                  </p>
                )}
              </div>
            )}
          </section>
        )}

        {/* ================= MENSAJES ================= */}
        {seccion === "mensajes" && (
          <section className="admin-tabla-seccion">
            <div className="admin-seccion-titulo">
              <div>
                <h2>Mensajes de contacto</h2>
                <p>Mensajes almacenados en PostgreSQL desde los formularios de contacto.</p>
              </div>
            </div>

            {cargandoMensajes ? (
              <p>Cargando mensajes...</p>
            ) : mensajes.length === 0 ? (
              <div className="admin-bienvenida">
                <h3>No hay mensajes</h3>
                <p>Todavía no se han recibido mensajes desde el formulario de contacto.</p>
              </div>
            ) : (
              <div className="admin-tabla">
                <table>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Correo</th>
                      <th>Mensaje</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mensajes.map((mensaje) => (
                      <tr key={mensaje.id}>
                        <td>{mensaje.nombre}</td>
                        <td>{mensaje.correo}</td>
                        <td style={{ maxWidth: "280px" }}>{mensaje.mensaje}</td>
                        <td>
                          {mensaje.fecha
                            ? new Date(mensaje.fecha).toLocaleDateString("es-CO")
                            : "-"}
                        </td>
                        <td>
                          <span className={claseEstado(mensaje.estado)}>
                            {mensaje.estado}
                          </span>
                        </td>
                        <td className="acciones">
                          <button
                            type="button"
                            onClick={() => cambiarEstadoMensaje(mensaje)}
                          >
                            {mensaje.estado === "No leído"
                              ? "Marcar leído"
                              : "Marcar no leído"}
                          </button>
                          <button
                            type="button"
                            className="eliminar"
                            onClick={() => eliminarMensaje(mensaje.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default Admin;
