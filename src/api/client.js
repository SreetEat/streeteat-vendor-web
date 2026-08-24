const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getToken() {
  return localStorage.getItem("streeteat_vendor_token");
}

export function setToken(token) {
  if (token) localStorage.setItem("streeteat_vendor_token", token);
  else localStorage.removeItem("streeteat_vendor_token");
}

// See customer app's client.js for the full explanation -- same fix,
// same reason: an expired/invalid token should trigger a clean logout,
// not a raw error repeated on every request.
let onUnauthorized = () => {};
export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth) {
    setToken(null);
    onUnauthorized();
    throw new Error("Your session expired -- please log in again.");
  }

  if (res.status === 204) return null;

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),

  listAllVendors: () => request("/api/vendors", { auth: false }),
  createVendor: (payload) => request("/api/vendors", { method: "POST", body: payload }),
  updateVendor: (id, payload) => request(`/api/vendors/${id}`, { method: "PUT", body: payload }),

  listMenu: (vendorId) => request(`/api/vendors/${vendorId}/menu`, { auth: false }),
  createMenuItem: (vendorId, payload) =>
      request(`/api/vendors/${vendorId}/menu`, { method: "POST", body: payload }),
  updateMenuItem: (vendorId, itemId, payload) =>
      request(`/api/vendors/${vendorId}/menu/${itemId}`, { method: "PUT", body: payload }),
  deleteMenuItem: (vendorId, itemId) =>
      request(`/api/vendors/${vendorId}/menu/${itemId}`, { method: "DELETE" }),

  myOrders: (page = 0, size = 20) => request(`/api/orders/vendor/mine?page=${page}&size=${size}`),
  acceptOrder: (id) => request(`/api/orders/${id}/accept`, { method: "POST" }),
  rejectOrder: (id, reason) =>
      request(`/api/orders/${id}/reject${reason ? `?reason=${encodeURIComponent(reason)}` : ""}`, {
        method: "POST",
      }),
  markReady: (id) => request(`/api/orders/${id}/ready`, { method: "POST" }),
};