"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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

  const { data: session, status } = useSession();

  const [data, setData] = useState<any[]>([]);
  const [clima, setClima] = useState<any>(null);

  // 🔐 PROTECCIÓN
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
    }
  }, [session, status, router]);

  // 🔥 SENSOR
  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await fetch(
          "http://localhost:8080/api/riego/sensores"
        );
        const json = await res.json();

        if (json.ok && json.data) {
          const nuevo = {
            tiempo: new Date().toLocaleTimeString(),
            humedad: json.data.humedad,

            // ❌ SENSOR DESACTIVADO TEMPORALMENTE
            // temperatura: json.data.temperatura,

            // ✅ USAR API
            temperatura: clima?.current?.temp_c ?? 0,

            ph: json.data.ph,
          };

          setData((prev) => [...prev.slice(-10), nuevo]);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const intervalo = setInterval(obtenerDatos, 3000);
    return () => clearInterval(intervalo);
  }, [clima]); // 🔥 IMPORTANTE

  // 🌤️ CLIMA
  // 🌤️ CLIMA (MISMA API QUE TU PÁGINA CLIMA)
  useEffect(() => {
    const obtenerClima = async () => {
      try {
        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=Jilotepec&lang=es`
        );

        const data = await res.json();
        setClima(data);
      } catch (error) {
        console.error("Error clima:", error);
      }
    };

    obtenerClima();

    // refresca cada 5 min
    const intervalo = setInterval(obtenerClima, 300000);
    return () => clearInterval(intervalo);
  }, []);

  if (status === "loading") {
    return <p className="p-4">Cargando sesión...</p>;
  }

  if (!session) return null;

  const ultimo = data[data.length - 1];

  // 🔥 TEMPERATURA INTELIGENTE (SENSOR + API)
  // 🔥 TEMPERATURA (SOLO API POR AHORA)
  const obtenerTemperatura = () => {
    if (clima?.current?.temp_c) {
      return {
        valor: clima.current.temp_c,
        fuente: "api",
      };
    }

    return {
      valor: 0,
      fuente: "none",
    };
  };

  const temperaturaData = obtenerTemperatura();

  // 🔥 VALIDADOR PH
  const phValido = (ph: any) => {
    const valor = parseFloat(ph ?? "0");
    return valor >= 5 && valor <= 8;
  };

  const phActual = parseFloat(ultimo?.ph ?? "0");

  // 🌧️ HUMEDAD
  const getHumedadStatus = (h: number) => {
    if (h < 30) return "Seco ⚠️";
    if (h <= 70) return "Óptimo ✅";
    return "Exceso 💧";
  };

  // ⚗️ PH
  const getPhStatus = (ph: number) => {
    if (ph < 5) return "Ácido ⚠️";
    if (ph <= 8) return "Neutro ✅";
    return "Alcalino ⚠️";
  };

  // 🌡️ TEMPERATURA
  const getTempStatus = (t: number) => {
    if (!t) return "Sin datos";
    if (t < 10) return "Frío ❄️";
    if (t <= 30) return "Óptimo ✅";
    return "Calor 🔥";
  };

  // 🔥 ACCIÓN HUMEDAD
  const accionHumedad = (() => {
    if (!ultimo) return "Sin datos";

    if (!phValido(phActual)) {
      return "🚫 Agua no apta";
    }

    if (ultimo.humedad < 40) {
      return "💧 Regar cultivo";
    }

    return "✅ Sin acción";
  })();

  // 🔥 ALERTA
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
            Bienvenido {session.user?.name}
          </p>
        </div>

        {ultimo && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Humedad</p>
              <h2 className="text-3xl font-bold">
                {ultimo.humedad}%
              </h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Ph</p>
              <h2 className="text-3xl font-bold">
                {Number(ultimo.ph).toFixed(2)} pH
              </h2>
            </div>

            {/* 🔥 TEMPERATURA HÍBRIDA */}
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
              <h2 className="text-lg font-bold">
                {getPhStatus(phActual)}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">Estado Temperatura</p>
              <h2 className="text-lg font-bold">
                {getTempStatus(temperaturaData.valor)}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">Acción Humedad</p>
              <h2 className="text-lg font-bold">
                {accionHumedad}
              </h2>
            </div>

            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-500">Acción pH</p>
              <h2 className="text-lg font-bold">
                {phActual < 5
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

                {/* 🔥 DEGRADADOS */}
                <defs>
                  <linearGradient id="colorHumedad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                  </linearGradient>

                  <linearGradient id="colorPh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>

                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>

                </defs>

                {/* GRID SUAVE */}
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />

                <XAxis dataKey="tiempo" />
                <YAxis />

                <Tooltip
                  labelFormatter={(label) => `Hora: ${label}`}
                  formatter={(value, name) => {
                    const num = Number(value);

                    if (name === "ph") return [`${num.toFixed(2)} pH`, "pH"];
                    if (name === "humedad") return [`${num.toFixed(0)}%`, "Humedad"];

                    return value;
                  }}
                />

                {/* 🌱 HUMEDAD */}
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

                {/* 💧 PH */}
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

                {/* TEMPERATURA */}
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
                  : clima?.weather?.[0]?.main === "Rain"
                  ? "No regar (lluvia)"
                  : "Condiciones óptimas"}
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

