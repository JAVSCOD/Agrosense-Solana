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

const API_URL = "/api/riego";
const ZONAS = ["Zona 1", "Zona 2", "Zona 3", "Zona 4"];

const INFO_ZONAS: Record<string, { sector: string; cultivo: string }> = {
  "Zona 1": { sector: "Invernadero Norte", cultivo: "Tomate" },
  "Zona 2": { sector: "Invernadero Sur", cultivo: "Lechuga" },
  "Zona 3": { sector: "Exterior", cultivo: "Maíz" },
  "Zona 4": { sector: "General", cultivo: "Hortalizas" },
};

export default function Sistema() {
  const [zona, setZona] = useState("Zona 1");
  const zonaRef = useRef("Zona 1");
  const [zonasEstado, setZonasEstado] = useState<EstadoZonas>({});
  const [sensor, setSensor] = useState<SensorData | null>(null);
  const [ultimaLectura, setUltimaLectura] = useState<number | null>(null);
  const [conexionESP32, setConexionESP32] = useState(false);

  const [control, setControl] = useState({
    bomba: false,
    manual: false,
    automatico: true,
    riegoActivo: false,
    razon: "Sin datos",
  });

  const [hora, setHora] = useState("");
  const [clima, setClima] = useState<any>(null);

  const CIUDAD = "Jilotepec Estado de Mexico";

  const humedad = sensor?.humedad ?? 0;
  const ph = sensor?.ph ?? 0;
  const temperatura = sensor?.temperatura ?? clima?.current?.temp_c ?? 0;
  const bombaVisual = control.bomba || control.riegoActivo;

  const infoZona = INFO_ZONAS[zona] || {
    sector: "Sin sector",
    cultivo: "Sin cultivo",
  };

  const marcarLectura = () => {
    const ahora = Date.now();
    setUltimaLectura(ahora);
    setConexionESP32(true);
    setHora(new Date().toLocaleTimeString("es-MX"));
  };

  const obtenerClima = async () => {
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${
          process.env.NEXT_PUBLIC_WEATHER_API_KEY
        }&q=${encodeURIComponent(CIUDAD)}&lang=es`
      );

      const data = await res.json();

      if (data.current) {
        setClima(data);
      }
    } catch (error) {
      console.error("Error clima:", error);
    }
  };

  const sincronizarControlZona = async (zonaSeleccionada = zonaRef.current) => {
    try {
      const controlRes = await fetch(
        `${API_URL}/control?zona=${encodeURIComponent(zonaSeleccionada)}`
      );

      const controlData = await controlRes.json();

      if (zonaSeleccionada === zonaRef.current) {
        setControl({
          bomba: !!controlData.bomba || !!controlData.riegoActivo,
          manual: !!controlData.manual,
          automatico: !!controlData.automatico,
          riegoActivo: !!controlData.riegoActivo,
          razon: controlData.razon || "Sin datos",
        });
      }

      setZonasEstado((prev) => {
        const anterior = prev[zonaSeleccionada];

        return {
          ...prev,
          [zonaSeleccionada]: {
            ...(anterior || {
              manual: false,
              automatico: true,
              bomba: false,
              riegoActivo: false,
              inicioRiego: null,
              sensor: null,
            }),
            bomba: !!controlData.bomba || !!controlData.riegoActivo,
            manual: !!controlData.manual,
            automatico: !!controlData.automatico,
            riegoActivo: !!controlData.riegoActivo,
          },
        };
      });
    } catch (error) {
      console.error("Error sincronizando control:", error);
    }
  };

  const cargarEstado = async () => {
    try {
      const res = await fetch(`${API_URL}/estado`);
      const data = await res.json();

      const estadoData = data.data || data || {};
      setZonasEstado(estadoData);

      const zonaActual = estadoData[zona];

      if (zonaActual) {
        setSensor(zonaActual.sensor || null);

        setControl({
          bomba: !!zonaActual.bomba || !!zonaActual.riegoActivo,
          manual: !!zonaActual.manual,
          automatico: !!zonaActual.automatico,
          riegoActivo: !!zonaActual.riegoActivo,
          razon: "Estado cargado correctamente",
        });
      }
    } catch (error) {
      console.error("Error cargando estado:", error);
    }
  };

  const cargarZona = async (zonaSeleccionada = zona) => {
    try {
      const sensorRes = await fetch(
        `${API_URL}/sensores?zona=${encodeURIComponent(zonaSeleccionada)}`
      );

      const sensorData = await sensorRes.json();
      setSensor(sensorData.data || null);

      const controlRes = await fetch(
        `${API_URL}/control?zona=${encodeURIComponent(zonaSeleccionada)}`
      );

      const controlData = await controlRes.json();

      setControl({
        bomba: !!controlData.bomba || !!controlData.riegoActivo,
        manual: !!controlData.manual,
        automatico: !!controlData.automatico,
        riegoActivo: !!controlData.riegoActivo,
        razon: controlData.razon || "Sin datos",
      });
    } catch (error) {
      console.error("Error cargando zona:", error);
    }
  };

  useEffect(() => {
    obtenerClima();
    cargarEstado();
    cargarZona(zona);

    const climaInterval = setInterval(obtenerClima, 300000);

    return () => clearInterval(climaInterval);
  }, []);

  useEffect(() => {
    zonaRef.current = zona;
    cargarZona(zona);
  }, [zona]);

  useEffect(() => {
    const intervaloConexion = setInterval(() => {
      if (!ultimaLectura) {
        setConexionESP32(false);
        return;
      }

      const tiempoSinDatos = Date.now() - ultimaLectura;

      setConexionESP32(tiempoSinDatos <= 10000);
    }, 1000);

    return () => clearInterval(intervaloConexion);
  }, [ultimaLectura]);

  useEffect(() => {

    const procesarEventoAgricola = () => {
      marcarLectura();
    };
    
    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      console.log("🟢 Socket conectado en Sistema");
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket desconectado en Sistema");
    });

    const procesarSensor = (payload: any) => {
      const zonaEvento = payload?.zona || payload?.data?.zona || "Zona 1";
      const data = payload?.data || payload;

      setZonasEstado((prev) => ({
        ...prev,
        [zonaEvento]: {
          ...(prev[zonaEvento] || {
            manual: false,
            automatico: true,
            bomba: false,
            riegoActivo: false,
            inicioRiego: null,
            sensor: null,
          }),
          sensor: data,
        },
      }));

      if (zonaEvento === zonaRef.current) {
        setSensor(data);
        sincronizarControlZona(zonaEvento);
      }

      marcarLectura();
    };

    const procesarBomba = (data: any) => {
      const zonaEvento = data?.zona || "Zona 1";

      setZonasEstado((prev) => ({
        ...prev,
        [zonaEvento]: {
          ...(prev[zonaEvento] || {
            manual: false,
            automatico: true,
            bomba: false,
            riegoActivo: false,
            inicioRiego: null,
            sensor: null,
          }),
          bomba: !!data.bomba,
          manual: !!data.manual,
          automatico:
            data.automatico !== undefined ? !!data.automatico : true,
          riegoActivo: !!data.riegoActivo,
        },
      }));

      if (zonaEvento === zonaRef.current) {
        setControl({
          bomba: !!data.bomba || !!data.riegoActivo,
          manual: !!data.manual,
          automatico:
            data.automatico !== undefined ? !!data.automatico : true,
          riegoActivo: !!data.riegoActivo,
          razon: data.razon || "Sin datos",
        });
      }
    };

    const procesarEstado = (data: EstadoZonas) => {
      if (!data) return;

      setZonasEstado((prev) => {
        const nuevoEstado: EstadoZonas = { ...prev };

        Object.entries(data).forEach(([zonaItem, estadoZona]) => {
          const anterior = prev[zonaItem];

          nuevoEstado[zonaItem] = {
            ...(anterior || estadoZona),
            manual: estadoZona.manual,
            automatico: estadoZona.automatico,
            sensor: estadoZona.sensor || anterior?.sensor || null,
            bomba: anterior?.bomba ?? estadoZona.bomba,
            riegoActivo: anterior?.riegoActivo ?? estadoZona.riegoActivo,
            inicioRiego: estadoZona.inicioRiego,
          };
        });

        return nuevoEstado;
      });

      const estadoActual = data[zonaRef.current];

      if (estadoActual) {
        setSensor(estadoActual.sensor || null);

        setControl((prev) => ({
          ...prev,
          manual: !!estadoActual.manual,
          automatico: !!estadoActual.automatico,
        }));
      }
    };


    socket.on("sensor", procesarSensor);
    socket.on("bomba", procesarBomba);
    socket.on("estado", procesarEstado);
    socket.on("alerta-agricola", procesarEventoAgricola);
    socket.on("dashboard", procesarEventoAgricola);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("sensor", procesarSensor);
      socket.off("bomba", procesarBomba);
      socket.off("estado", procesarEstado);
      socket.off("alerta-agricola", procesarEventoAgricola);
      socket.off("dashboard", procesarEventoAgricola);
    };
  }, []);

  const cambiarZona = (nuevaZona: string) => {
    setZona(nuevaZona);
  };

  const actualizarDatos = async () => {
    await cargarEstado();
    await cargarZona(zona);
  };

  const estadoRiego = () => {
    if (control.manual && bombaVisual) return "🕹️ Manual encendido";
    if (bombaVisual && control.riegoActivo) return "💧 Riego automático";
    if (control.automatico) return "🤖 Automático en espera";
    return "❌ Inactivo";
  };

  const recomendacion = () => {
    if (!sensor) return "Sin datos";

    if (ph < 6 || ph > 8) return "🚫 pH fuera de rango";
    if (humedad < 30) return "⚠️ Suelo seco - requiere riego";
    if (humedad >= 85) return "✅ Humedad suficiente";
    return "🌱 Condiciones estables";
  };

  const colorHumedad = () => {
    if (!sensor) return "text-gray-500";
    if (humedad < 30) return "text-red-600";
    if (humedad >= 85) return "text-blue-600";
    return "text-green-600";
  };

  const resumenZonas = useMemo(() => {
    return ZONAS.map((z) => ({
      zona: z,
      estado: zonasEstado[z],
    }));
  }, [zonasEstado]);

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <main className="flex-1 p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Sistema ⚙️</h1>
            <p className="text-gray-500 mt-1">
              Monitoreo general del sistema por zona.
            </p>
          </div>

          <button
            onClick={actualizarDatos}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-5 py-2 rounded-xl font-bold transition"
          >
            Actualizar
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500 mb-2">Zona actual</p>

            <select
              value={zona}
              onChange={(e) => cambiarZona(e.target.value)}
              className="w-full border rounded-lg p-2 font-semibold"
            >
              {ZONAS.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Conexión ESP32</p>
            <p
              className={`text-lg font-bold ${
                conexionESP32 ? "text-green-600" : "text-red-600"
              }`}
            >
              {conexionESP32 ? "🟢 Conectado" : "🔴 Sin comunicación"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Estado bomba</p>
            <p
              className={`text-lg font-bold ${
                bombaVisual ? "text-blue-600" : "text-gray-600"
              }`}
            >
              {bombaVisual ? "Encendida" : "Apagada"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Modo</p>
            <p className="text-lg font-bold">
              {control.manual
                ? "Manual"
                : control.automatico
                ? "Automático"
                : "Inactivo"}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Humedad</p>
            <p className={`text-3xl font-bold ${colorHumedad()}`}>
              {sensor ? `${humedad}%` : "--%"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">pH</p>
            <p className="text-3xl font-bold">{sensor ? ph : "--"}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Temperatura</p>
            <p className="text-3xl font-bold">
              {sensor ? `${temperatura}°C` : "--°C"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Riego activo</p>
            <p
              className={`text-3xl font-bold ${
                control.riegoActivo ? "text-blue-600" : "text-gray-700"
              }`}
            >
              {control.riegoActivo ? "Sí" : "No"}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-6 rounded-3xl shadow">
            <h2 className="font-semibold mb-4 text-2xl">
              Decisión inteligente
            </h2>

            <p className="text-gray-500">Estado del riego</p>
            <p className="text-xl font-bold mb-4">{estadoRiego()}</p>

            <p className="text-gray-500">Razón</p>
            <p className="font-semibold mb-4">{control.razon}</p>

            <p className="text-gray-500">Recomendación</p>
            <p className="font-semibold">{recomendacion()}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow">
            <h2 className="font-semibold mb-4 text-2xl">Zona agrícola</h2>

            <p className="text-gray-500">Zona</p>
            <p className="font-bold">{zona}</p>

            <p className="text-gray-500 mt-4">Dispositivo</p>
            <p className="font-bold">
              {sensor?.deviceId || "Sin dispositivo"}
            </p>

            <p className="text-gray-500 mt-4">Sector</p>
            <p className="font-bold">{infoZona.sector}</p>

            <p className="text-gray-500 mt-4">Cultivo</p>
            <p className="font-bold">{infoZona.cultivo}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow">
            <h2 className="font-semibold mb-4 text-2xl">
              Resumen de zonas
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {resumenZonas.map(({ zona: z, estado }) => (
                <button
                  key={z}
                  onClick={() => cambiarZona(z)}
                  className={`text-left p-4 rounded-xl border transition ${
                    zona === z
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <p className="font-bold">{z}</p>

                  <p className="text-sm text-gray-500 mt-1">
                    Humedad:{" "}
                    {estado?.sensor?.humedad !== undefined
                      ? `${estado.sensor.humedad}%`
                      : "--%"}
                  </p>

                  <p className="text-sm text-gray-500">
                    Bomba: {estado?.bomba || estado?.riegoActivo ? "Encendida" : "Apagada"}
                  </p>

                  <p className="text-sm text-gray-500">
                    Modo:{" "}
                    {estado?.manual
                      ? "Manual"
                      : estado?.automatico
                      ? "Automático"
                      : "Inactivo"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Última lectura ESP32</p>
              <p>{hora || "--"}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Clima externo</p>
              <p className="font-semibold">
                {clima?.current
                  ? `${clima.current.temp_c}°C - ${clima.current.condition.text}`
                  : "Sin datos del clima"}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Estado general</p>
              <p className="font-semibold">
                {conexionESP32
                  ? `${zona} monitoreada correctamente`
                  : `${zona} sin comunicación con ESP32`}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

