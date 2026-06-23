const rawApiUrl = process.env.REACT_APP_API_BASE_URL || "/api";
export const API_BASE_URL = rawApiUrl.replace(/\/$/, "");

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

export const setAuthToken = (token) => {
  try {
    if (token) localStorage.setItem("authToken", token);
    else localStorage.removeItem("authToken");
  } catch {
    // localStorage can be unavailable in private mode or tests.
  }
};

export async function apiRequest(path, options = {}) {
  const token = options.token ?? getAuthToken();
  const isFormData = options.body instanceof FormData;
  const headers = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: options.credentials || "include",
    body:
      options.body && !isFormData && typeof options.body !== "string"
        ? JSON.stringify(options.body)
        : options.body,
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json().catch(() => null)
    : await response.text();

  if (!response.ok) {
    const message = payload?.message || payload?.error || `Error HTTP ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}

export const authApi = {
  login: (credentials) => {
    const isBusiness = String(credentials?.userType || "").startsWith("juridico");
    const { userType, ...loginData } = credentials || {};
    return apiRequest(isBusiness ? "/company-auth/login" : "/auth/login", { method: "POST", body: loginData });
  },
  loginWithGoogle: (payload) => apiRequest("/auth/google", { method: "POST", body: payload }),
  registerWithGoogle: (payload) => apiRequest("/auth/google/register", { method: "POST", body: payload }),
  registerNatural: (data) => apiRequest("/auth/register", { method: "POST", body: data }),
  registerJuridica: (data) => {
    if (data instanceof FormData) {
      const businessType = data.get("businessType");
      const rifFile = data.get("companyRif");
      return apiRequest("/company-auth/register", {
        method: "POST",
        body: {
          company_name: data.get("company_name") || data.get("email"),
          rif: typeof rifFile === "string" ? rifFile : data.get("rif") || "J-00000000",
          email: data.get("email"),
          password: data.get("password"),
          phone: data.get("phone") || null,
          address: data.get("address") || null,
          businessType,
        },
      });
    }
    return apiRequest("/company-auth/register", { method: "POST", body: data });
  },
  me: () => apiRequest("/auth/me"),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),
};

export const productsApi = {
  list: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/products/catalog${query ? `?${query}` : ""}`);
  },
  detail: (id) => apiRequest(`/products/catalog/${id}`),
};

export const cartApi = {
  get: () => apiRequest("/auth/cart"),
  setItem: (item) => apiRequest("/auth/cart/items", { method: "PUT", body: item }),
  removeItem: (productId) => apiRequest(`/auth/cart/items/${productId}`, { method: "DELETE" }),
  clear: () => apiRequest("/auth/cart", { method: "DELETE" }),
  sync: async (cart) => {
    for (const item of cart || []) {
      await apiRequest("/auth/cart/items", {
        method: "PUT",
        body: { id_product: item.id_product || item.id || item.product_id, quantity: item.quantity || 1 },
      });
    }
    return apiRequest("/auth/cart");
  },
  checkout: (payload = {}) => apiRequest("/purchases/checkout", { method: "POST", body: payload }),
};
