"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Analitica() {

  const [data, setData] = useState<any[]>([]);

  // 🌤️ CLIMA API
  const [clima, setClima] = useState<any>(null);

  // 🌤️ OBTENER TEMPERATURA DESDE WEATHER API
  useEffect(() => {

    const obtenerClima = async () => {
      try {

        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${process.env.NEXT_PUBLIC_WEATHER_API_KEY}&q=Jilotepec&lang=es`
        );

        const json = await res.json();

        setClima(json);

      } catch (error) {
        console.error("Error obteniendo clima:", error);
      }
    };

    obtenerClima();

    // 🔥 ACTUALIZA CADA 5 MIN
    const intervalo = setInterval(obtenerClima, 300000);

    return () => clearInterval(intervalo);

  }, []);

  // 🔥 DATOS DEL SENSOR
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

            // 🌱 SENSOR REAL
            humedad: json.data.humedad ?? 0,

            // 🌡️ TEMPERATURA DESDE API
            temperatura: clima?.current?.temp_c ?? 0,

            // ⚗️ SENSOR REAL
            ph: Number(
              parseFloat(json.data.ph ?? 0).toFixed(2)
            ),
          };

          setData((prev) => [
            ...prev.slice(-20),
            nuevo,
          ]);
        }

      } catch (error) {
        console.error("Error obteniendo datos:", error);
      }
    };

    obtenerDatos();

    const intervalo = setInterval(obtenerDatos, 3000);

    return () => clearInterval(intervalo);

  }, [clima]);

  // 🔥 ÍNDICE INTELIGENTE
  const calcularIndice = (dato: any) => {

    const {
      humedad: h,
      temperatura: t,
      ph,
    } = dato;

    const scoreH =
      1 - Math.abs(h - 55) / 55;

    const scoreT =
      1 - Math.abs(t - 24) / 24;

    const scorePH =
      1 - Math.abs(ph - 6.5) / 6.5;

    return (
      (
        Math.max(0, scoreH) +
        Math.max(0, scoreT) +
        Math.max(0, scorePH)
      ) /
      3 *
      100
    );
  };

  // 🔥 DATA FINAL
  const dataConIndice = data.map((d) => ({
    ...d,
    indice: calcularIndice(d),
  }));

  const ultimo =
    dataConIndice[dataConIndice.length - 1];

  const alerta =
    ultimo &&
    (
      ultimo.humedad < 30 ||
      ultimo.temperatura > 30
    )
      ? "⚠️ Riesgo"
      : "✅ Estable";

  // 🔥 TENDENCIAS
  const tendencia = (key: string) => {

    if (dataConIndice.length < 2) {
      return "Sin datos";
    }

    return dataConIndice[dataConIndice.length - 1][key] >
      dataConIndice[dataConIndice.length - 2][key]
      ? "📈 Subiendo"
      : "📉 Bajando";
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">

      <main className="flex-1 p-4">

        <h1 className="text-3xl font-bold mb-6">
          Analítica 📊
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* IZQUIERDA */}
          <div className="lg:col-span-2 space-y-6">

            {/* 🟢 HUMEDAD */}
            <div className="bg-white p-6 rounded-xl shadow">

              <h2 className="mb-4 font-semibold">
                Sensor en tiempo real (HUMEDAD)
              </h2>

              <ResponsiveContainer width="100%" height={220}>

                <AreaChart data={dataConIndice}>

                  <defs>
                    <linearGradient
                      id="humedad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#22C55E"
                        stopOpacity={0.4}
                      />

                      <stop
                        offset="95%"
                        stopColor="#22C55E"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="tiempo" />

                  <YAxis />

                  <Tooltip
                    formatter={(v) => [
                      `${Number(v).toFixed(0)}%`,
                      "Humedad",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="humedad"
                    stroke="#22C55E"
                    fill="url(#humedad)"
                    strokeWidth={2}
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

            {/* 🔵 PH */}
            <div className="bg-white p-6 rounded-xl shadow">

              <h2 className="mb-4 font-semibold">
                Sensor en tiempo real (PH)
              </h2>

              <ResponsiveContainer width="100%" height={220}>

                <AreaChart data={dataConIndice}>

                  <defs>
                    <linearGradient
                      id="ph"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#3B82F6"
                        stopOpacity={0.4}
                      />

                      <stop
                        offset="95%"
                        stopColor="#3B82F6"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="tiempo" />

                  <YAxis />

                  <Tooltip
                    formatter={(v) => [
                      `${Number(v).toFixed(2)} pH`,
                      "pH",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="ph"
                    stroke="#3B82F6"
                    fill="url(#ph)"
                    strokeWidth={2}
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

            {/* 🔴 TEMPERATURA */}
            <div className="bg-white p-6 rounded-xl shadow">

              <h2 className="mb-4 font-semibold">
                Sensor en tiempo real (TEMPERATURA)
              </h2>

              <ResponsiveContainer width="100%" height={220}>

                <AreaChart data={dataConIndice}>

                  <defs>
                    <linearGradient
                      id="temp"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#EF4444"
                        stopOpacity={0.4}
                      />

                      <stop
                        offset="95%"
                        stopColor="#EF4444"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="tiempo" />

                  <YAxis />

                  <Tooltip
                    formatter={(v) => [
                      `${Number(v).toFixed(1)}°C`,
                      "Temp",
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="temperatura"
                    stroke="#EF4444"
                    fill="url(#temp)"
                    strokeWidth={2}
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </div>

          {/* DERECHA */}
          <div className="space-y-6">

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold">
                Zona
              </h2>

              <p>Zona 1</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold">
                Última lectura
              </h2>

              <p>{ultimo?.tiempo}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold">
                Tendencia humedad
              </h2>

              <p>{tendencia("humedad")}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold">
                Tendencia pH
              </h2>

              <p>{tendencia("ph")}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold">
                Tendencia temperatura
              </h2>

              <p>{tendencia("temperatura")}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold">
                Tendencia índice
              </h2>

              <p>{tendencia("indice")}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold">
                Estado general
              </h2>

              <p>{alerta}</p>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

