"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import { useSession, signOut } from "next-auth/react";

// 🎯 Contexto
const AuthContext = createContext();

// 🚀 Provider
export function AuthProvider({ children }) {
  const { data: session, status } = useSession();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Obtener usuario de TU BACKEND
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me", {
        credentials: "include",
      });

      const data = await res.json();

      if (data.ok) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false); // 🔥 SIEMPRE termina loading
    }
  };

  // 🔥 CONTROL TOTAL DE AUTH (SIN LOOPS)
  useEffect(() => {
    const initAuth = async () => {
      // ⏳ Esperar a next-auth
      if (status === "loading") return;

      // 🔵 LOGIN OAUTH (Google / GitHub)
      if (session?.user) {
        setUser({
          nombres: session.user.name || "",
          email: session.user.email || "",
          image: session.user.image || "",
          provider: "oauth",
        });

        setLoading(false);
        return;
      }

      // 🟢 LOGIN MANUAL (backend)
      await fetchUser();
    };

    initAuth();
  }, [session, status]);

  // 🚪 LOGOUT GLOBAL
  const logout = async () => {
    try {
      // 🔹 backend
      await fetch("http://localhost:8080/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      // 🔹 next-auth
      await signOut({ redirect: false });

      setUser(null);
    } catch (error) {
      console.error("Error al cerrar sesión");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        setUser,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// 🎯 Hook
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return context;
}

