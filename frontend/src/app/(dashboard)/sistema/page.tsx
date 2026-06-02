"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sistema() {
  const pathname = usePathname();

  const [sensores, setSensores] = useState<any[]>([]);
  const [conexion, setConexion] = useState(false);
  const [bomba, setBomba] = useState(false);

  const [estado, setEstado] = useState({
    riego: false,
    automatico: true,
    zona: "Zona 1",
  });

  const [hora, setHora] = useState("");

  // 🌦️ API CLIMA
  const [clima, setClima] = useState<any>(null);
  const CIUDAD = "Jilotepec Estado de Mexico";

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

  // 🔄 Obtener TODO cada 2s (CORREGIDO)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🔹 CONTROL REAL (ESP32)
        const controlRes = await fetch("http://localhost:8080/api/riego/control")
        const controlData = await controlRes.json();

        setBomba(!!controlData.bomba);

        // 🔹 DATOS SENSOR (CORRECTO)
        const sensorRes = await fetch("http://localhost:8080/api/riego/sensores")
        const sensorJson = await sensorRes.json();

        if (sensorJson.ok && sensorJson.data) {
          const dato = sensorJson.data;

          setSensores(prev => {
            const nuevos = [...prev, dato];
            if (nuevos.length > 6) nuevos.shift();
            return nuevos;
          });

          setConexion(true);
        } else {
          setConexion(false);
        }

        setHora(new Date().toLocaleTimeString());

      } catch (error) {
        console.error(error);
        setConexion(false);
      }
    };

    fetchData();
    obtenerClima();

    const interval = setInterval(fetchData, 2000);

    const climaInterval = setInterval(() => {
      obtenerClima();
    }, 300000);

    return () => {
      clearInterval(interval);
      clearInterval(climaInterval);
    };
  }, []);

  // 📌 Último dato
  const ultimoSensor = sensores[sensores.length - 1];

  // 🎯 Estado riego (REAL)
  const obtenerEstadoRiego = () => {
    if (estado.automatico) return "🤖 Automático activo";
    if (bomba) return "💧 Riego encendido";
    return "❌ Inactivo";
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <main className="flex-1 p-4">

        <h1 className="text-3xl font-bold mb-6">
          Sistema ⚙️
        </h1>

        {/* TARJETAS */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">

          {/* CONEXIÓN */}
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Conexión</p>
            <p className={`text-lg font-bold ${conexion ? "text-green-600" : "text-red-600"}`}>
              {conexion ? "🟢 Conectado" : "🔴 Desconectado"}
            </p>
          </div>

          {/* HUMEDAD */}
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Humedad del suelo</p>
            <p className="text-2xl font-bold">
              {ultimoSensor?.humedad ?? "--"}%
            </p>
          </div>

          {/* ESTADO RIEGO */}
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Estado del riego</p>
            <p className="text-lg font-bold">
              {obtenerEstadoRiego()}
            </p>
          </div>

        </div>

        {/* ESTADO GENERAL */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* HISTORIAL */}
          <div className="bg-white p-6 rounded-3xl shadow">
            <h2 className="font-semibold mb-2 text-2xl">
              Estado general del sistema
            </h2>

            <div className="max-h-80 overflow-y-auto">
              {sensores.length === 0 ? (
                <p>Esperando datos del sensor...</p>
              ) : (
                sensores.map((s, index) => (
                  <div key={index} className="mb-3 text-lg">
                    🌱 Humedad: {s?.humedad ?? "--"}% <br />
                    🧪 pH: {s?.ph ?? "--"} <br />

                    {/* 🌡️ API CLIMA */}
                    🌡️ Temperatura: {clima?.current?.temp_c ?? "--"}°C

                    {/* 🌡️ SENSOR ESP32 */}
                    {/* 🌡️ Temperatura: {s?.temperatura ?? "--"}°C */}

                  </div>
                ))
              )}
            </div>
          </div>

          {/* INFO LATERAL */}
          <div className="space-y-4">

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Zona</p>
              <p>{estado.zona}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Última lectura</p>
              <p>{hora}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Recomendación</p>
              <p>
                {!ultimoSensor
                  ? "Sin datos"
                  : ultimoSensor.humedad < 30
                  ? "⚠️ Suelo seco - Regar"
                  : ultimoSensor.ph < 5.5
                  ? "⚠️ pH ácido"
                  : ultimoSensor.ph > 7.5
                  ? "⚠️ pH alcalino"
                  : "✅ Condiciones óptimas"}
              </p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}

