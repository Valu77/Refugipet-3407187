import "../../admin.css";
import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import NotificacionesCampana from "../../components/NotificacionesCampana";
import { API_URL } from "../../services/api";

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
    total_perros: 0,
    total_gatos: 0,
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
  const [tipoLegacyMascota, setTipoLegacyMascota] = useState(null);
  const [mascotaAEliminar, setMascotaAEliminar] = useState(null);
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
  const [busquedaRefugio, setBusquedaRefugio] = useState("");
  const [refugioDetalle, setRefugioDetalle] = useState(null);
  const [refugioSupervisado, setRefugioSupervisado] = useState(null);
  const [mascotasRefugio, setMascotasRefugio] = useState([]);
  const [cargandoMascotasRefugio, setCargandoMascotasRefugio] = useState(false);

  // Modal de confirmación/motivo para acciones sobre refugios
  const [modalAccionRefugio, setModalAccionRefugio] = useState(null); // { tipo: 'aprobar'|'rechazar'|'suspender'|'reactivar', refugio }
  const [motivoAccionRefugio, setMotivoAccionRefugio] = useState("");
  const [errorModalRefugio, setErrorModalRefugio] = useState("");
  const [procesandoRefugio, setProcesandoRefugio] = useState(false);

  // ================= ADOPCIONES =================
  const [adopciones, setAdopciones] = useState([]);
  const [cargandoAdopciones, setCargandoAdopciones] = useState(false);
  const [filtroAdopcion, setFiltroAdopcion] = useState("Todas");
  const [adopcionDetalle, setAdopcionDetalle] = useState(null);
  const [accionAdopcion, setAccionAdopcion] = useState(null); // 'aprobar' | 'rechazar'
  const [motivoRechazoAdop, setMotivoRechazoAdop] = useState("");
  const [procesandoAdop, setProcesandoAdop] = useState(false);

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

      if (respuesta.status === 401) {
        cerrarSesion();
        throw new Error("Tu sesión ha expirado.");
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
    } catch {
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

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      if (refugioDetalle) setRefugioDetalle(null);
      if (refugioSupervisado) setRefugioSupervisado(null);
      if (modalAccionRefugio && !procesandoRefugio) setModalAccionRefugio(null);
      if (adopcionDetalle && !procesandoAdop) setAdopcionDetalle(null);
      if (mascotaAEliminar) setMascotaAEliminar(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    refugioDetalle,
    refugioSupervisado,
    modalAccionRefugio,
    procesandoRefugio,
    adopcionDetalle,
    procesandoAdop,
    mascotaAEliminar,
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
    setTipoLegacyMascota(null);
    setErrorFormulario("");
  };

  const abrirFormularioAgregar = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  const abrirFormularioEditar = (mascota) => {
    setEditandoId(mascota.id);
    const tam = mascota["tamaño"] || mascota.tamano || "Mediano";
    const tipoActual = mascota.tipo || "Perro";
    setTipoLegacyMascota(
      tipoActual !== "Perro" && tipoActual !== "Gato" ? tipoActual : null
    );
    setNuevaMascota({
      nombre: mascota.nombre,
      tipo: tipoActual,
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

  const confirmarEliminarMascota = async () => {
    if (!mascotaAEliminar) return;
    setErrorGlobal("");
    setMensajeGlobal("");
    try {
      const resp = await fetchAdmin(`/mascotas/${mascotaAEliminar.id}`, {
        method: "DELETE",
      });
      setMascotaAEliminar(null);
      setMensajeGlobal(resp.mensaje || "Mascota actualizada.");
      await Promise.all([cargarMascotas(), cargarEstadisticas()]);
    } catch (err) {
      setErrorGlobal(err.message);
    }
  };

  // ================= GESTIÓN DE REFUGIOS =================
  const abrirAccionRefugio = (tipo, refugio) => {
    setModalAccionRefugio({ tipo, refugio });
    setMotivoAccionRefugio("");
    setErrorModalRefugio("");
  };

  const ejecutarAccionRefugio = async (e) => {
    if (e) e.preventDefault();
    if (!modalAccionRefugio) return;

    const { tipo, refugio } = modalAccionRefugio;

    if ((tipo === "rechazar" || tipo === "suspender") && motivoAccionRefugio.trim().length < 5) {
      setErrorModalRefugio("Debes escribir un motivo de al menos 5 caracteres.");
      return;
    }

    setProcesandoRefugio(true);
    setErrorModalRefugio("");
    setErrorGlobal("");
    setMensajeGlobal("");

    try {
      let endpoint = `/admin/refugios/${refugio.id}/${tipo}`;
      let fetchOpts = { method: "PUT" };

      if (tipo === "rechazar") {
        fetchOpts.headers = { "Content-Type": "application/json" };
        fetchOpts.body = JSON.stringify({
          estado: "rechazado",
          motivo_rechazo: motivoAccionRefugio.trim(),
        });
      } else if (tipo === "suspender") {
        fetchOpts.headers = { "Content-Type": "application/json" };
        fetchOpts.body = JSON.stringify({
          estado: "suspendido",
          motivo_suspension: motivoAccionRefugio.trim(),
        });
      }

      const actualizado = await fetchAdmin(endpoint, fetchOpts);

      const textos = {
        aprobar: `Refugio "${refugio.nombre_refugio}" aprobado correctamente.`,
        rechazar: `Solicitud de "${refugio.nombre_refugio}" rechazada.`,
        suspender: `Refugio "${refugio.nombre_refugio}" suspendido correctamente.`,
        reactivar: `Refugio "${refugio.nombre_refugio}" reactivado correctamente.`,
      };
      setMensajeGlobal(textos[tipo]);
      setModalAccionRefugio(null);
      setMotivoAccionRefugio("");
      if (refugioDetalle && refugioDetalle.id === refugio.id) {
        setRefugioDetalle(actualizado);
      }

      await Promise.all([
        cargarRefugios(filtroRefugio),
        cargarMascotas(),
        cargarEstadisticas(),
      ]);
    } catch (err) {
      setErrorModalRefugio(err.message);
    } finally {
      setProcesandoRefugio(false);
    }
  };

  const verMascotasDeRefugio = async (refugio) => {
    if (refugio.estado !== "aprobado") {
      setErrorGlobal("Solo se pueden consultar las mascotas de refugios aprobados.");
      return;
    }
    setErrorGlobal("");
    setRefugioSupervisado(refugio);
    setCargandoMascotasRefugio(true);
    try {
      const lista = await fetchAdmin(`/admin/refugios/${refugio.id}/mascotas`);
      setMascotasRefugio(lista);
    } catch (err) {
      setErrorGlobal(err.message);
      setRefugioSupervisado(null);
    } finally {
      setCargandoMascotasRefugio(false);
    }
  };

  // ================= GESTIÓN DE ADOPCIONES =================
  const abrirDetalleAdopcion = (adop) => {
    setAdopcionDetalle(adop);
    setAccionAdopcion(null);
    setMotivoRechazoAdop("");
  };

  const confirmarRespuestaAdopcion = async () => {
    if (!adopcionDetalle || !accionAdopcion) return;
    const nuevoEstado = accionAdopcion === "aprobar" ? "Aprobada" : "Rechazada";
    if (nuevoEstado === "Rechazada" && motivoRechazoAdop.trim().length < 5) {
      setErrorGlobal("Escribe un motivo de al menos 5 caracteres para rechazar la solicitud.");
      return;
    }

    setProcesandoAdop(true);
    setErrorGlobal("");
    setMensajeGlobal("");
    try {
      await fetchAdmin(`/adopciones/${adopcionDetalle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: nuevoEstado,
          motivo_rechazo:
            nuevoEstado === "Rechazada" ? motivoRechazoAdop.trim() : null,
        }),
      });
      setMensajeGlobal(`Solicitud #${adopcionDetalle.id} marcada como "${nuevoEstado}".`);
      setAdopcionDetalle(null);
      setAccionAdopcion(null);
      await Promise.all([cargarAdopciones(), cargarMascotas(), cargarEstadisticas()]);
    } catch (err) {
      setErrorGlobal(err.message);
    } finally {
      setProcesandoAdop(false);
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

  const refugiosFiltrados = refugios.filter((r) => {
    const q = busquedaRefugio.trim().toLowerCase();
    if (!q) return true;
    return (
      (r.nombre_refugio || "").toLowerCase().includes(q) ||
      (r.nombre_responsable || "").toLowerCase().includes(q) ||
      (r.ciudad || "").toLowerCase().includes(q) ||
      (r.correo || "").toLowerCase().includes(q)
    );
  });

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
            <p>Supervisa refugios por estado, mascotas, usuarios, adopciones y mensajes</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <NotificacionesCampana compact />
            <div className="admin-user">Administrador</div>
          </div>
        </header>

        {errorGlobal && <div className="admin-alerta-error">⚠️ {errorGlobal}</div>}
        {mensajeGlobal && <div className="admin-alerta-exito">✅ {mensajeGlobal}</div>}

        {/* ================= INICIO ================= */}
        {seccion === "inicio" && (
          <section>
            <div className="admin-bienvenida">
              <h2>Bienvenido al panel de RefugiPet</h2>
              <p>
                Revisa solicitudes de nuevos refugios, aprueba o suspende organizaciones con trazabilidad, supervisa mascotas y gestiona solicitudes generales.
              </p>
            </div>

            <div className="admin-estadisticas">
              <div className="estadistica-card">
                <h3>{estadisticas.total_refugios}</h3>
                <p>Refugios ({estadisticas.refugios_pendientes} pendientes)</p>
              </div>

              <div className="estadistica-card">
                <h3>{estadisticas.total_mascotas}</h3>
                <p>
                  Mascotas ({estadisticas.total_perros} perros · {estadisticas.total_gatos} gatos)
                </p>
              </div>

              <div className="estadistica-card">
                <h3>{estadisticas.total_usuarios}</h3>
                <p>Adoptantes registrados</p>
              </div>

              <div className="estadistica-card">
                <h3>{estadisticas.total_adopciones}</h3>
                <p>Adopciones ({estadisticas.adopciones_pendientes} pendientes)</p>
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
                <h2>Gestión Profesional de Refugios</h2>
                <p>
                  Consulta la ficha de cada refugio y ejecuta únicamente las acciones válidas para su estado actual.
                </p>
              </div>
            </div>

            <div className="admin-toolbar">
              <div className="admin-filtros" style={{ marginBottom: 0 }}>
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

              <input
                type="search"
                className="admin-search-input"
                placeholder="Buscar por refugio, responsable, ciudad o correo..."
                value={busquedaRefugio}
                onChange={(e) => setBusquedaRefugio(e.target.value)}
              />
            </div>

            {cargandoRefugios ? (
              <p>Cargando refugios...</p>
            ) : (
              <div className="admin-tabla">
                <table>
                  <thead>
                    <tr>
                      <th>Refugio</th>
                      <th>Responsable</th>
                      <th>Contacto y Ciudad</th>
                      <th>Mascotas</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refugiosFiltrados.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong>{r.nombre_refugio}</strong>
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>
                            ID #{r.id}
                          </div>
                          {r.estado === "rechazado" && r.motivo_rechazo && (
                            <div className="admin-motivo-chip">
                              Rechazo: {r.motivo_rechazo}
                            </div>
                          )}
                          {r.estado === "suspendido" && r.motivo_suspension && (
                            <div className="admin-motivo-chip">
                              Suspensión: {r.motivo_suspension}
                            </div>
                          )}
                        </td>
                        <td>{r.nombre_responsable}</td>
                        <td>
                          <div>{r.correo}</div>
                          <div style={{ fontSize: "12px", color: "#6b7280" }}>
                            {r.telefono} · {r.ciudad}
                          </div>
                        </td>
                        <td>
                          {r.estado === "aprobado" ? (
                            <strong>{r.total_mascotas ?? 0}</strong>
                          ) : (
                            <span style={{ color: "#9ca3af", fontSize: "12px" }}>
                              No habilitado
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={claseEstado(r.estado)}>{r.estado}</span>
                        </td>
                        <td>
                          <div className="acciones" style={{ flexWrap: "wrap" }}>
                            <button
                              type="button"
                              onClick={() => setRefugioDetalle(r)}
                            >
                              Ver ficha
                            </button>

                            {r.estado === "pendiente" && (
                              <>
                                <button
                                  type="button"
                                  className="aprobar"
                                  onClick={() => abrirAccionRefugio("aprobar", r)}
                                >
                                  Aprobar
                                </button>
                                <button
                                  type="button"
                                  className="eliminar"
                                  onClick={() => abrirAccionRefugio("rechazar", r)}
                                >
                                  Rechazar
                                </button>
                              </>
                            )}

                            {r.estado === "aprobado" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => verMascotasDeRefugio(r)}
                                >
                                  Ver mascotas
                                </button>
                                <button
                                  type="button"
                                  className="eliminar"
                                  onClick={() => abrirAccionRefugio("suspender", r)}
                                >
                                  Suspender
                                </button>
                              </>
                            )}

                            {r.estado === "suspendido" && (
                              <button
                                type="button"
                                className="aprobar"
                                onClick={() => abrirAccionRefugio("reactivar", r)}
                              >
                                Reactivar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {refugiosFiltrados.length === 0 && (
                  <p style={{ padding: "1rem", color: "#6b7280" }}>
                    No se encontraron refugios con los filtros aplicados.
                  </p>
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
                <p>Publica perros o gatos generales y supervisa todas las mascotas.</p>
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
                      {tipoLegacyMascota && (
                        <option value={tipoLegacyMascota}>
                          {tipoLegacyMascota} (registro previo)
                        </option>
                      )}
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
                            onClick={() => setMascotaAEliminar(mascota)}
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
                <p>Consulta todas las solicitudes reales y revisa su detalle completo.</p>
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
                      <th>Ciudad y contacto</th>
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
                          <div>{adopcion.ciudad}</div>
                          <div style={{ fontSize: "12px", color: "#777" }}>
                            {adopcion.telefono}
                          </div>
                        </td>
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
                          <div className="acciones">
                            <button
                              type="button"
                              onClick={() => abrirDetalleAdopcion(adopcion)}
                            >
                              Ver detalle
                            </button>
                          </div>
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

      {/* ================= MODAL FICHA DETALLADA DEL REFUGIO ================= */}
      {refugioDetalle && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setRefugioDetalle(null)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Ficha del refugio: {refugioDetalle.nombre_refugio}</h3>
                <p>
                  Registrado el{" "}
                  {refugioDetalle.creado_en
                    ? new Date(refugioDetalle.creado_en).toLocaleDateString("es-CO")
                    : "-"}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className={claseEstado(refugioDetalle.estado)}>
                  {refugioDetalle.estado}
                </span>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => setRefugioDetalle(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="admin-modal-body">
              <div className="admin-detail-grid">
                <div className="admin-detail-box">
                  <span>Nombre del refugio</span>
                  <strong>{refugioDetalle.nombre_refugio}</strong>
                </div>
                <div className="admin-detail-box">
                  <span>Responsable</span>
                  <strong>{refugioDetalle.nombre_responsable}</strong>
                </div>
                <div className="admin-detail-box">
                  <span>Correo electrónico</span>
                  <strong>{refugioDetalle.correo || "No disponible"}</strong>
                </div>
                <div className="admin-detail-box">
                  <span>Teléfono</span>
                  <strong>{refugioDetalle.telefono}</strong>
                </div>
                <div className="admin-detail-box">
                  <span>Ciudad</span>
                  <strong>{refugioDetalle.ciudad}</strong>
                </div>
                <div className="admin-detail-box">
                  <span>Dirección</span>
                  <strong>{refugioDetalle.direccion}</strong>
                </div>
                <div className="admin-detail-box">
                  <span>Estado actual</span>
                  <strong style={{ textTransform: "capitalize" }}>{refugioDetalle.estado}</strong>
                </div>
                <div className="admin-detail-box">
                  <span>Mascotas registradas</span>
                  <strong>
                    {refugioDetalle.estado === "aprobado"
                      ? refugioDetalle.total_mascotas ?? 0
                      : "No habilitado (requiere aprobación activa)"}
                  </strong>
                </div>

                {refugioDetalle.estado === "rechazado" && refugioDetalle.motivo_rechazo && (
                  <div
                    className="admin-detail-box full"
                    style={{ background: "#fef2f2", borderColor: "#fecaca" }}
                  >
                    <span style={{ color: "#b91c1c" }}>Motivo del rechazo</span>
                    <strong style={{ color: "#991b1b" }}>
                      {refugioDetalle.motivo_rechazo}
                    </strong>
                  </div>
                )}

                {refugioDetalle.estado === "suspendido" && refugioDetalle.motivo_suspension && (
                  <div
                    className="admin-detail-box full"
                    style={{ background: "#fef2f2", borderColor: "#fecaca" }}
                  >
                    <span style={{ color: "#b91c1c" }}>Motivo de la suspensión</span>
                    <strong style={{ color: "#991b1b" }}>
                      {refugioDetalle.motivo_suspension}
                    </strong>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-sec"
                onClick={() => setRefugioDetalle(null)}
              >
                Cerrar
              </button>

              {refugioDetalle.estado === "pendiente" && (
                <>
                  <button
                    type="button"
                    className="admin-btn-danger"
                    onClick={() => {
                      const target = refugioDetalle;
                      setRefugioDetalle(null);
                      abrirAccionRefugio("rechazar", target);
                    }}
                  >
                    Rechazar solicitud
                  </button>
                  <button
                    type="button"
                    className="admin-btn-ok"
                    onClick={() => {
                      const target = refugioDetalle;
                      setRefugioDetalle(null);
                      abrirAccionRefugio("aprobar", target);
                    }}
                  >
                    Aprobar refugio
                  </button>
                </>
              )}

              {refugioDetalle.estado === "aprobado" && (
                <>
                  <button
                    type="button"
                    className="admin-btn-sec"
                    onClick={() => {
                      const target = refugioDetalle;
                      setRefugioDetalle(null);
                      verMascotasDeRefugio(target);
                    }}
                  >
                    Ver mascotas
                  </button>
                  <button
                    type="button"
                    className="admin-btn-danger"
                    onClick={() => {
                      const target = refugioDetalle;
                      setRefugioDetalle(null);
                      abrirAccionRefugio("suspender", target);
                    }}
                  >
                    Suspender refugio
                  </button>
                </>
              )}

              {refugioDetalle.estado === "suspendido" && (
                <button
                  type="button"
                  className="admin-btn-ok"
                  onClick={() => {
                    const target = refugioDetalle;
                    setRefugioDetalle(null);
                    abrirAccionRefugio("reactivar", target);
                  }}
                >
                  Reactivar refugio
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL MASCOTAS DEL REFUGIO APROBADO ================= */}
      {refugioSupervisado && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setRefugioSupervisado(null)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Mascotas de {refugioSupervisado.nombre_refugio}</h3>
                <p>
                  {refugioSupervisado.ciudad} · Responsable: {refugioSupervisado.nombre_responsable}
                </p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setRefugioSupervisado(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {cargandoMascotasRefugio ? (
                <p>Cargando mascotas del refugio...</p>
              ) : mascotasRefugio.length === 0 ? (
                <p style={{ color: "#6b7280", margin: 0 }}>
                  Este refugio aprobado todavía no ha publicado mascotas.
                </p>
              ) : (
                <div className="admin-modal-pets-grid">
                  {mascotasRefugio.map((m) => (
                    <div className="admin-modal-pet-item" key={m.id}>
                      {m.imagen ? (
                        <img src={m.imagen} alt={m.nombre} />
                      ) : (
                        <div
                          style={{
                            height: "130px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "2.5rem",
                            background: "#eaf4ff",
                          }}
                        >
                          {m.tipo === "Gato" ? "🐱" : "🐶"}
                        </div>
                      )}
                      <div style={{ padding: "10px 12px" }}>
                        <strong style={{ display: "block", color: "#075f99" }}>
                          {m.nombre}
                        </strong>
                        <p style={{ margin: "3px 0 8px", fontSize: "12px", color: "#6b7280" }}>
                          {m.tipo} · {m.edad} {m.edad === 1 ? "año" : "años"} ·{" "}
                          {m["tamaño"] || m.tamano}
                        </p>
                        <span className={claseEstado(m.estado)}>{m.estado}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-sec"
                onClick={() => setRefugioSupervisado(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL CONFIRMACIÓN / MOTIVO ACCIÓN REFUGIO ================= */}
      {modalAccionRefugio && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => !procesandoRefugio && setModalAccionRefugio(null)}
        >
          <div className="admin-modal sm" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={ejecutarAccionRefugio}>
              <div className="admin-modal-header">
                <div>
                  <h3>
                    {modalAccionRefugio.tipo === "aprobar" && "Aprobar refugio"}
                    {modalAccionRefugio.tipo === "rechazar" && "Rechazar solicitud de refugio"}
                    {modalAccionRefugio.tipo === "suspender" && "Suspender refugio"}
                    {modalAccionRefugio.tipo === "reactivar" && "Reactivar refugio"}
                  </h3>
                  <p>{modalAccionRefugio.refugio.nombre_refugio}</p>
                </div>
                <button
                  type="button"
                  className="admin-modal-close"
                  disabled={procesandoRefugio}
                  onClick={() => setModalAccionRefugio(null)}
                >
                  ✕
                </button>
              </div>

              <div className="admin-modal-body">
                {errorModalRefugio && (
                  <div className="admin-alerta-error" style={{ marginBottom: 0 }}>
                    ⚠️ {errorModalRefugio}
                  </div>
                )}

                {modalAccionRefugio.tipo === "aprobar" && (
                  <p style={{ margin: 0, lineHeight: 1.5 }}>
                    ¿Confirmas aprobar al refugio{" "}
                    <strong>{modalAccionRefugio.refugio.nombre_refugio}</strong>? Podrá iniciar sesión, publicar mascotas y gestionar solicitudes de adopción.
                  </p>
                )}

                {modalAccionRefugio.tipo === "reactivar" && (
                  <p style={{ margin: 0, lineHeight: 1.5 }}>
                    ¿Confirmas reactivar al refugio{" "}
                    <strong>{modalAccionRefugio.refugio.nombre_refugio}</strong>? Sus funciones y mascotas volverán a estar habilitadas.
                  </p>
                )}

                {(modalAccionRefugio.tipo === "rechazar" ||
                  modalAccionRefugio.tipo === "suspender") && (
                  <>
                    <p style={{ margin: 0, lineHeight: 1.5 }}>
                      {modalAccionRefugio.tipo === "rechazar"
                        ? "Indica el motivo del rechazo. El refugio verá esta justificación si intenta iniciar sesión."
                        : "Indica el motivo obligatorio de la suspensión. Todas las funciones y mascotas de este refugio quedarán bloqueadas."}
                    </p>
                    <textarea
                      className="admin-modal-textarea"
                      rows="3"
                      placeholder="Escribe el motivo (mínimo 5 caracteres)..."
                      value={motivoAccionRefugio}
                      onChange={(e) => setMotivoAccionRefugio(e.target.value)}
                      required
                      minLength={5}
                      disabled={procesandoRefugio}
                    />
                  </>
                )}
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-sec"
                  disabled={procesandoRefugio}
                  onClick={() => setModalAccionRefugio(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={
                    modalAccionRefugio.tipo === "aprobar" ||
                    modalAccionRefugio.tipo === "reactivar"
                      ? "admin-btn-ok"
                      : "admin-btn-danger"
                  }
                  disabled={procesandoRefugio}
                >
                  {procesandoRefugio ? "Procesando..." : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL DETALLE DE ADOPCIÓN (ADMIN) ================= */}
      {adopcionDetalle && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => !procesandoAdop && setAdopcionDetalle(null)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Solicitud de adopción #{adopcionDetalle.id}</h3>
                <p>
                  {adopcionDetalle.mascota_nombre} ·{" "}
                  {adopcionDetalle.refugio_nombre || "RefugiPet (General)"}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className={claseEstado(adopcionDetalle.estado)}>
                  {adopcionDetalle.estado}
                </span>
                <button
                  type="button"
                  className="admin-modal-close"
                  onClick={() => !procesandoAdop && setAdopcionDetalle(null)}
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="admin-modal-body">
              <div className="admin-detail-grid">
                <div className="admin-detail-box">
                  <span>Solicitante</span>
                  <strong>{adopcionDetalle.usuario_nombre}</strong>
                </div>
                <div className="admin-detail-box">
                  <span>Correo</span>
                  <strong>{adopcionDetalle.usuario_correo}</strong>
                </div>
                <div className="admin-detail-box">
                  <span>Teléfono</span>
                  <strong>{adopcionDetalle.telefono}</strong>
                </div>
                <div className="admin-detail-box">
                  <span>Ciudad</span>
                  <strong>{adopcionDetalle.ciudad}</strong>
                </div>
                <div className="admin-detail-box">
                  <span>Vivienda</span>
                  <strong>{adopcionDetalle.vivienda}</strong>
                </div>
                <div className="admin-detail-box">
                  <span>Otras mascotas</span>
                  <strong>{adopcionDetalle.otras_mascotas}</strong>
                </div>
                <div className="admin-detail-box">
                  <span>Convivencia</span>
                  <strong>{adopcionDetalle.convivencia || "No especificada"}</strong>
                </div>
                <div className="admin-detail-box">
                  <span>Experiencia</span>
                  <strong>{adopcionDetalle.experiencia_mascotas || "No especificada"}</strong>
                </div>
                <div className="admin-detail-box full">
                  <span>Motivo de adopción</span>
                  <strong>{adopcionDetalle.motivo}</strong>
                </div>
                <div className="admin-detail-box full">
                  <span>Referencias</span>
                  <strong>{adopcionDetalle.referencias || "No especificadas"}</strong>
                </div>
                {adopcionDetalle.motivo_rechazo && (
                  <div
                    className="admin-detail-box full"
                    style={{ background: "#fef2f2", borderColor: "#fecaca" }}
                  >
                    <span style={{ color: "#b91c1c" }}>Motivo de rechazo</span>
                    <strong style={{ color: "#991b1b" }}>
                      {adopcionDetalle.motivo_rechazo}
                    </strong>
                  </div>
                )}
              </div>

              {accionAdopcion === "rechazar" && (
                <div>
                  <label style={{ display: "block", fontWeight: 700, marginBottom: "6px", color: "#b91c1c" }}>
                    Motivo del rechazo (mín. 5 caracteres)
                  </label>
                  <textarea
                    className="admin-modal-textarea"
                    rows="3"
                    value={motivoRechazoAdop}
                    onChange={(e) => setMotivoRechazoAdop(e.target.value)}
                    placeholder="Indica la razón del rechazo..."
                  />
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-sec"
                disabled={procesandoAdop}
                onClick={() => setAdopcionDetalle(null)}
              >
                Cerrar
              </button>

              {adopcionDetalle.estado === "Pendiente" && !accionAdopcion && (
                <>
                  <button
                    type="button"
                    className="admin-btn-danger"
                    onClick={() => setAccionAdopcion("rechazar")}
                  >
                    Rechazar
                  </button>
                  <button
                    type="button"
                    className="admin-btn-ok"
                    onClick={() => {
                      setAccionAdopcion("aprobar");
                    }}
                  >
                    Aprobar
                  </button>
                </>
              )}

              {accionAdopcion && (
                <button
                  type="button"
                  className={accionAdopcion === "aprobar" ? "admin-btn-ok" : "admin-btn-danger"}
                  disabled={procesandoAdop}
                  onClick={confirmarRespuestaAdopcion}
                >
                  {procesandoAdop ? "Guardando..." : "Confirmar decisión"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL CONFIRMACIÓN ELIMINAR MASCOTA ================= */}
      {mascotaAEliminar && (
        <div
          className="admin-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={() => setMascotaAEliminar(null)}
        >
          <div className="admin-modal sm" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3>Confirmar eliminación</h3>
                <p>Mascota: {mascotaAEliminar.nombre}</p>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setMascotaAEliminar(null)}
              >
                ✕
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: 0, lineHeight: 1.5 }}>
                ¿Seguro que quieres eliminar o retirar a{" "}
                <strong>{mascotaAEliminar.nombre}</strong>? Si tiene solicitudes de adopción registradas, se conservará el historial marcándola como <em>Retirada</em>.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                className="admin-btn-sec"
                onClick={() => setMascotaAEliminar(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="admin-btn-danger"
                onClick={confirmarEliminarMascota}
              >
                Sí, confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
