const API_URL = "http://localhost:3000/api";

export async function apiFetch(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("token");

  const headers = {};

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  // 🔥 IMPORTANT : body seulement si pas GET
  if (method !== "GET" && body) {
    options.body = body instanceof FormData
      ? body
      : JSON.stringify(body);
  }

  const res = await fetch(`${API_URL}${endpoint}`, options);

  // 🔴 gestion 403
  if (res.status === 403) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    return null;
  }

  // 🔴 erreurs API
  if (!res.ok) {
    let errorMsg = "Erreur API";
    try {
      const err = await res.json();
      errorMsg = err.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return res.json();
}