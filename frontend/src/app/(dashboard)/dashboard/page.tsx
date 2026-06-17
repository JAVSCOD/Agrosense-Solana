"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { socket } from "@/lib/socket";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

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

type LecturaGrafica = {
  tiempo: string;
  zona: string;
  humedad: number;
  ph: number;
  temperatura: number;
  bomba: boolean;
};

const API_URL = "/api/riego";
const ZONAS = ["Zona 1", "Zona 2", "Zona 3", "Zona 4"];

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const zonasEstadoRef = useRef<EstadoZonas>({});

  const [zonasEstado, setZonasEstado] = useState<EstadoZonas>({});
  const [data, setData] = useState<LecturaGrafica[]>([]);
  const [clima, setClima] = useState<any>(null);
  const [ultimaLectura, setUltimaLectura] = useState<number | null>(null);
  const [conexionESP32, setConexionESP32] = useState(false);

  const CIUDAD = "Jilotepec Estado de Mexico";

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      router.replace("/login");
      setAuthLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);

      if (!parsedUser.wallet || !parsedUser.pda) {
        localStorage.removeItem("user");
        router.replace("/login");
        return;
      }

      setUser(parsedUser);
    } catch {
      localStorage.removeItem("user");
      router.replace("/login");
    } finally {
      setAuthLoading(false);
    }
  }, [router]);

  const obtenerClima = async () => {
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${
          process.env.NEXT_PUBLIC_WEATHER_API_KEY
        }&q=${encodeURIComponent(CIUDAD)}&lang=es`
      );

      const json = await res.json();

      if (json.current) {
        setClima(json);
      }
    } catch (error) {
      console.error("Error clima:", error);
    }
  };

  useEffect(() => {
    zonasEstadoRef.current = zonasEstado;
  }, [zonasEstado]);

  const sincronizarControlZona = async (zonaSeleccionada: string) => {
    try {
      const res = await fetch(
        `${API_URL}/control?zona=${encodeURIComponent(zonaSeleccionada)}`
      );

      const control = await res.json();

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
            bomba: !!control.bomba || !!control.riegoActivo,
            manual: !!control.manual,
            automatico: !!control.automatico,
            riegoActivo: !!control.riegoActivo,
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
      const json = await res.json();

      const estado = json.data || json || {};
      setZonasEstado(estado);

      const lecturas = Object.entries(estado as EstadoZonas)
        .filter(([, value]) => value?.sensor)
        .map(([zona, value]) => ({
          tiempo: new Date().toLocaleTimeString("es-MX"),
          zona,
          humedad: Number(value.sensor?.humedad ?? 0),
          ph: Number(value.sensor?.ph ?? 0),
          temperatura: Number(
            value.sensor?.temperatura ?? clima?.current?.temp_c ?? 0
          ),
          bomba: !!value.bomba,
        }));

      setData((prev) => [...prev, ...lecturas].slice(-80));

    } catch (error) {
      console.error("Error cargando dashboard:", error);
    }
  };

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

  useEffect(() => {
    obtenerClima();

    const intervalo = setInterval(obtenerClima, 300000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    cargarEstado();
  }, [clima]);

  useEffect(() => {

    const marcarLectura = () => {
      setUltimaLectura(Date.now());
      setConexionESP32(true);
    };

    const procesarEventoAgricola = (evento: any) => {
      marcarLectura();
    };
    
    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      console.log("🟢 Dashboard conectado");
    });

    socket.on("disconnect", () => {
      console.log("🔴 Dashboard desconectado");
    });


    const procesarSensor = (payload: any) => {
      const zonaEvento = payload?.zona || payload?.data?.zona || "Zona 1";
      const sensor = payload?.data || payload;
      const estadoActual = zonasEstadoRef.current[zonaEvento];

      const lectura: LecturaGrafica = {
        tiempo: new Date().toLocaleTimeString("es-MX"),
        zona: zonaEvento,
        humedad: Number(sensor.humedad ?? 0),
        ph: Number(sensor.ph ?? 0),
        temperatura: Number(
          sensor.temperatura ?? clima?.current?.temp_c ?? 0
        ),
        bomba: !!estadoActual?.bomba || !!estadoActual?.riegoActivo,
      };

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
          sensor,
        },
      }));

      setData((prev) => [...prev.slice(-79), lectura]);

      sincronizarControlZona(zonaEvento);

      setUltimaLectura(Date.now());
      setConexionESP32(true);
    };

    const procesarBomba = (evento: any) => {
      const zonaEvento = evento?.zona || "Zona 1";

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
          bomba: !!evento.bomba || !!evento.riegoActivo,
          manual: !!evento.manual,
          automatico:
            evento.automatico !== undefined ? !!evento.automatico : true,
          riegoActivo: !!evento.riegoActivo,
        },
      }));
    };

    const procesarEstado = (estado: EstadoZonas) => {
      if (!estado) return;

      setZonasEstado((prev) => {
        const nuevoEstado: EstadoZonas = { ...prev };

        Object.entries(estado).forEach(([zona, estadoZona]) => {
          const anterior = prev[zona];

          nuevoEstado[zona] = {
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

  const resumen = useMemo(() => {
    const zonasConDatos = ZONAS.map((zona) => zonasEstado[zona]).filter(Boolean);

    const bombasEncendidas = zonasConDatos.filter(
      (z) => z.bomba || z.riegoActivo
    ).length;

    const riegosActivos = zonasConDatos.filter((z) => z.riegoActivo).length;

    const sensores = zonasConDatos
      .map((z) => z.sensor)
      .filter(Boolean) as SensorData[];

    const promedioHumedad =
      sensores.length > 0
        ? Math.round(
            sensores.reduce((acc, s) => acc + Number(s.humedad ?? 0), 0) /
              sensores.length
          )
        : 0;

    const promedioPh =
      sensores.length > 0
        ? (
            sensores.reduce((acc, s) => acc + Number(s.ph ?? 0), 0) /
            sensores.length
          ).toFixed(1)
        : "--";

    return {
      bombasEncendidas,
      riegosActivos,
      promedioHumedad,
      promedioPh,
      zonasConDatos: sensores.length,
    };
  }, [zonasEstado]);

  const dataGrafica = useMemo(() => {
    return data.slice(-20);
  }, [data]);

  const alertas = useMemo(() => {
    return ZONAS.map((zona) => {
      const estado = zonasEstado[zona];
      const sensor = estado?.sensor;

      if (!sensor) {
        return {
          zona,
          mensaje: "Sin datos registrados",
          tipo: "neutral",
        };
      }

      const humedad = Number(sensor.humedad ?? 0);
      const ph = Number(sensor.ph ?? 0);

      if (ph < 6 || ph > 8) {
        return {
          zona,
          mensaje: "pH fuera de rango",
          tipo: "riesgo",
        };
      }

      if (humedad < 30) {
        return {
          zona,
          mensaje: "Humedad baja, requiere riego",
          tipo: "riesgo",
        };
      }

      if (humedad >= 85) {
        return {
          zona,
          mensaje: "Humedad suficiente",
          tipo: "estable",
        };
      }

      return {
        zona,
        mensaje: "Condiciones estables",
        tipo: "estable",
      };
    });
  }, [zonasEstado]);

  if (authLoading) {
    return <p className="p-4">Cargando sesión Web3...</p>;
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <main className="flex-1 p-4">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Dashboard Agrícola 🌱
            </h1>

            <p className="text-sm text-gray-500">
              Bienvenido {user?.nombres || "Usuario Web3"} · Vista general de 4 zonas
            </p>
          </div>

          <button
            onClick={cargarEstado}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-5 py-2 rounded-xl font-bold transition"
          >
            Actualizar
          </button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-6">
          {ZONAS.map((zona) => {
            const estado = zonasEstado[zona];
            const sensor = estado?.sensor;
            
            const humedad = sensor?.humedad ?? "--";
            const ph = sensor?.ph ?? "--";
            const bomba = estado?.bomba ?? false;
            const riegoActivo = estado?.riegoActivo ?? false;
            const bombaVisual = bomba || riegoActivo;

            return (
              <div key={zona} className="bg-white p-6 rounded-2xl shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-lg">{zona}</h2>

                  <span
                    className={`text-xs px-3 py-1 rounded-full font-bold ${
                      bombaVisual ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {bombaVisual ? "Bomba ON" : "Bomba OFF"}
                  </span>
                </div>

                <p className="text-gray-500">Humedad</p>
                <p
                  className={`text-3xl font-bold ${
                    Number(humedad) < 30
                      ? "text-red-600"
                      : Number(humedad) >= 85
                      ? "text-blue-600"
                      : "text-green-600"
                  }`}
                >
                  {humedad === "--" ? "--%" : `${humedad}%`}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">pH</p>
                    <p className="font-bold">{ph}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Riego</p>
                    <p className="font-bold">
                      {riegoActivo ? "Activo" : "Inactivo"}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-4">
                  {sensor?.deviceId || "Sin dispositivo"}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Conexión</p>
            <p
              className={`text-xl font-bold ${
                conexionESP32 ? "text-green-600" : "text-red-600"
              }`}
            >
              {conexionESP32
                ? "🟢 ESP32 Conectado"
                : "🔴 Sin comunicación"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Zonas con datos</p>
            <p className="text-3xl font-bold">{resumen.zonasConDatos}/4</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Bombas encendidas</p>
            <p className="text-3xl font-bold text-blue-600">
              {resumen.bombasEncendidas}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Prom. humedad</p>
            <p className="text-3xl font-bold">
              {resumen.promedioHumedad}%
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Prom. pH</p>
            <p className="text-3xl font-bold">{resumen.promedioPh}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">
                Lecturas recientes del sistema
              </h2>

              <p className="text-sm text-gray-500">Todas las zonas</p>
            </div>

            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={dataGrafica}>
                <defs>
                  <linearGradient
                    id="colorHumedadDashboard"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient
                    id="colorPhDashboard"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient
                    id="colorTempDashboard"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="tiempo" />
                <YAxis />

                <Tooltip
                  labelFormatter={(label) => `Hora: ${label}`}
                  formatter={(value, name) => {
                    const num = Number(value);

                    if (name === "humedad") return [`${num}%`, "Humedad"];
                    if (name === "ph") return [`${num} pH`, "pH"];
                    if (name === "temperatura")
                      return [`${num}°C`, "Temperatura"];

                    return value;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="humedad"
                  stroke="#22C55E"
                  fill="url(#colorHumedadDashboard)"
                  strokeWidth={3}
                />

                <Area
                  type="monotone"
                  dataKey="ph"
                  stroke="#3B82F6"
                  fill="url(#colorPhDashboard)"
                  strokeWidth={3}
                />

                <Area
                  type="monotone"
                  dataKey="temperatura"
                  stroke="#EF4444"
                  fill="url(#colorTempDashboard)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="font-semibold mb-4">Alertas inteligentes</h2>

              <div className="space-y-4">
                {alertas.map((alerta) => (
                  <div
                    key={alerta.zona}
                    className={`p-4 rounded-xl ${
                      alerta.tipo === "riesgo"
                        ? "bg-red-50 text-red-700"
                        : alerta.tipo === "estable"
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-50 text-gray-500"
                    }`}
                  >
                    <p className="font-bold">{alerta.zona}</p>
                    <p className="text-sm">{alerta.mensaje}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="font-semibold mb-2">Clima externo</h2>

              <p className="text-gray-500">
                {clima?.current
                  ? `${clima.current.temp_c}°C - ${clima.current.condition.text}`
                  : "Sin datos del clima"}
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow">
              <h2 className="font-semibold mb-2">Estado global</h2>

              <p className="text-gray-600">
                {resumen.bombasEncendidas > 0
                  ? `${resumen.bombasEncendidas} zona(s) regando actualmente`
                  : "Todas las zonas están sin riego activo"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

