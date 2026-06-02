"use client";

import { useEffect, useState } from "react";

export default function ClimaPage() {
  const [clima, setClima] = useState<any>(null);
  const [horaActual, setHoraActual] = useState("");
  const [direccion, setDireccion] = useState("");

  const CIUDAD = "Jilotepec Estado de Mexico";

  /*
  // 🌍 GOOGLE → Coordenadas
  // Esta parte queda comentada por si después quieres volver a usar Google Maps.
  const [coords, setCoords] = useState<any>(null);

  const obtenerCoordenadas = async () => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          CIUDAD
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`
      );

      const data = await res.json();
      console.log("GOOGLE API:", data);

      if (data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;

        setCoords({
          lat: location.lat,
          lon: location.lng,
        });

        setDireccion(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error("Error coordenadas:", error);
    }
  };
  */

  // 🌦️ CLIMA SOLO CON WEATHERAPI
  const obtenerClima = async () => {
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${
          process.env.NEXT_PUBLIC_WEATHER_API_KEY
        }&q=${encodeURIComponent(CIUDAD)}&days=5&lang=es`
      );

      const data = await res.json();
      console.log("CLIMA API:", data);

      if (data.current) {
        setClima(data);
        setDireccion(data.location?.name || CIUDAD);
      } else {
        console.error("Error API clima:", data);
      }
    } catch (error) {
      console.error("Error clima:", error);
    }
  };

  useEffect(() => {
    obtenerClima();

    const intervalo = setInterval(() => {
      obtenerClima();
    }, 300000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    const intervalo = setInterval(() => {
      const ahora = new Date();
      setHoraActual(
        ahora.toLocaleDateString("es-MX") +
          " - " +
          ahora.toLocaleTimeString()
      );
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const vaALloverPronto = () => {
    if (!clima?.forecast?.forecastday?.[0]?.hour) return false;

    return clima.forecast.forecastday[0].hour.some(
      (h: any) => h.chance_of_rain > 60
    );
  };

  const recomendacion = () => {
    if (!clima) return "Cargando...";

    const temp = clima.current.temp_c;
    const humedad = clima.current.humidity;
    const lluvia = vaALloverPronto();

    if (lluvia) return "🌧️ No regar (lluvia próxima)";
    if (humedad > 85) return "💧 Suelo muy húmedo (no regar)";
    if (temp > 32) return "🔥 Regar temprano (alto calor)";
    if (temp < 10) return "❄️ No regar (frío)";
    if (humedad < 40) return "🌱 Regar (suelo seco)";

    return "✅ Condiciones normales";
  };

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <main className="flex-1 p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Clima 🌦️</h1>
          <p className="text-gray-500">{horaActual}</p>
        </div>

        {!clima ? (
          <p className="text-gray-500 animate-pulse">Cargando clima...</p>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500">Temperatura</p>
                <h2 className="text-3xl font-bold">
                  {clima.current.temp_c}°C
                </h2>
                <p className="text-sm text-gray-400">
                  Min: {clima.forecast.forecastday[0].day.mintemp_c}° | Max:{" "}
                  {clima.forecast.forecastday[0].day.maxtemp_c}°
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500">Humedad</p>
                <h2 className="text-3xl font-bold">
                  {clima.current.humidity}%
                </h2>
                <p className="text-sm text-gray-400">
                  Lluvia:{" "}
                  {clima.forecast.forecastday[0].day.daily_chance_of_rain}%
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow">
                <p className="text-gray-500">Clima</p>
                <h2 className="text-xl font-bold capitalize">
                  {clima.current.condition.text}
                </h2>
                <p className="text-sm text-gray-400">
                  Sensación: {clima.current.feelslike_c}°C
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow mb-8">
              <p className="text-gray-500">Ubicación</p>
              <h2 className="text-xl font-bold">
                {direccion || CIUDAD}
              </h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow mb-8">
              <p className="text-gray-500">Recomendación</p>
              <h2 className="text-xl font-bold">{recomendacion()}</h2>
            </div>

            <h2 className="text-xl font-semibold mb-4">
              Temperatura por horas
            </h2>

            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-8">
              {clima.forecast.forecastday[0].hour
                .slice(0, 8)
                .map((h: any, i: number) => (
                  <div
                    key={i}
                    className="bg-white p-3 rounded-xl shadow text-center"
                  >
                    <p className="text-xs text-gray-500">
                      {new Date(h.time).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        hour12: false,
                      })}
                    </p>
                    <p className="font-bold">{h.temp_c}°</p>
                    <p className="text-xs text-blue-500">
                      {h.chance_of_rain}%
                    </p>
                  </div>
                ))}
            </div>

            <h2 className="text-xl font-semibold mb-4">
              Pronóstico de la semana
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {clima.forecast.forecastday.map((dia: any, index: number) => {
                const fecha = new Date(dia.date + "T00:00:00");

                return (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-xl shadow text-center"
                  >
                    <p className="text-sm text-gray-500">
                      {index === 0
                        ? "Hoy"
                        : fecha.toLocaleDateString("es-MX", {
                            weekday: "short",
                          })}
                    </p>

                    <p className="text-lg font-bold">
                      {index === 0 ? clima.current.temp_c : dia.day.avgtemp_c}
                      °C
                    </p>

                    <p className="text-xs capitalize">
                      {dia.day.condition.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

