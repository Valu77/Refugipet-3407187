export const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export function obtenerUsuarioLocal() {
  try {
    return JSON.parse(localStorage.getItem("usuario") || "null");
  } catch {
    return null;
  }
}

export function extraerMensajeError(datos, fallback = "No se pudo completar la operación.") {
  if (!datos) return fallback;
  if (typeof datos.detail === "string") return datos.detail;
  if (Array.isArray(datos.detail)) {
    return datos.detail.map((err) => err.msg || String(err)).join(", ");
  }
  return fallback;
}

export async function apiFetch(ruta, options = {}, { auth = false, onUnauthorized } = {}) {
  const headers = { ...(options.headers || {}) };
  if (auth) {
    const token = localStorage.getItem("token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const respuesta = await fetch(`${API_URL}${ruta}`, {
    ...options,
    headers,
  });

  if ((respuesta.status === 401) && onUnauthorized) {
    onUnauthorized();
  }

  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) {
    throw new Error(extraerMensajeError(datos));
  }

  return datos;
}
