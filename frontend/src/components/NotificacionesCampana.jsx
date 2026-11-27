import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";

function NotificacionesCampana({ compact = false }) {
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);
  const [items, setItems] = useState([]);
  const [noLeidas, setNoLeidas] = useState(0);
  const [cargando, setCargando] = useState(false);
  const containerRef = useRef(null);

  const cargarNotificaciones = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setCargando(true);
    try {
      const datos = await apiFetch("/notificaciones/", {}, { auth: true });
      setItems(datos.items || []);
      setNoLeidas(datos.no_leidas || 0);
    } catch {
      // Silencioso si no hay sesión válida
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarNotificaciones();
    const idIntervalo = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(idIntervalo);
  }, [cargarNotificaciones]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") setAbierto(false);
    };
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  const marcarLeida = async (notif) => {
    try {
      if (!notif.leida) {
        await apiFetch(
          `/notificaciones/${notif.id}/leer`,
          { method: "PUT" },
          { auth: true }
        );
        setItems((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, leida: true } : n))
        );
        setNoLeidas((prev) => Math.max(0, prev - 1));
      }
      setAbierto(false);
      if (notif.enlace) {
        navigate(notif.enlace);
      }
    } catch {
      // ignorar
    }
  };

  const marcarTodas = async () => {
    try {
      await apiFetch("/notificaciones/leer-todas", { method: "PUT" }, { auth: true });
      setItems((prev) => prev.map((n) => ({ ...n, leida: true })));
      setNoLeidas(0);
    } catch {
      // ignorar
    }
  };

  return (
    <div className="notif-wrapper" ref={containerRef}>
      <button
        type="button"
        className={`notif-bell-btn ${compact ? "compact" : ""}`}
        aria-label={`Notificaciones (${noLeidas} sin leer)`}
        aria-expanded={abierto}
        onClick={() => {
          const prox = !abierto;
          setAbierto(prox);
          if (prox) cargarNotificaciones();
        }}
      >
        <span aria-hidden="true">🔔</span>
        {noLeidas > 0 && <span className="notif-badge">{noLeidas}</span>}
      </button>

      {abierto && (
        <div
          className="notif-dropdown"
          role="region"
          aria-label="Lista de notificaciones"
        >
          <div className="notif-dropdown-header">
            <strong>Notificaciones</strong>
            {noLeidas > 0 && (
              <button
                type="button"
                className="notif-mark-all"
                onClick={marcarTodas}
              >
                Marcar todas leídas
              </button>
            )}
          </div>

          <div className="notif-dropdown-list">
            {cargando && items.length === 0 ? (
              <p className="notif-empty">Cargando notificaciones...</p>
            ) : items.length === 0 ? (
              <p className="notif-empty">No tienes notificaciones nuevas.</p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`notif-item ${n.leida ? "leida" : "no-leida"}`}
                  onClick={() => marcarLeida(n)}
                >
                  <div className="notif-item-title">
                    {!n.leida && <span className="notif-dot" aria-hidden="true" />}
                    <span>{n.titulo}</span>
                  </div>
                  <p className="notif-item-msg">{n.mensaje}</p>
                  <span className="notif-item-date">
                    {n.creado_en
                      ? new Date(n.creado_en).toLocaleString("es-CO")
                      : ""}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificacionesCampana;
