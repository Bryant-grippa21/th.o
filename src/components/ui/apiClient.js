const viteApiUrl = typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_BASE_URL : undefined;
const craApiUrl = typeof process !== "undefined" ? process.env?.REACT_APP_API_BASE_URL : undefined;

const API_BASE_URL = viteApiUrl || craApiUrl || "http://localhost:3000/api";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const getAuthToken = () => {
  try {
    return localStorage.getItem("authToken");
  } catch {
    return null;
  }
};

export async function apiRequest(path, options = {}) {
  const token = options.token ?? getAuthToken();
  const headers = {
    Accept: "application/json",
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body:
      options.body && !(options.body instanceof FormData) && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Error HTTP ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

export const authApi = {
  login: (credentials) => apiRequest("/auth/login", { method: "POST", body: credentials }),
  registerNatural: (data) => apiRequest("/auth/register/natural", { method: "POST", body: data }),
  registerJuridica: (data) => apiRequest("/auth/register/juridica", { method: "POST", body: data }),
};

export const cartApi = {
  sync: (cart) => apiRequest("/cart/sync", { method: "PUT", body: { items: cart } }),
  checkout: (payload) => apiRequest("/orders", { method: "POST", body: payload }),
};
