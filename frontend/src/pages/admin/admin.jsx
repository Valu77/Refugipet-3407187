import "../../admin.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";

const API_URL = "http://127.0.0.1:8000/api";

function Admin() {
  const [seccion, setSeccion] = useState("inicio");

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

  // ================= MENSAJES =================

  const [mensajes, setMensajes] = useState([]);

  const [nuevaMascota, setNuevaMascota] = useState({
    nombre: "",
    tipo: "Perro",
    edad: "",
    tamano: "Mediano",
    descripcion: "",
  });

  // ================= USUARIOS =================

  const [usuarios] = useState([
    {
      id: 1,
      nombre: "Juan Perez",
      correo: "juan@email.com",
      rol: "Usuario",
    },
    {
      id: 2,
      nombre: "Maria Gomez",
      correo: "maria@email.com",
      rol: "Usuario",
    },
    {
      id: 3,
      nombre: "Administrador",
      correo: "admin@refugipet.com",
      rol: "Administrador",
    },
  ]);

  const obtenerToken = () => localStorage.getItem("token");

  // ================= CARGAR MASCOTAS =================

  const cargarMascotas = async () => {
    setCargandoMascotas(true);
    setErrorMascotas("");

    try {
      const respuesta = await fetch(API_URL + "/mascotas/");

      if (!respuesta.ok) {
        throw new Error("No se pudieron cargar las mascotas");
      }

      const datos = await respuesta.json();
      setMascotas(datos);
    } catch (err) {
      setErrorMascotas("No se pudo conectar con el servidor.");
    } finally {
      setCargandoMascotas(false);
    }
  };

  useEffect(() => {
    cargarMascotas();
  }, []);

  // ================= CARGAR MENSAJES =================

  useEffect(() => {
    const mensajesGuardados = JSON.parse(
      localStorage.getItem("mensajesContacto") || "[]"
    );

    setMensajes(mensajesGuardados);
  }, [seccion]);

  // ================= CAMBIAR MASCOTA =================

  const manejarCambio = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setNuevaMascota(function (prev) {
      const copia = Object.assign({}, prev);
      copia[name] = value;
      return copia;
    });
  };

  // ================= SELECCIONAR IMAGEN =================

  const manejarSeleccionImagen = (e) => {
    const archivo = e.target.files[0];

    if (!archivo) return;

    setArchivoImagen(archivo);
    setPreviewImagen(URL.createObjectURL(archivo));
  };

  // ================= LIMPIAR FORMULARIO =================

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

  // ================= AGREGAR MASCOTA =================

  const abrirFormularioAgregar = () => {
    limpiarFormulario();
    setMostrarFormulario(true);
  };

  // ================= EDITAR MASCOTA =================

  const abrirFormularioEditar = (mascota) => {
    setEditandoId(mascota.id);

    setNuevaMascota({
      nombre: mascota.nombre,
      tipo: mascota.tipo,
      edad: String(mascota.edad),
      tamano: mascota["tamaño"] || mascota.tamano || "Mediano",
      descripcion: mascota.descripcion || "",
    });

    setArchivoImagen(null);
    setPreviewImagen(mascota.imagen || "");
    setErrorFormulario("");
    setMostrarFormulario(true);
  };

  // ================= CANCELAR =================

  const cancelarFormulario = () => {
    limpiarFormulario();
    setMostrarFormulario(false);
  };

  // ================= GUARDAR MASCOTA =================

  const guardarMascota = async (e) => {
    e.preventDefault();

    setErrorFormulario("");
    setGuardando(true);

    try {
      let urlImagen =
        previewImagen && !archivoImagen ? previewImagen : "";

      if (archivoImagen) {
        setSubiendoImagen(true);

        const formData = new FormData();

        formData.append("archivo", archivoImagen);

        const respuestaImagen = await fetch(
          API_URL + "/mascotas/subir-imagen",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + obtenerToken(),
            },
            body: formData,
          }
        );

        const datosImagen = await respuestaImagen.json();

        if (!respuestaImagen.ok) {
          throw new Error(
            datosImagen.detail || "No se pudo subir la imagen"
          );
        }

        urlImagen = datosImagen.url;

        setSubiendoImagen(false);
      }

      const cuerpo = {
        nombre: nuevaMascota.nombre,
        tipo: nuevaMascota.tipo,
        edad: Number(nuevaMascota.edad),
        "tamaño": nuevaMascota.tamano,
        descripcion: nuevaMascota.descripcion || null,
        imagen: urlImagen || null,
      };

      const esEdicion = editandoId !== null;

      const respuesta = await fetch(
        esEdicion
          ? API_URL + "/mascotas/" + editandoId
          : API_URL + "/mascotas/",
        {
          method: esEdicion ? "PUT" : "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + obtenerToken(),
          },

          body: JSON.stringify(cuerpo),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos.detail || "No se pudo guardar la mascota"
        );
      }

      if (esEdicion) {
        setMascotas(function (prev) {
          return prev.map(function (m) {
            return m.id === editandoId ? datos : m;
          });
        });
      } else {
        setMascotas(function (prev) {
          return [datos].concat(prev);
        });
      }

      limpiarFormulario();
      setMostrarFormulario(false);

    } catch (err) {
      setErrorFormulario(err.message);

    } finally {
      setGuardando(false);
      setSubiendoImagen(false);
    }
  };

  // ================= ELIMINAR MASCOTA =================

  const eliminarMascota = async (id) => {
    const confirmar = window.confirm(
      "Seguro que quieres eliminar esta mascota?"
    );

    if (!confirmar) return;

    try {
      const respuesta = await fetch(
        API_URL + "/mascotas/" + id,
        {
          method: "DELETE",

          headers: {
            Authorization: "Bearer " + obtenerToken(),
          },
        }
      );

      if (!respuesta.ok) {
        throw new Error(
          "No se pudo eliminar la mascota"
        );
      }

      setMascotas(function (prev) {
        return prev.filter(function (m) {
          return m.id !== id;
        });
      });

    } catch (err) {
      alert(err.message);
    }
  };

  // ================= ELIMINAR MENSAJE =================

  const eliminarMensaje = (id) => {
    const confirmar = window.confirm(
      "Seguro que quieres eliminar este mensaje?"
    );

    if (!confirmar) return;

    const mensajesActualizados = mensajes.filter(
      function (mensaje) {
        return mensaje.id !== id;
      }
    );

    localStorage.setItem(
      "mensajesContacto",
      JSON.stringify(mensajesActualizados)
    );

    setMensajes(mensajesActualizados);
  };

  // ================= BORRAR TODOS LOS MENSAJES =================

  const eliminarTodosLosMensajes = () => {
    if (mensajes.length === 0) return;

    const confirmar = window.confirm(
      "Seguro que quieres eliminar todos los mensajes?"
    );

    if (!confirmar) return;

    localStorage.removeItem("mensajesContacto");

    setMensajes([]);
  };

  return (
    <div className="admin-page">

      {/* ================= BARRA LATERAL ================= */}

      <aside className="admin-sidebar">

        <div className="admin-logo">

          <img
            src={logo}
            alt="Logo RefugiPet"
            className="admin-logo-icon"
          />

          <div>
            <h2>RefugiPet</h2>
            <p>Panel Administrativo</p>
          </div>

        </div>

        <nav className="admin-menu">

          <button
            className={
              seccion === "inicio"
                ? "activo"
                : ""
            }
            onClick={function () {
              setSeccion("inicio");
            }}
          >
            Inicio
          </button>

          <button
            className={
              seccion === "mascotas"
                ? "activo"
                : ""
            }
            onClick={function () {
              setSeccion("mascotas");
            }}
          >
            Mascotas
          </button>

          <button
            className={
              seccion === "usuarios"
                ? "activo"
                : ""
            }
            onClick={function () {
              setSeccion("usuarios");
            }}
          >
            Usuarios
          </button>

          <button
            className={
              seccion === "adopciones"
                ? "activo"
                : ""
            }
            onClick={function () {
              setSeccion("adopciones");
            }}
          >
            Adopciones
          </button>

          {/* NUEVO: MENSAJES */}

          <button
            className={
              seccion === "mensajes"
                ? "activo"
                : ""
            }
            onClick={function () {
              setSeccion("mensajes");
            }}
          >
            Mensajes
          </button>

        </nav>

        <div className="admin-salir">

          <Link to="/">
            Cerrar sesion
          </Link>

        </div>

      </aside>


      {/* ================= CONTENIDO ================= */}

      <main className="admin-contenido">

        <header className="admin-header">

          <div>

            <h1>
              Panel de Administracion
            </h1>

            <p>
              Gestiona la informacion de RefugiPet
            </p>

          </div>

          <div className="admin-user">
            Administrador
          </div>

        </header>


        {/* ================= INICIO ================= */}

        {seccion === "inicio" && (

          <section>

            <div className="admin-bienvenida">

              <h2>
                Bienvenido al panel de RefugiPet
              </h2>

              <p>
                Desde aqui puedes administrar las
                mascotas, usuarios y solicitudes de
                adopcion.
              </p>

            </div>


            <div className="admin-estadisticas">

              <div className="estadistica-card">

                <h3>
                  {mascotas.length}
                </h3>

                <p>
                  Mascotas registradas
                </p>

              </div>


              <div className="estadistica-card">

                <h3>
                  {usuarios.length}
                </h3>

                <p>
                  Usuarios registrados
                </p>

              </div>


              <div className="estadistica-card">

                <h3>
                  {mensajes.length}
                </h3>

                <p>
                  Mensajes recibidos
                </p>

              </div>

            </div>


            <div className="admin-seccion-titulo">

              <h2>
                Mascotas recientes
              </h2>

              <button
                onClick={function () {
                  setSeccion("mascotas");
                }}
              >
                Ver mas
              </button>

            </div>


            <div className="admin-mascotas-recientes">

              {mascotas
                .slice(0, 3)
                .map(function (mascota) {

                  return (

                    <div
                      className="admin-mascota-card"
                      key={mascota.id}
                    >

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

                          "Foto"

                        )}

                      </div>

                      <div>

                        <h3>
                          {mascota.nombre}
                        </h3>

                        <p>
                          {mascota.tipo} -{" "}
                          {mascota.edad} anos
                        </p>

                        <span
                          className={
                            mascota.estado ===
                            "Disponible"
                              ? "estado-admin disponible-admin"
                              : "estado-admin proceso-admin"
                          }
                        >
                          {mascota.estado}
                        </span>

                      </div>

                    </div>

                  );

                })}

            </div>

          </section>

        )}


        {/* ================= MASCOTAS ================= */}

        {seccion === "mascotas" && (

          <section className="admin-tabla-seccion">

            <div className="admin-seccion-titulo">

              <div>

                <h2>
                  Mascotas
                </h2>

                <p>
                  Administra las mascotas registradas.
                </p>

              </div>

              <button
                className="admin-btn-principal"
                onClick={
                  mostrarFormulario
                    ? cancelarFormulario
                    : abrirFormularioAgregar
                }
              >
                {mostrarFormulario
                  ? "Cancelar"
                  : "Agregar mascota"}
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
                  maxWidth: "500px",
                }}
              >

                <h3
                  style={{
                    margin: "0 0 0.5rem",
                    color: "#075f99",
                  }}
                >
                  {editandoId !== null
                    ? "Editar mascota"
                    : "Nueva mascota"}
                </h3>


                {errorFormulario && (

                  <p style={{ color: "red" }}>
                    {errorFormulario}
                  </p>

                )}


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

                    <select
                      name="tipo"
                      value={nuevaMascota.tipo}
                      onChange={manejarCambio}
                    >

                      <option value="Perro">
                        Perro
                      </option>

                      <option value="Gato">
                        Gato
                      </option>

                    </select>

                  </label>


                  <label>

                    Tamano

                    <select
                      name="tamano"
                      value={nuevaMascota.tamano}
                      onChange={manejarCambio}
                    >

                      <option value="Pequeno">
                        Pequeno
                      </option>

                      <option value="Mediano">
                        Mediano
                      </option>

                      <option value="Grande">
                        Grande
                      </option>

                    </select>

                  </label>

                </div>


                <label>

                  Edad (anos)

                  <input
                    type="number"
                    name="edad"
                    value={nuevaMascota.edad}
                    onChange={manejarCambio}
                    min="0"
                    required
                  />

                </label>


                <label>

                  Descripcion

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


            {cargandoMascotas && (
              <p>
                Cargando mascotas...
              </p>
            )}

            {errorMascotas && (
              <p style={{ color: "red" }}>
                {errorMascotas}
              </p>
            )}


            {!cargandoMascotas &&
              !errorMascotas && (

                <div className="admin-tabla">

                  <table>

                    <thead>

                      <tr>

                        <th>Foto</th>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Edad</th>
                        <th>Estado</th>
                        <th>Acciones</th>

                      </tr>

                    </thead>


                    <tbody>

                      {mascotas.map(
                        function (mascota) {

                          return (

                            <tr
                              key={mascota.id}
                            >

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

                                  "Foto"

                                )}

                              </td>

                              <td>
                                {mascota.id}
                              </td>

                              <td>
                                {mascota.nombre}
                              </td>

                              <td>
                                {mascota.tipo}
                              </td>

                              <td>
                                {mascota.edad} anos
                              </td>

                              <td>

                                <span
                                  className={
                                    mascota.estado ===
                                    "Disponible"
                                      ? "estado-admin disponible-admin"
                                      : "estado-admin proceso-admin"
                                  }
                                >
                                  {mascota.estado}
                                </span>

                              </td>

                              <td className="acciones">

                                <button
                                  onClick={
                                    function () {
                                      abrirFormularioEditar(
                                        mascota
                                      );
                                    }
                                  }
                                >
                                  Editar
                                </button>

                                <button
                                  className="eliminar"
                                  onClick={
                                    function () {
                                      eliminarMascota(
                                        mascota.id
                                      );
                                    }
                                  }
                                >
                                  Eliminar
                                </button>

                              </td>

                            </tr>

                          );

                        }
                      )}

                    </tbody>

                  </table>


                  {mascotas.length === 0 && (

                    <p
                      style={{
                        padding: "1rem",
                      }}
                    >
                      Todavia no hay mascotas
                      registradas.
                    </p>

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

                <h2>
                  Usuarios
                </h2>

                <p>
                  Usuarios registrados en RefugiPet.
                </p>

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

                  {usuarios.map(
                    function (usuario) {

                      return (

                        <tr
                          key={usuario.id}
                        >

                          <td>
                            {usuario.id}
                          </td>

                          <td>
                            {usuario.nombre}
                          </td>

                          <td>
                            {usuario.correo}
                          </td>

                          <td>
                            {usuario.rol}
                          </td>

                        </tr>

                      );

                    }
                  )}

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

                <h2>
                  Solicitudes de adopcion
                </h2>

                <p>
                  Revisa las solicitudes enviadas
                  por los usuarios.
                </p>

              </div>

            </div>


            <div className="admin-tabla">

              <table>

                <thead>

                  <tr>

                    <th>Usuario</th>
                    <th>Mascota</th>
                    <th>Fecha</th>
                    <th>Estado</th>

                  </tr>

                </thead>


                <tbody>

                  <tr>

                    <td>
                      Juan Perez
                    </td>

                    <td>
                      Max
                    </td>

                    <td>
                      10/03/2026
                    </td>

                    <td>

                      <span className="estado-admin proceso-admin">
                        Pendiente
                      </span>

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </section>

        )}


        {/* ================= MENSAJES ================= */}

        {seccion === "mensajes" && (

          <section className="admin-tabla-seccion">

            <div className="admin-seccion-titulo">

              <div>

                <h2>
                  Mensajes de contacto
                </h2>

                <p>
                  Mensajes enviados desde la página
                  principal de RefugiPet.
                </p>

              </div>


              {mensajes.length > 0 && (

                <button
                  className="admin-btn-principal"
                  onClick={eliminarTodosLosMensajes}
                >
                  Eliminar todos
                </button>

              )}

            </div>


            {mensajes.length === 0 ? (

              <div className="admin-bienvenida">

                <h3>
                  No hay mensajes
                </h3>

                <p>
                  Todavia no se han recibido mensajes
                  desde el formulario de contacto.
                </p>

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
                      <th>Accion</th>

                    </tr>

                  </thead>


                  <tbody>

                    {mensajes.map(
                      function (mensaje) {

                        return (

                          <tr
                            key={mensaje.id}
                          >

                            <td>
                              {mensaje.nombre}
                            </td>

                            <td>
                              {mensaje.correo}
                            </td>

                            <td>
                              {mensaje.mensaje}
                            </td>

                            <td>
                              {mensaje.fecha}
                            </td>

                            <td className="acciones">

                              <button
                                className="eliminar"
                                onClick={
                                  function () {
                                    eliminarMensaje(
                                      mensaje.id
                                    );
                                  }
                                }
                              >
                                Eliminar
                              </button>

                            </td>

                          </tr>

                        );

                      }
                    )}

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