import "../../admin.css";
import { useState } from "react";
import { Link } from "react-router-dom";

function Admin() {
  const [seccion, setSeccion] = useState("inicio");

  const [mascotas] = useState([
    {
      id: 1,
      nombre: "Max",
      tipo: "Perro",
      edad: "2 años",
      estado: "Disponible",
    },
    {
      id: 2,
      nombre: "Luna",
      tipo: "Gata",
      edad: "1 año",
      estado: "Disponible",
    },
    {
      id: 3,
      nombre: "Rocky",
      tipo: "Perro",
      edad: "3 años",
      estado: "En proceso",
    },
    {
      id: 4,
      nombre: "Mia",
      tipo: "Gata",
      edad: "2 años",
      estado: "Disponible",
    },
  ]);

  const [usuarios] = useState([
    {
      id: 1,
      nombre: "Juan Pérez",
      correo: "juan@email.com",
      rol: "Usuario",
    },
    {
      id: 2,
      nombre: "María Gómez",
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

  return (
    <div className="admin-page">

      {/* ================= SIDEBAR ================= */}

      <aside className="admin-sidebar">

        <div className="admin-logo">
          <div className="admin-logo-icon">
            🐾
          </div>

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
            🏠 Inicio
          </button>

          <button
            className={seccion === "mascotas" ? "activo" : ""}
            onClick={() => setSeccion("mascotas")}
          >
            🐶 Mascotas
          </button>

          <button
            className={seccion === "usuarios" ? "activo" : ""}
            onClick={() => setSeccion("usuarios")}
          >
            👥 Usuarios
          </button>

          <button
            className={seccion === "adopciones" ? "activo" : ""}
            onClick={() => setSeccion("adopciones")}
          >
            ❤️ Adopciones
          </button>

        </nav>

        <div className="admin-salir">
          <Link to="/">
            ← Cerrar sesión
          </Link>
        </div>

      </aside>


      {/* ================= CONTENIDO ================= */}

      <main className="admin-contenido">

        {/* ================= HEADER ================= */}

        <header className="admin-header">

          <div>
            <h1>Panel de Administración</h1>
            <p>
              Gestiona la información de RefugiPet
            </p>
          </div>

          <div className="admin-user">
            👤 Administrador
          </div>

        </header>


        {/* ================= INICIO ================= */}

        {seccion === "inicio" && (
          <section>

            <div className="admin-bienvenida">
              <h2>
                ¡Bienvenido al panel de RefugiPet! 🐾
              </h2>

              <p>
                Desde aquí puedes administrar las mascotas,
                usuarios y solicitudes de adopción.
              </p>
            </div>


            <div className="admin-estadisticas">

              <div className="estadistica-card">
                <span>🐶</span>

                <div>
                  <h3>{mascotas.length}</h3>
                  <p>Mascotas registradas</p>
                </div>
              </div>


              <div className="estadistica-card">
                <span>👥</span>

                <div>
                  <h3>{usuarios.length}</h3>
                  <p>Usuarios registrados</p>
                </div>
              </div>


              <div className="estadistica-card">
                <span>❤️</span>

                <div>
                  <h3>5</h3>
                  <p>Adopciones en proceso</p>
                </div>
              </div>

            </div>


            <div className="admin-seccion-titulo">
              <h2>Mascotas recientes</h2>

              <button
                onClick={() => setSeccion("mascotas")}
              >
                Ver más
              </button>
            </div>


            <div className="admin-mascotas-recientes">

              {mascotas.slice(0, 3).map((mascota) => (

                <div
                  className="admin-mascota-card"
                  key={mascota.id}
                >

                  <div className="admin-mascota-icon">
                    🐾
                  </div>

                  <div>
                    <h3>{mascota.nombre}</h3>

                    <p>
                      {mascota.tipo} · {mascota.edad}
                    </p>

                    <span
                      className={
                        mascota.estado === "Disponible"
                          ? "estado disponible"
                          : "estado proceso"
                      }
                    >
                      {mascota.estado}
                    </span>
                  </div>

                </div>

              ))}

            </div>

          </section>
        )}


        {/* ================= MASCOTAS ================= */}

        {seccion === "mascotas" && (
          <section className="admin-tabla-seccion">

            <div className="admin-seccion-titulo">

              <div>
                <h2>Mascotas</h2>

                <p>
                  Administra las mascotas registradas.
                </p>
              </div>

              <button className="admin-btn-principal">
                + Agregar mascota
              </button>

            </div>


            <div className="admin-tabla">

              <table>

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Edad</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>

                  {mascotas.map((mascota) => (

                    <tr key={mascota.id}>

                      <td>{mascota.id}</td>

                      <td>
                        {mascota.nombre}
                      </td>

                      <td>
                        {mascota.tipo}
                      </td>

                      <td>
                        {mascota.edad}
                      </td>

                      <td>

                        <span
                          className={
                            mascota.estado === "Disponible"
                              ? "estado disponible"
                              : "estado proceso"
                          }
                        >
                          {mascota.estado}
                        </span>

                      </td>

                      <td className="acciones">

                        <button>
                          Ver
                        </button>

                        <button>
                          Editar
                        </button>

                        <button className="eliminar">
                          Eliminar
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>
        )}


        {/* ================= USUARIOS ================= */}

        {seccion === "usuarios" && (
          <section className="admin-tabla-seccion">

            <div className="admin-seccion-titulo">

              <div>
                <h2>Usuarios</h2>

                <p>
                  Usuarios registrados en RefugiPet.
                </p>
              </div>

              <button className="admin-btn-principal">
                + Agregar usuario
              </button>

            </div>


            <div className="admin-tabla">

              <table>

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>

                  {usuarios.map((usuario) => (

                    <tr key={usuario.id}>

                      <td>{usuario.id}</td>

                      <td>
                        {usuario.nombre}
                      </td>

                      <td>
                        {usuario.correo}
                      </td>

                      <td>
                        {usuario.rol}
                      </td>

                      <td className="acciones">

                        <button>
                          Ver
                        </button>

                        <button>
                          Editar
                        </button>

                        <button className="eliminar">
                          Eliminar
                        </button>

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

                <p>
                  Revisa las solicitudes enviadas por los usuarios.
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
                    <th>Acciones</th>
                  </tr>
                </thead>

                <tbody>

                  <tr>

                    <td>Juan Pérez</td>

                    <td>Max</td>

                    <td>10/03/2026</td>

                    <td>
                      <span className="estado proceso">
                        Pendiente
                      </span>
                    </td>

                    <td className="acciones">

                      <button>
                        Ver solicitud
                      </button>

                      <button>
                        Aprobar
                      </button>

                      <button className="eliminar">
                        Rechazar
                      </button>

                    </td>

                  </tr>


                  <tr>

                    <td>María Gómez</td>

                    <td>Luna</td>

                    <td>12/03/2026</td>

                    <td>
                      <span className="estado disponible">
                        Aprobada
                      </span>
                    </td>

                    <td className="acciones">

                      <button>
                        Ver solicitud
                      </button>

                    </td>

                  </tr>

                </tbody>

              </table>

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default Admin;