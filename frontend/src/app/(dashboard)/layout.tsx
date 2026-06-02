"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [busqueda, setBusqueda] = useState("");
  const [walletCopiada, setWalletCopiada] = useState(false);
  const [menuHerramientas, setMenuHerramientas] = useState(false);
  const [tema, setTema] = useState("light");

  const [menuNotificaciones, setMenuNotificaciones] = useState(false);
  const [notificaciones, setNotificaciones] = useState<any[]>([]);
  const [exportando, setExportando] = useState(false);
  const [toastGlobal, setToastGlobal] = useState<any>(null);

  const notificacionesRef = useRef<HTMLDivElement>(null);
  const herramientasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const temaGuardado = localStorage.getItem("temaAgroSense");

    if (temaGuardado) {
      setTema(temaGuardado);
    }
  }, []);

  useEffect(() => {
    const cerrarMenus = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        menuNotificaciones &&
        notificacionesRef.current &&
        !notificacionesRef.current.contains(target)
      ) {
        setMenuNotificaciones(false);
      }

      if (
        menuHerramientas &&
        herramientasRef.current &&
        !herramientasRef.current.contains(target)
      ) {
        setMenuHerramientas(false);
      }
    };

    document.addEventListener("mousedown", cerrarMenus);

    return () => {
      document.removeEventListener("mousedown", cerrarMenus);
    };
  }, [menuNotificaciones, menuHerramientas]);

  useEffect(() => {
    const recibirNotificacion = (event: any) => {
      const { titulo, mensaje, tipo } = event.detail;

      agregarNotificacion(
        titulo || "Notificación",
        mensaje || "Nueva actividad del sistema",
        tipo || "success"
      );
    };

    window.addEventListener("agrosense-notificacion", recibirNotificacion);

    return () => {
      window.removeEventListener("agrosense-notificacion", recibirNotificacion);
    };
  }, []);

  const cambiarTema = () => {
    const nuevoTema = tema === "light" ? "blue" : "light";

    setTema(nuevoTema);
    localStorage.setItem("temaAgroSense", nuevoTema);
    setMenuHerramientas(false);
  };

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

  const getNombreUsuario = () => {
    return user?.nombres || "Usuario";
  };

  const getInicialUsuario = () => {
    return getNombreUsuario().charAt(0).toUpperCase();
  };

  const getWalletCorta = () => {
    if (!user?.wallet) return "Sin wallet";
    return `${user.wallet.slice(0, 4)}...${user.wallet.slice(-4)}`;
  };

  const copiarWallet = async () => {
    if (!user?.wallet) return;

    try {
      await navigator.clipboard.writeText(user.wallet);
      setWalletCopiada(true);

      agregarNotificacion(
        "Wallet copiada",
        "La wallet fue copiada correctamente",
        "success"
      );

      setTimeout(() => {
        setWalletCopiada(false);
      }, 2000);
    } catch (error) {
      console.error("Error copiando wallet:", error);
    }
  };

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

  const agregarNotificacion = (
    titulo: string,
    mensaje: string,
    tipo = "success"
  ) => {
    const nueva = {
      id: Date.now(),
      titulo,
      mensaje,
      tipo,
      fecha: new Date().toLocaleTimeString("es-MX"),
    };

    setNotificaciones((prev) => [nueva, ...prev]);

    setToastGlobal(nueva);

    setTimeout(() => {
      setToastGlobal(null);
    }, 4000);
  };

  const borrarNotificacion = (id: number) => {
    setNotificaciones((prev) => prev.filter((item) => item.id !== id));
  };

  const exportarDatos = async () => {
    try {
      setExportando(true);

      const controlRes = await fetch("http://localhost:8080/api/riego/control");
      const controlData = await controlRes.json();

      const sensorRes = await fetch("http://localhost:8080/api/riego/sensores");
      const sensorJson = await sensorRes.json();

      const climaRes = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=Jilotepec&lang=es`
      );
      const clima = await climaRes.json();

      const sensor = sensorJson?.data;

      const humedad = sensor?.humedad ?? "N/A";
      const ph = sensor?.ph ?? "N/A";
      const temperatura = clima?.current?.temp_c ?? sensor?.temperatura ?? "N/A";
      const bombaActiva = !!controlData?.bomba;

      const phNumero = Number(ph);
      const humedadNumero = Number(humedad);

      const recomendacion =
        !sensor
          ? "Sin datos del sensor"
          : humedadNumero < 30
          ? "⚠️ Suelo seco - Regar"
          : phNumero < 5.5
          ? "⚠️ pH ácido"
          : phNumero > 7.5
          ? "⚠️ pH alcalino"
          : "✅ Condiciones óptimas";

      const estadoBomba = bombaActiva ? "Riego encendido" : "Riego apagado";

      const res = await fetch("/api/auth/export-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user?.email,
          nombres: user?.nombres,
          primerApellido: user?.primerApellido || user?.primerapellido,
          segundoApellido: user?.segundoApellido || user?.segundoapellido,
          telefono: user?.telefono,
          wallet: user?.wallet,
          pda: user?.pda,

          humedad,
          ph,
          temperatura,
          estadoBomba,
          recomendacion,

          ciudad: clima?.location?.name || "N/A",
          pais: clima?.location?.country || "N/A",
          condicionClima: clima?.current?.condition?.text || "N/A",
          humedadAmbiente: clima?.current?.humidity ?? "N/A",
          viento: clima?.current?.wind_kph ?? "N/A",
          probabilidadLluvia: "N/A",
          uv: clima?.current?.uv ?? "N/A",

          modoRiego: "Automático",
          ultimaLectura: new Date().toLocaleString("es-MX"),
          estadoEsp32: sensorJson?.ok && sensor ? "Conectado" : "Desconectado",
          estadoBackend: "Activo",
          estadoSolana: "Activo",
          estadoNginx: "Activo",
        }),
      });

      const data = await res.json();

      if (!data.ok) {
        agregarNotificacion(
          "Error al exportar",
          data.error || "No se pudo enviar el reporte.",
          "error"
        );
        return;
      }

      agregarNotificacion(
        "Reporte enviado",
        "El reporte PDF fue enviado correctamente a tu correo.",
        "success"
      );

      setMenuHerramientas(false);
    } catch (error) {
      console.error("Error exportando reporte:", error);

      agregarNotificacion(
        "Error de conexión",
        "No se pudo conectar con el servidor para exportar los datos.",
        "error"
      );
    } finally {
      setExportando(false);
    }
  };

  const cerrarSesion = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute>
      {toastGlobal && (
        <div
          className={`fixed top-6 right-6 z-[99999] text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-4 ${
            toastGlobal.tipo === "error" ? "bg-red-500" : "bg-[#22C55E]"
          }`}
        >
          <span>
            {toastGlobal.tipo === "error" ? "❌" : "✅"} {toastGlobal.mensaje}
          </span>

          <button onClick={() => setToastGlobal(null)} className="font-bold">
            ×
          </button>
        </div>
      )}

      <div
        className={`flex h-screen overflow-hidden transition-colors duration-300 ${
          tema === "blue" ? "bg-[#071028]" : "bg-[#F5F7FA]"
        }`}
      >

        <aside className="w-72 bg-[#0F172A] text-white flex flex-col justify-between p-6">
          <div>
            <h2 className="text-3xl font-bold text-[#22C55E] mb-8">
              AgroSense 🌱
            </h2>

            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-[#22C55E] overflow-hidden bg-[#1E293B] flex items-center justify-center shadow-lg">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {getInicialUsuario()}
                  </span>
                )}
              </div>

              <p className="mt-5 font-semibold text-2xl text-center text-white">
                Tu Wallet Conectada
              </p>

              <p className="mt-4 font-semibold text-lg text-center text-white">
                {getNombreUsuario()}
              </p>

              <button
                onClick={copiarWallet}
                title="Copiar wallet"
                className="
                  mt-3
                  bg-[#5B34C4]
                  hover:bg-[#512DA8]
                  text-white
                  px-4
                  py-2.5
                  rounded-lg
                  font-bold
                  text-sm
                  flex
                  items-center
                  gap-3
                  transition
                  shadow-md
                "
              >
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <img
                    src="/phantom.jpg"
                    alt="Phantom"
                    className="w-7 h-7 rounded-lg object-contain"
                  />
                </div>

                <span className="tracking-wide">{getWalletCorta()}</span>
              </button>
            </div>

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
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${
                      pathname === item.path
                        ? "bg-[#22C55E] text-black font-semibold"
                        : "hover:bg-[#1E293B]"
                    }`}
                  >
                    {item.name}
                  </button>
                </Link>
              ))}
            </nav>
          </div>

          <button
            onClick={cerrarSesion}
            className="w-full bg-red-500 hover:bg-red-600 transition py-2 rounded-lg font-semibold"
          >
            Cerrar sesión
          </button>
        </aside>

        <div className="flex-1 flex flex-col">
          <header className="h-16 bg-[#0F172A] flex items-center justify-between px-6 shadow-md z-50">
            <div className="flex-1 flex justify-center">
              <input
                type="text"
                placeholder="Buscar páginas..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={manejarBusqueda}
                className="
                  w-1/2
                  px-5
                  py-2
                  rounded-full
                  bg-[#1E293B]
                  text-white
                  placeholder-gray-400
                  outline-none
                  border
                  border-[#334155]
                  focus:ring-2
                  focus:ring-[#22C55E]
                "
              />
            </div>

            <div className="flex items-center gap-6 text-gray-300 text-xl">
              <div className="relative" ref={notificacionesRef}>
                <button
                  onClick={() => setMenuNotificaciones(!menuNotificaciones)}
                  className="relative hover:text-[#22C55E] cursor-pointer"
                >
                  🔔

                  {notificaciones.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {notificaciones.length}
                    </span>
                  )}
                </button>

                {menuNotificaciones && (
                  <div className="absolute right-0 mt-4 w-80 bg-[#0F172A] border border-[#22C55E]/20 rounded-2xl shadow-2xl overflow-hidden z-[9999]">
                    <div className="px-4 py-3 border-b border-[#1E293B]">
                      <p className="text-[#22C55E] font-bold text-lg">
                        Actividad reciente
                      </p>
                    </div>

                    <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                      {notificaciones.length === 0 ? (
                        <p className="text-gray-400 text-sm px-4 py-4">
                          No hay notificaciones.
                        </p>
                      ) : (
                        notificaciones.map((item) => (
                          <div
                            key={item.id}
                            className={`relative p-3 rounded-xl border ${
                              item.tipo === "error"
                                ? "bg-red-500/10 border-red-500/20"
                                : "bg-[#1E293B] border-[#22C55E]/20"
                            }`}
                          >
                            <button
                              onClick={() => borrarNotificacion(item.id)}
                              className="
                                absolute
                                top-2
                                right-2
                                text-gray-400
                                hover:text-white
                                transition
                                text-xs
                              "
                              title="Borrar notificación"
                            >
                              ✕
                            </button>

                            <p
                              className={`font-semibold text-sm pr-5 ${
                                item.tipo === "error"
                                  ? "text-red-400"
                                  : "text-[#22C55E]"
                              }`}
                            >
                              {item.tipo === "error" ? "❌" : "✅"}{" "}
                              {item.titulo}
                            </p>

                            <p className="text-gray-300 text-xs mt-1 pr-4">
                              {item.mensaje}
                            </p>

                            <p className="text-gray-500 text-[11px] mt-2">
                              {item.fecha}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <span
                onClick={() => router.push("/perfil")}
                className="hover:text-[#22C55E] cursor-pointer"
              >
                👤
              </span>

              <div className="relative" ref={herramientasRef}>
                <button
                  onClick={() => setMenuHerramientas(!menuHerramientas)}
                  className="hover:text-[#22C55E] cursor-pointer"
                >
                  ⋮
                </button>

                {menuHerramientas && (
                  <div className="absolute right-0 mt-4 w-72 bg-[#0F172A] border border-[#22C55E]/20 rounded-2xl shadow-2xl overflow-hidden z-[9999]">
                    <div className="px-4 py-3 border-b border-[#1E293B]">
                      <p className="text-[#22C55E] font-bold text-lg">
                        Herramientas
                      </p>
                    </div>

                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          router.push("/perfil");
                          setMenuHerramientas(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#22C55E] transition text-sm text-gray-200"
                      >
                        <span className="text-[#22C55E]">👤</span>
                        Perfil
                      </button>

                      <button
                        onClick={cambiarTema}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#22C55E] transition text-sm text-gray-200"
                      >
                        <span className="text-[#22C55E]">
                          {tema === "blue" ? "☀️" : "🌙"}
                        </span>
                        {tema === "blue" ? "Tema claro" : "Tema azul"}
                      </button>

                      <button
                        onClick={exportarDatos}
                        disabled={exportando}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#22C55E] transition text-sm text-gray-200 disabled:opacity-50"
                      >
                        <span className="text-[#22C55E]">📊</span>
                        {exportando ? "Exportando..." : "Exportar datos"}
                      </button>

                      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#22C55E] transition text-sm text-gray-200">
                        <span className="text-[#22C55E]">📡</span>
                        Estado del sistema
                      </button>

                      <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#22C55E] transition text-sm text-gray-200">
                        <span className="text-[#22C55E]">🧪</span>
                        Modo demo
                      </button>
                    </div>

                    <div className="p-2 border-t border-[#1E293B]">
                      <button
                        onClick={cerrarSesion}
                        className="w-full bg-red-500 hover:bg-red-600 text-white transition py-2 rounded-lg font-semibold"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main
            className={`flex-1 overflow-y-auto p-8 transition-colors duration-300 ${
              tema === "blue"
                ? "bg-[#071028] text-white"
                : "bg-[#F5F7FA] text-black"
            }`}
          >
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}


