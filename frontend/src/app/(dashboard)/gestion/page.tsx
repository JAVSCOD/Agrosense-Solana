"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { socket } from "@/lib/socket";

type SensorData = {
  deviceId?: string;
  zona?: string;
  humedad?: number;
  ph?: number;
  temperatura?: number;
};

type ZonaEstado = {
  manual: boolean;
  automatico: boolean;
  bomba: boolean;
  riegoActivo: boolean;
  inicioRiego: number | null;
  sensor: SensorData | null;
};

type EstadoZonas = Record<string, ZonaEstado>;

type HistorialItem = {
  tipo: string;
  zona?: string;
  evento: string;
  hora: string;
};

const API_URL = "/api/riego";
const ZONAS = ["Zona 1", "Zona 2", "Zona 3", "Zona 4"];

export default function Gestion() {
  const [zona, setZona] = useState("Zona 1");
  const zonaRef = useRef("Zona 1");

  const [zonasEstado, setZonasEstado] = useState<EstadoZonas>({});
  const [sensor, setSensor] = useState<SensorData | null>(null);
  const [historial, setHistorial] = useState<HistorialItem[]>([]);

  const [bomba, setBomba] = useState(false);
  const [manual, setManual] = useState(false);
  const [automatico, setAutomatico] = useState(true);
  const [riegoActivo, setRiegoActivo] = useState(false);
  const [razon, setRazon] = useState("Sin datos");
  const [cargando, setCargando] = useState(false);

  const [ultimaLectura, setUltimaLectura] = useState<number | null>(null);
  const [conexionESP32, setConexionESP32] = useState(false);

  const humedad = Number(sensor?.humedad ?? 0);
  const humedadVisual = Math.max(0, Math.min(100, humedad));
  const ph = sensor?.ph ?? 0;
  const temperatura = sensor?.temperatura ?? 0;

  const bombaVisual = bomba || riegoActivo;
  const estaRegando = bombaVisual;

  const phValido = ph >= 6 && ph <= 8;
  const bloqueoRiego = sensor ? !phValido : false;

  const marcarLectura = () => {
    setUltimaLectura(Date.now());
    setConexionESP32(true);
  };

  const historialFiltrado = useMemo(() => {
    return historial
      .filter((item) => !item.zona || item.zona === zona)
      .slice(-6)
      .reverse();
  }, [historial, zona]);

  const getColor = () => {
    if (humedad < 30) return "#ef4444";
    if (humedad < 85) return "#22c55e";
    return "#3b82f6";
  };

  // =====================================================
  // SINCRONIZA SOLO CONTROL REAL DE LA ZONA
  // =====================================================
  const sincronizarControlZona = async (zonaSeleccionada = zonaRef.current) => {
    try {
      const res = await fetch(
        `${API_URL}/control?zona=${encodeURIComponent(zonaSeleccionada)}`
      );

      const data = await res.json();

      setBomba(!!data.bomba || !!data.riegoActivo);
      setManual(!!data.manual);
      setAutomatico(!!data.automatico);
      setRiegoActivo(!!data.riegoActivo);
      setRazon(data.razon || "Sin datos");

      setZonasEstado((prev) => {
        const estadoAnterior = prev[zonaSeleccionada];

        return {
          ...prev,
          [zonaSeleccionada]: {
            ...(estadoAnterior || {
              manual: false,
              automatico: true,
              bomba: false,
              riegoActivo: false,
              inicioRiego: null,
              sensor: null,
            }),
            bomba: !!data.bomba,
            manual: !!data.manual,
            automatico: !!data.automatico,
            riegoActivo: !!data.riegoActivo,
          },
        };
      });
    } catch (error) {
      console.error("Error sincronizando control:", error);
    }
  };

  // =====================================================
  // SINCRONIZA SENSOR + CONTROL
  // =====================================================
  const sincronizarVistaZona = async (zonaSeleccionada = zona) => {
    try {
      setCargando(true);

      const sensorRes = await fetch(
        `${API_URL}/sensores?zona=${encodeURIComponent(zonaSeleccionada)}`
      );
      const sensorData = await sensorRes.json();

      setSensor(sensorData.data || null);

      await sincronizarControlZona(zonaSeleccionada);
    } catch (error) {
      console.error("Error sincronizando zona:", error);
    } finally {
      setCargando(false);
    }
  };

  const cargarEstadoGeneral = async () => {
    try {
      const estadoRes = await fetch(`${API_URL}/estado`);
      const estadoData = await estadoRes.json();

      const data = estadoData.data || estadoData || {};
      setZonasEstado(data);

      const zonaActual = data[zonaRef.current];

      if (zonaActual) {
        setManual(!!zonaActual.manual);
        setAutomatico(!!zonaActual.automatico);
        setSensor(zonaActual.sensor || null);
      }

      await sincronizarControlZona(zonaRef.current);

      const histRes = await fetch(`${API_URL}/historial`);
      const histData = await histRes.json();

      setHistorial(histData.data || []);
    } catch (error) {
      console.error("Error cargando estado general:", error);
    }
  };

  useEffect(() => {
    const cargar = async () => {
      await cargarEstadoGeneral();
      await sincronizarVistaZona(zona);
    };

    cargar();
  }, []);

  useEffect(() => {
    zonaRef.current = zona;
    sincronizarVistaZona(zona);
  }, [zona]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      if (!ultimaLectura) {
        setConexionESP32(false);
        return;
      }

      const tiempoSinDatos = Date.now() - ultimaLectura;
      setConexionESP32(tiempoSinDatos <= 10000);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [ultimaLectura]);

  // =====================================================
  // RESPALDO: CONSULTA CONTROL CADA 2 SEGUNDOS
  // =====================================================
  useEffect(() => {
    const intervalo = setInterval(() => {
      sincronizarControlZona(zonaRef.current);
    }, 2000);

    return () => clearInterval(intervalo);
  }, []);

  // =====================================================
  // SOCKET.IO
  // =====================================================
  useEffect(() => {
    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      console.log("🟢 Gestión conectada por Socket.IO");
    });

    const procesarSensor = (payload: any) => {
      const zonaEvento = payload?.zona || payload?.data?.zona || "Zona 1";
      const data = payload?.data || payload;

      setZonasEstado((prev) => {
        const estadoAnterior = prev[zonaEvento];

        return {
          ...prev,
          [zonaEvento]: {
            ...(estadoAnterior || {
              manual: false,
              automatico: true,
              bomba: false,
              riegoActivo: false,
              inicioRiego: null,
              sensor: null,
            }),
            sensor: data,
          },
        };
      });

      if (zonaEvento === zonaRef.current) {
        setSensor(data);
        sincronizarControlZona(zonaEvento);
      }

      marcarLectura();
    };

    const procesarBomba = (data: any) => {
      const zonaEvento = data?.zona || "Zona 1";

      setZonasEstado((prev) => {
        const estadoAnterior = prev[zonaEvento];

        return {
          ...prev,
          [zonaEvento]: {
            ...(estadoAnterior || {
              manual: false,
              automatico: true,
              bomba: false,
              riegoActivo: false,
              inicioRiego: null,
              sensor: null,
            }),
            bomba: !!data.bomba,
            manual:
              data.manual !== undefined
                ? !!data.manual
                : estadoAnterior?.manual ?? false,
            automatico:
              data.automatico !== undefined
                ? !!data.automatico
                : estadoAnterior?.automatico ?? true,
            riegoActivo:
              data.riegoActivo !== undefined
                ? !!data.riegoActivo
                : estadoAnterior?.riegoActivo ?? false,
          },
        };
      });

      if (zonaEvento === zonaRef.current) {
        setBomba(!!data.bomba || !!data.riegoActivo);

        if (data.manual !== undefined) setManual(!!data.manual);
        if (data.automatico !== undefined) setAutomatico(!!data.automatico);
        if (data.riegoActivo !== undefined) setRiegoActivo(!!data.riegoActivo);

        setRazon(data.razon || "Sin datos");
      }
    };

    const procesarEstado = (data: EstadoZonas) => {
      if (!data) return;

      setZonasEstado(data);

      const estadoActual = data[zonaRef.current];

      if (estadoActual) {
        setManual(!!estadoActual.manual);
        setAutomatico(!!estadoActual.automatico);
        setSensor(estadoActual.sensor || null);

        // No actualizar bomba ni riegoActivo aquí.
        // Eso lo maneja el evento "bomba" y sincronizarControlZona().
      }
    };

    const procesarHistorial = (data: HistorialItem[]) => {
      setHistorial(data || []);
    };

    const procesarEventoAgricola = (evento: any) => {
      const zonaEvento = evento?.zona || "Zona 1";

      setHistorial((prev) => [
        ...prev.slice(-50),
        {
          tipo: evento.prioridad === "critica" ? "alerta" : "automatico",
          zona: zonaEvento,
          evento: `${evento.razon ?? "Evento agrícola"} | ${zonaEvento} | Bomba: ${
            evento.bomba ? "Encendida" : "Apagada"
          }`,
          hora: new Date().toLocaleTimeString("es-MX"),
        },
      ]);

      marcarLectura();
    };

    socket.on("sensor", procesarSensor);
    socket.on("bomba", procesarBomba);
    socket.on("estado", procesarEstado);
    socket.on("historial", procesarHistorial);
    socket.on("alerta-agricola", procesarEventoAgricola);
    socket.on("dashboard", procesarEventoAgricola);

    return () => {
      socket.off("connect");
      socket.off("sensor", procesarSensor);
      socket.off("bomba", procesarBomba);
      socket.off("estado", procesarEstado);
      socket.off("historial", procesarHistorial);
      socket.off("alerta-agricola", procesarEventoAgricola);
      socket.off("dashboard", procesarEventoAgricola);
    };
  }, []);

  const cambiarZona = async (nuevaZona: string) => {
    setZona(nuevaZona);

    try {
      await fetch(`${API_URL}/modo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zona: nuevaZona,
        }),
      });

      zonaRef.current = nuevaZona;
      await sincronizarVistaZona(nuevaZona);
    } catch (error) {
      console.error("Error cambiando zona:", error);
    }
  };

  const cambiarAutomatico = async () => {
    try {
      const nuevoAutomatico = !automatico;

      const res = await fetch(`${API_URL}/modo`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zona,
          automatico: nuevoAutomatico,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setAutomatico(!!data.estado.automatico);
        setManual(!!data.estado.manual);

        await sincronizarControlZona(zona);
        await cargarEstadoGeneral();
      }
    } catch (error) {
      console.error("Error cambiando automático:", error);
    }
  };

  const cambiarManual = async () => {
    try {
      const nuevoManual = !manual;

      const res = await fetch(`${API_URL}/manual`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zona,
          encender: nuevoManual,
        }),
      });

      const data = await res.json();

      if (data.ok) {
        setManual(!!data.estado.manual);
        setAutomatico(!!data.estado.automatico);

        await sincronizarControlZona(zona);
        await cargarEstadoGeneral();
      }
    } catch (error) {
      console.error("Error cambiando manual:", error);
    }
  };

  const actualizarDatos = async () => {
    await cargarEstadoGeneral();
    await sincronizarVistaZona(zona);
    await sincronizarControlZona(zona);
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <main className="flex-1">
        <div className="p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold">Gestión 🌱</h1>
              <p className="text-gray-500 mt-1">
                Control de riego por zona usando datos reales del backend.
              </p>
            </div>

            <button
              onClick={actualizarDatos}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-5 py-2 rounded-xl font-bold transition"
            >
              Actualizar
            </button>
          </div>

          {bloqueoRiego && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl font-semibold">
              🚫 Agua no apta para riego en {zona}. pH fuera de rango.
            </div>
          )}

          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-gray-500 mb-2">Zona actual</p>

              <select
                value={zona}
                onChange={(e) => cambiarZona(e.target.value)}
                className="w-full p-2 border rounded-lg font-semibold"
              >
                {ZONAS.map((z) => (
                  <option key={z} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-gray-500 mb-2">Conexión ESP32</p>

              <div
                className={`w-full py-2 rounded-lg font-bold text-center ${
                  conexionESP32
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {conexionESP32 ? "🟢 Conectado" : "🔴 Sin comunicación"}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-gray-500 mb-2">Riego manual</p>

              <button
                disabled={bloqueoRiego}
                onClick={cambiarManual}
                className={`w-full py-2 rounded-lg font-bold transition ${
                  bloqueoRiego
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : manual
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-black"
                }`}
              >
                {bloqueoRiego
                  ? "Bloqueado por pH"
                  : manual
                  ? "Apagar manual"
                  : "Encender manual"}
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-gray-500 mb-2">Modo automático</p>

              <button
                disabled={manual}
                onClick={cambiarAutomatico}
                className={`w-full py-2 rounded-lg font-bold transition ${
                  manual
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : automatico
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-black"
                }`}
              >
                {manual ? "Bloqueado por manual" : automatico ? "Activo" : "Inactivo"}
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md">
              <p className="text-gray-500 mb-2">Estado bomba</p>

              <div
                className={`w-full py-2 rounded-lg font-bold text-center ${
                  bombaVisual ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}
              >
                {bombaVisual ? "Encendida" : "Apagada"}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-md">
              <p className="text-gray-500">Humedad</p>
              <p className="text-3xl font-bold">{sensor ? `${humedad}%` : "--%"}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-md">
              <p className="text-gray-500">pH</p>
              <p className="text-3xl font-bold">{sensor ? ph : "--"}</p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-md">
              <p className="text-gray-500">Temperatura</p>
              <p className="text-3xl font-bold">
                {sensor ? `${temperatura}°C` : "--°C"}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-md">
              <p className="text-gray-500">Riego activo</p>
              <p
                className={`text-3xl font-bold ${
                  riegoActivo ? "text-blue-600" : "text-gray-700"
                }`}
              >
                {riegoActivo ? "Sí" : "No"}
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 items-start">
            <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col min-h-[520px]">
              <h2 className="font-semibold mb-6 text-lg">Estado del sistema</h2>

              <div className="flex flex-col items-center justify-center flex-1 gap-6">
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
                      strokeDashoffset={720 - (720 * humedadVisual) / 100}
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
                      strokeDashoffset={720 - (720 * humedadVisual) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl font-extrabold">
                      {sensor ? humedadVisual : "--"}%
                    </span>

                    <span className="text-sm text-gray-400">humedad</span>
                  </div>
                </div>

                <p className="font-semibold text-xl text-gray-700">{zona}</p>

                <div
                  className={`px-6 py-2 rounded-full text-sm font-bold shadow-sm transition-all duration-300 ${
                    manual
                      ? "bg-purple-100 text-purple-700"
                      : automatico
                      ? estaRegando
                        ? "bg-blue-100 text-blue-600"
                        : "bg-yellow-100 text-yellow-700"
                      : estaRegando
                      ? "bg-blue-100 text-blue-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {manual
                    ? "🕹️ Control manual"
                    : automatico
                    ? estaRegando
                      ? "🤖 Automático regando"
                      : "🤖 Automático en espera"
                    : estaRegando
                    ? "💧 Riego activo"
                    : "🌱 Riego apagado"}
                </div>

                <p className="text-sm text-gray-500 text-center max-w-md">
                  {cargando ? "Cargando datos..." : razon}
                </p>

                <p className="text-xs text-gray-400">
                  Device ID: {sensor?.deviceId || "Sin dispositivo"}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md flex flex-col min-h-[520px]">
              <h2 className="font-semibold mb-4 text-lg">Historial de {zona}</h2>

              <div className="flex-1 overflow-y-auto pr-2">
                {historialFiltrado.length === 0 ? (
                  <p className="text-gray-400">
                    Sin acciones registradas para esta zona...
                  </p>
                ) : (
                  historialFiltrado.map((h, i) => (
                    <div key={i} className="relative pl-8 mb-6 group">
                      <div className="absolute left-3 top-2 bottom-0 w-[2px] bg-gray-200"></div>

                      <div className="absolute left-1 top-2 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-md"></div>

                      <div className="bg-gray-50 p-4 rounded-xl shadow-sm transition group-hover:shadow-md">
                        <div className="font-semibold text-sm mb-1">
                          {h.tipo === "manual"
                            ? "👨‍🌾 Manual"
                            : h.tipo === "automatico"
                            ? "🤖 Automático"
                            : h.tipo === "bomba"
                            ? "💧 Bomba"
                            : h.tipo === "riego"
                            ? "🚰 Riego"
                            : h.tipo === "alerta"
                            ? "🚫 Alerta"
                            : "⚙️ Sistema"}
                        </div>

                        <div className="text-sm text-gray-700">{h.evento}</div>

                        <div className="text-xs text-gray-400 mt-1">{h.hora}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-white p-6 rounded-2xl shadow-md">
            <h2 className="font-semibold mb-4 text-lg">Resumen de zonas</h2>

            <div className="grid md:grid-cols-4 gap-4">
              {ZONAS.map((z) => {
                const estado = zonasEstado[z];
                const humedadZona = estado?.sensor?.humedad ?? "--";
                const bombaZona = estado?.bomba ?? false;
                const autoZona = estado?.automatico ?? true;
                const manualZona = estado?.manual ?? false;

                return (
                  <button
                    key={z}
                    onClick={() => cambiarZona(z)}
                    className={`text-left p-4 rounded-xl border transition ${
                      zona === z
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <p className="font-bold">{z}</p>

                    <p className="text-sm text-gray-500 mt-1">
                      Humedad: {humedadZona === "--" ? "--" : `${humedadZona}%`}
                    </p>

                    <p className="text-sm text-gray-500">
                      Bomba: {bombaZona ? "Encendida" : "Apagada"}
                    </p>

                    <p className="text-sm text-gray-500">
                      Modo: {manualZona ? "Manual" : autoZona ? "Automático" : "Apagado"}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


