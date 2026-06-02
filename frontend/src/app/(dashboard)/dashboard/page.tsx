"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [data, setData] = useState<any[]>([]);
  const [clima, setClima] = useState<any>(null);

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
        setAuthLoading(false);
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

  // 🌤️ CLIMA API
  useEffect(() => {
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

    obtenerClima();

    const intervalo = setInterval(obtenerClima, 300000);
    return () => clearInterval(intervalo);
  }, []);

  // 🔥 SENSOR
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/riego/sensores");
        const json = await res.json();

        if (json.ok && json.data) {
          const nuevo = {
            tiempo: new Date().toLocaleTimeString(),

            humedad: json.data.humedad,

            // 🌡️ TEMPERATURA DESDE API
            temperatura:
              clima?.current?.temp_c ??
              json.data.temperatura ??
              0,

            // 🌡️ TEMPERATURA SENSOR ESP32
            // temperatura: json.data.temperatura ?? 0,

            ph: json.data.ph,
          };

          setData((prev) => [...prev.slice(-10), nuevo]);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    obtenerDatos();

    const intervalo = setInterval(obtenerDatos, 3000);
    return () => clearInterval(intervalo);
  }, [clima]);

  if (authLoading) {
    return <p className="p-4">Cargando sesión Web3...</p>;
  }

  if (!user) return null;

  const ultimo = data[data.length - 1];

  const obtenerTemperatura = () => {
    if (clima?.current?.temp_c !== undefined) {
      return {
        valor: clima.current.temp_c,
        fuente: "api",
      };
    }

    return {
      valor: ultimo?.temperatura ?? 0,
      fuente: "sensor",
    };
  };

  const temperaturaData = obtenerTemperatura();

  const phValido = (ph: any) => {
    const valor = parseFloat(ph ?? "0");
    return valor >= 6 && valor <= 8;
  };

  const phActual = parseFloat(ultimo?.ph ?? "0");

  const getHumedadStatus = (h: number) => {
    if (h < 30) return "Seco ⚠️";
    if (h <= 85) return "Óptimo ✅";
    return "Exceso 💧";
  };

  const getPhStatus = (ph: number) => {
    if (ph < 6) return "Ácido ⚠️";
    if (ph <= 8) return "Neutro ✅";
    return "Alcalino ⚠️";
  };

  const getTempStatus = (t: number) => {
    if (!t) return "Sin datos";
    if (t < 10) return "Frío ❄️";
    if (t <= 30) return "Óptimo ✅";
    return "Calor 🔥";
  };

  const accionHumedad = (() => {
    if (!ultimo) return "Sin datos";

    if (!phValido(phActual)) {
      return "🚫 Agua no apta";
    }

    if (ultimo.humedad < 30) {
      return "💧 Regar cultivo";
    }

    return "✅ Sin acción";
  })();

  const alerta = (() => {
    if (!ultimo) return "Sin datos";

    if (!phValido(phActual)) {
      return "🚫 pH fuera de rango";
    }

    if (ultimo.humedad < 30 || temperaturaData.valor > 30) {
      return "⚠️ Riesgo";
    }

    return "✅ Estable";
  })();

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <main className="flex-1 p-4">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Dashboard Agrícola
          </h1>
          <p className="text-sm text-gray-500">
            Bienvenido {user?.nombres || "Usuario Web3"}
          </p>
        </div>

        {ultimo && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Humedad</p>
              <h2 className="text-3xl font-bold">{ultimo.humedad}%</h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Ph</p>
              <h2 className="text-3xl font-bold">
                {Number(ultimo.ph).toFixed(2)} pH
              </h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Temperatura</p>
              <h2 className="text-3xl font-bold">
                {temperaturaData.valor > 0
                  ? `${temperaturaData.valor}°C`
                  : "Cargando..."}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Estado Humedad</p>
              <h2 className="text-lg font-bold">
                {getHumedadStatus(ultimo.humedad)}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">Estado pH</p>
              <h2 className="text-lg font-bold">{getPhStatus(phActual)}</h2>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">Estado Temperatura</p>
              <h2 className="text-lg font-bold">
                {getTempStatus(temperaturaData.valor)}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">Acción Humedad</p>
              <h2 className="text-lg font-bold">{accionHumedad}</h2>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">Acción pH</p>
              <h2 className="text-lg font-bold">
                {phActual < 6
                  ? "Revisar fuente de agua 🚫"
                  : phActual <= 8
                  ? "Apto para riego ✅"
                  : "Revisar calidad del agua 🚫"}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">Acción Temperatura</p>
              <h2 className="text-lg font-bold">
                {temperaturaData.valor < 10
                  ? "Proteger cultivo ❄️"
                  : temperaturaData.valor > 30
                  ? "Riego ligero 🌊"
                  : "Condición estable ✅"}
              </h2>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow">
            <h2 className="mb-4 text-lg font-semibold">
              Historial de sensores
            </h2>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorHumedad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>

                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
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

                    if (name === "ph") return [`${num.toFixed(2)} pH`, "pH"];
                    if (name === "humedad")
                      return [`${num.toFixed(0)}%`, "Humedad"];
                    if (name === "temperatura")
                      return [`${num.toFixed(1)}°C`, "Temperatura"];

                    return value;
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="humedad"
                  stroke="#22C55E"
                  fillOpacity={1}
                  fill="url(#colorHumedad)"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={true}
                />

                <Area
                  type="monotone"
                  dataKey="ph"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorPh)"
                  strokeWidth={3}
                  dot={false}
                  isAnimationActive={true}
                />

                <Area
                  type="monotone"
                  dataKey="temperatura"
                  stroke="#EF4444"
                  fillOpacity={1}
                  fill="url(#colorTemp)"
                  strokeWidth={3}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold mb-2">Zona</h2>
              <p>Zona 1</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold mb-2">Última lectura</h2>
              <p>{ultimo?.tiempo}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold mb-2">Recomendación</h2>
              <p className="text-sm text-gray-600">
                {!phValido(phActual)
                  ? "🚫 Agua no apta para riego"
                  : ultimo?.humedad < 30
                  ? "Regar cultivo 💧"
                  : "Condiciones óptimas"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

