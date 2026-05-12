"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth(); // 🔥 USUARIO REAL

  // 🔥 ESTADO BUSCADOR
  const [busqueda, setBusqueda] = useState("");

  // 🔥 MAPA DE RUTAS
  const paginas: Record<string, string> = {
    menu: "/dashboard",
    dashboard: "/dashboard",
    clima: "/clima",
    analitica: "/analitica",
    "analítica": "/analitica",
    gestion: "/gestion",
    "gestión": "/gestion",
    sistema: "/sistema",
    perfil: "/perfil",
  };

  // 🔥 BUSCADOR
  const manejarBusqueda = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const texto = busqueda
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

      const ruta = paginas[texto];

      if (ruta) {
        router.push(ruta);
        setBusqueda("");
      } else {
        alert("Página no encontrada");
      }
    }
  };

  // 🔥 LOGOUT REAL
  const cerrarSesion = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-[#F5F7FA]">

        {/* 🔵 SIDEBAR */}
        <aside className="w-64 bg-[#0F172A] text-white flex flex-col justify-between p-6">

          {/* ARRIBA */}
          <div>
            <h2 className="text-2xl font-bold text-[#22C55E] mb-8">
              AgroSense 🌱
            </h2>

            {/* 🔥 PERFIL DINÁMICO */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-[#22C55E] flex items-center justify-center text-3xl font-bold bg-[#1E293B]">
                {user?.nombres?.charAt(0) || "U"}
              </div>

              <p className="mt-4 font-semibold text-lg">
                {user?.nombres || "Usuario"}
              </p>

              <p className="text-sm text-gray-400">
                {user?.email || "Sin email"}
              </p>
            </div>

            {/* MENÚ */}
            <nav className="space-y-3">
              {[
                { name: "Menu", path: "/dashboard" },
                { name: "Clima", path: "/clima" },
                { name: "Analítica", path: "/analitica" },
                { name: "Gestión", path: "/gestion" },
                { name: "Sistema", path: "/sistema" },
                { name: "Perfil", path: "/perfil" },
              ].map((item) => (
                <Link key={item.path} href={item.path}>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-lg ${
                      pathname === item.path
                        ? "bg-[#22C55E] text-black"
                        : "hover:bg-[#1E293B]"
                    }`}
                  >
                    {item.name}
                  </button>
                </Link>
              ))}
            </nav>
          </div>

          {/* 🔥 LOGOUT */}
          <button
            onClick={cerrarSesion}
            className="w-full bg-red-500 hover:bg-red-600 transition py-2 rounded-lg font-semibold"
          >
            Cerrar sesión
          </button>
        </aside>

        {/* 🔵 CONTENIDO */}
        <div className="flex-1 flex flex-col">

          {/* 🔥 HEADER */}
          <header className="h-16 bg-[#0F172A] flex items-center justify-between px-6 shadow-md z-50">

            {/* BUSCADOR */}
            <div className="flex-1 flex justify-center">
              <input
                type="text"
                placeholder="Buscar páginas..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={manejarBusqueda}
                className="w-1/2 px-5 py-2 rounded-full 
                bg-[#1E293B] text-white placeholder-gray-400 
                outline-none border border-[#334155]
                focus:ring-2 focus:ring-[#22C55E]"
              />
            </div>

            {/* ICONOS */}
            <div className="flex items-center gap-6 text-gray-300 text-xl">
              <span className="hover:text-[#22C55E] cursor-pointer">🔔</span>

              <span
                onClick={() => router.push("/perfil")}
                className="hover:text-[#22C55E] cursor-pointer"
              >
                👤
              </span>

              <span className="hover:text-[#22C55E] cursor-pointer">⋮</span>
            </div>
          </header>

          {/* CONTENIDO */}
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>

        </div>
      </div>
    </ProtectedRoute>
  );
}

