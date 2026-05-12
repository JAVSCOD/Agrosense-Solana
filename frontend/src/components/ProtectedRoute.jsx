"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login"); // 🔥 mejor que push
    }
  }, [user, loading, router]);

  // ⏳ Mientras valida sesión
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Cargando sesión...</p>
      </div>
    );
  }

  // 🚫 Mientras redirige
  if (!user) return null;

  // ✅ Usuario autenticado
  return <>{children}</>;
}

