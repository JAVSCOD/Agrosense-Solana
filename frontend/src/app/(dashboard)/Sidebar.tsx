"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const user = {
    nombre: "Juan Alexis",
    email: "juan@agrosense.com",
  };

  const cerrarSesion = () => {
    console.log("Cerrar sesión");
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-[#0F172A] text-white flex flex-col h-screen sticky top-0">

    {/* CONTENIDO SUPERIOR (SCROLL) */}
    <div className="flex-1 overflow-y-auto p-6">

        <h2 className="text-2xl font-bold text-[#22C55E] mb-8">
        AgroSense 🌱
        </h2>

        {/* PERFIL */}
        <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-full border-4 border-[#22C55E] flex items-center justify-center text-3xl font-bold bg-[#1E293B]">
            J
        </div>

        <p className="mt-4 font-semibold text-lg">
            Juan Alexis
        </p>

        <p className="text-sm text-gray-400">
            juan@agrosense.com
        </p>
        </div>

        {/* MENÚ */}
        <nav className="space-y-3">
        {/* botones */}
        </nav>

    </div>

    {/* 🔻 SIEMPRE FIJO ABAJO */}
    <div className="p-6 border-t border-[#1E293B]">
        <button
        onClick={cerrarSesion}
        className="w-full bg-red-500 hover:bg-red-600 transition py-2 rounded-lg font-semibold"
        >
        Cerrar sesión
        </button>
    </div>

    </aside>
  );
}
