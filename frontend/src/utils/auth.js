// 🔐 Obtener token
export const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// 🔐 Verificar si hay sesión activa
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};

// 🔐 Guardar sesión
export const saveToken = (token) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

// 🔐 Cerrar sesión
export const logout = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
};

// 🔐 Obtener headers con token (para fetch)
export const getAuthHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

