const API_URL = "http://localhost:3000/api";

export async function apiFetch(endpoint, method = "GET", body = null, token = null) {
  const headers = {};

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

  return res.json();
}