"use client";

import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function Gestion() {

  const socketRef = useRef<any>(null);

  const [riego, setRiego] = useState(false);
  const [automatico, setAutomatico] = useState(false);
  const [zona, setZona] = useState("Zona 1");
  const [sensor, setSensor] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [bomba, setBomba] = useState(false);

  const estaRegando = bomba;
  const humedad = sensor?.humedad ?? 0;
  const ph = sensor?.ph ?? 0;

  // 🔥 VALIDACIÓN PH
  const phValido = ph >= 1 && ph <= 8;
  const bloqueoRiego = !phValido;

  // 🎨 COLOR DINÁMICO
  const getColor = () => {
    if (humedad < 30) return "#ef4444";
    if (humedad < 70) return "#22c55e";
    return "#3b82f6";
  };

  // 🔥 CARGA INICIAL
  useEffect(() => {
    const cargar = async () => {
      try {
        const estadoRes = await fetch("http://localhost:8080/api/riego");
        const estado = await estadoRes.json();

        setRiego(estado.riego);
        setAutomatico(estado.automatico);
        setZona(estado.zona);

        const histRes = await fetch("http://localhost:8080/api/riego/historial");
        const histData = await histRes.json();

        setHistorial(histData.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    cargar();
  }, []);

  // 🔥 SOCKETS
  useEffect(() => {

    socketRef.current = io("http://localhost:8080");
    const socket = socketRef.current;

    socket.on("sensor", (data: any) => {
      setSensor(data);
    });

    socket.on("estado", (data: any) => {
      setRiego(data.riego);
      setAutomatico(data.automatico);
      setZona(data.zona);
    });

    socket.on("bomba", (data: any) => {
      setBomba(data.bomba);
    });

    socket.on("historial", (data: any) => {
      setHistorial([...data]);
    });

    return () => {
      socket.disconnect();
    };

  }, []);

  // 🔥 ACCIONES
  const actualizarEstado = async (nuevoEstado: any) => {
    try {

      // 🔥 SI TOCAS MANUAL → APAGA AUTOMÁTICO
      if (nuevoEstado.riego !== undefined) {

        await fetch("http://localhost:8080/api/riego/manual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            encender: nuevoEstado.riego,
          }),
        });

        // 🔥 IMPORTANTE: también apagar automático
        await fetch("http://localhost:8080/api/riego/modo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            automatico: false,
          }),
        });
      }

      // 🔥 AUTOMÁTICO NORMAL
      if (nuevoEstado.automatico !== undefined || nuevoEstado.zona) {
        await fetch("http://localhost:8080/api/riego/modo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevoEstado),
        });
      }

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <main className="flex-1">

        <div className="p-4">
          <h1 className="text-3xl font-bold mb-6">
            Gestión 🌱
          </h1>

          {/* 🚫 ALERTA PH */}
          {bloqueoRiego && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
              🚫 Agua no apta para riego (pH fuera de rango)
            </div>
          )}

          {/* CONTROLES */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">

            {/* MANUAL */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-gray-500 mb-2">Riego manual</p>
              <button
                disabled={bloqueoRiego}
                onClick={() => actualizarEstado({ riego: !riego })}
                className={`w-full py-2 rounded-lg font-bold ${
                  bloqueoRiego
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : riego
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-black"
                }`}
              >
                {bloqueoRiego
                  ? "Bloqueado por pH"
                  : riego
                  ? "Apagar riego"
                  : "Encender riego"}
              </button>
            </div>

            {/* AUTOMÁTICO */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-gray-500 mb-2">Modo automático</p>
              <button
                disabled={bloqueoRiego}
                onClick={() => actualizarEstado({ automatico: !automatico })}
                className={`w-full py-2 rounded-lg font-bold ${
                  bloqueoRiego
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : automatico
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-black"
                }`}
              >
                {bloqueoRiego
                  ? "Bloqueado por pH"
                  : automatico
                  ? "Activo"
                  : "Inactivo"}
              </button>
            </div>

            {/* ZONA */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-gray-500 mb-2">Zona</p>
              <select
                value={zona}
                onChange={(e) => {
                  setZona(e.target.value);
                  actualizarEstado({ zona: e.target.value });
                }}
                className="w-full p-2 border rounded-lg"
              >
                <option>Zona 1</option>
                <option>Zona 2</option>
                <option>Zona 3</option>
              </select>
            </div>

          </div>

          {/* ESTADO */}
          {/* ESTADO */}
          <div className="grid md:grid-cols-2 gap-6 items-start">

            {/* 🔥 CÍRCULO PRO */}
            <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col min-h-[520px]">

              <h2 className="font-semibold mb-6 text-lg">
                Estado del sistema
              </h2>

              {/* 🔥 CONTENIDO CENTRADO REAL */}
              <div className="flex flex-col items-center justify-center flex-1 gap-6">

                {/* CÍRCULO */}
                <div className="relative w-72 h-72">

                  <svg className="w-full h-full transform -rotate-90">

                    <circle
                      cx="144"
                      cy="144"
                      r="115"
                      stroke="#e5e7eb"
                      strokeWidth="18"
                      fill="none"
                    />

                    <circle
                      cx="144"
                      cy="144"
                      r="115"
                      stroke={getColor()}
                      strokeWidth="18"
                      fill="none"
                      strokeDasharray={720}
                      strokeDashoffset={720 - (720 * humedad) / 100}
                      strokeLinecap="round"
                      className="opacity-20 blur-md transition-all duration-700"
                    />

                    <circle
                      cx="144"
                      cy="144"
                      r="115"
                      stroke={getColor()}
                      strokeWidth="18"
                      fill="none"
                      strokeDasharray={720}
                      strokeDashoffset={720 - (720 * humedad) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />

                  </svg>

                  {/* TEXTO */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-extrabold">
                      {humedad}%
                    </span>
                    <span className="text-sm text-gray-400">
                      humedad
                    </span>
                  </div>

                </div>

                {/* TEXTO */}
                <p className="font-semibold text-xl text-gray-700">
                  Humedad del suelo
                </p>

                {/* ESTADO */}
                <div
                  className={`px-6 py-2 rounded-full text-sm font-bold shadow-sm ${
                    estaRegando
                      ? "bg-blue-100 text-blue-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {estaRegando ? "💧 Riego activo" : "🌱 Riego apagado"}
                </div>

              </div>

            </div>

            {/* 🔥 HISTORIAL */}
            <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col min-h-[520px]">

              <h2 className="font-semibold mb-4 text-lg">
                Modo actual
              </h2>

              <div className="flex-1 overflow-y-auto pr-2">

                {historial.length === 0 ? (
                  <p className="text-gray-400">
                    Sin acciones aún...
                  </p>
                ) : (
                  historial
                    .slice(-4)
                    .reverse()
                    .map((h, i) => (

                      <div key={i} className="relative pl-8 mb-6 group">

                        {/* Línea */}
                        <div className="absolute left-3 top-2 bottom-0 w-[2px] bg-gray-200"></div>

                        {/* Punto */}
                        <div className="absolute left-1 top-2 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-md"></div>

                        <div className="bg-gray-50 p-4 rounded-xl shadow-sm transition group-hover:shadow-md">

                          <div className="font-semibold text-sm mb-1">

                            {h.tipo === "manual"
                              ? "👨‍🌾 Manual"
                              : h.tipo === "automatico"
                              ? "🤖 Automático"
                              : h.tipo === "bomba"
                              ? "💧 Bomba"
                              : h.tipo === "alerta"
                              ? "🚫 Alerta"
                              : "⚙️ Sistema"}

                          </div>

                          <div className="text-sm text-gray-700">
                            {h.evento}
                          </div>

                          <div className="text-xs text-gray-400 mt-1">
                            {h.hora}
                          </div>

                        </div>

                      </div>

                    ))
                )}

              </div>

            </div>

          </div>

        </div>
      </main>
    </div>
  );
}

