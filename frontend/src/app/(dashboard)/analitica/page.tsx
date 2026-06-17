"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
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
  indice?: number;
};

const API_URL = "/api/riego";
const ZONAS = ["Zona 1", "Zona 2", "Zona 3", "Zona 4"];

export default function Analitica() {
  const [zonaActual, setZonaActual] = useState("Zona 1");
  const zonaRef = useRef("Zona 1");
  const zonasEstadoRef = useRef<EstadoZonas>({});
  const [zonasEstado, setZonasEstado] = useState<EstadoZonas>({});
  const [data, setData] = useState<LecturaGrafica[]>([]);
  const [clima, setClima] = useState<any>(null);

  const [ultimaLectura, setUltimaLectura] = useState<number | null>(null);
  const [conexionESP32, setConexionESP32] = useState(false);

  const CIUDAD = "Jilotepec Estado de Mexico";

  const marcarLectura = () => {
    setUltimaLectura(Date.now());
    setConexionESP32(true);
  };

  const obtenerClima = async () => {
    try {
      const res = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${
          process.env.NEXT_PUBLIC_WEATHER_API_KEY
        }&q=${encodeURIComponent(CIUDAD)}&lang=es`
      );

      const json = await res.json();

      if (json.current) setClima(json);
    } catch (error) {
      console.error("Error obteniendo clima:", error);
    }
  };

  const calcularIndice = (dato: LecturaGrafica) => {
    const h = dato.humedad;
    const t = dato.temperatura;
    const ph = dato.ph;

    const scoreH = 1 - Math.abs(h - 55) / 55;
    const scoreT = 1 - Math.abs(t - 24) / 24;
    const scorePH = 1 - Math.abs(ph - 6.5) / 6.5;

    return Number(
      (
        ((Math.max(0, scoreH) +
          Math.max(0, scoreT) +
          Math.max(0, scorePH)) /
          3) *
        100
      ).toFixed(1)
    );
  };

  const cargarEstado = async () => {
    try {
      const res = await fetch(`${API_URL}/estado`);
      const json = await res.json();

      const estado = json.data || json || {};
      setZonasEstado(estado);

      const lecturasIniciales: LecturaGrafica[] = Object.entries(
        estado as EstadoZonas
      )
        .filter(([, value]) => value?.sensor)
        .map(([zona, value]) => ({
          tiempo: new Date().toLocaleTimeString("es-MX"),
          zona,
          humedad: Number(value.sensor?.humedad ?? 0),
          ph: Number(value.sensor?.ph ?? 0),
          temperatura: Number(
            value.sensor?.temperatura ?? clima?.current?.temp_c ?? 0
          ),
          bomba: !!value.bomba || !!value.riegoActivo,
        }));

      setData((prev) => [...prev, ...lecturasIniciales].slice(-80));
    } catch (error) {
      console.error("Error cargando estado:", error);
    }
  };

  useEffect(() => {
    obtenerClima();

    const intervalo = setInterval(obtenerClima, 300000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    cargarEstado();
  }, []);

  useEffect(() => {
    zonaRef.current = zonaActual;
  }, [zonaActual]);

  useEffect(() => {
    zonasEstadoRef.current = zonasEstado;
  }, [zonasEstado]);

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

    const procesarEventoAgricola = () => {
      marcarLectura();
    };


    if (!socket.connected) socket.connect();

    socket.on("connect", () => {
      console.log("🟢 Analítica conectada por Socket.IO");
    });

    socket.on("disconnect", () => {
      console.log("🔴 Analítica desconectada de Socket.IO");
    });

    const procesarSensor = (payload: any) => {
      const zonaEvento = payload?.zona || payload?.data?.zona || "Zona 1";
      const sensor = payload?.data || payload;
      const estadoActual = zonasEstadoRef.current[zonaEvento];
      
      const nuevaLectura: LecturaGrafica = {
        tiempo: new Date().toLocaleTimeString("es-MX"),
        zona: zonaEvento,
        humedad: Number(sensor.humedad ?? 0),
        ph: Number(parseFloat(sensor.ph ?? 0).toFixed(2)),
        temperatura: Number(sensor.temperatura ?? clima?.current?.temp_c ?? 0),
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

      setData((prev) => [...prev.slice(-79), nuevaLectura]);
      sincronizarControlZona(zonaEvento);
      marcarLectura();
    };

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

  const dataFiltrada = useMemo(() => {
    return data
      .filter((item) => item.zona === zonaActual)
      .map((item) => ({
        ...item,
        indice: calcularIndice(item),
      }));
  }, [data, zonaActual]);

  const ultimo = dataFiltrada[dataFiltrada.length - 1];

  const tendencia = (key: keyof LecturaGrafica | "indice") => {
    if (dataFiltrada.length < 2) return "Sin datos";

    const actual = Number(dataFiltrada[dataFiltrada.length - 1][key] ?? 0);

    const anteriorDiferente = [...dataFiltrada]
      .reverse()
      .slice(1)
      .find((item) => Number(item[key] ?? 0) !== actual);

    if (!anteriorDiferente) return "➖ Estable";

    const anterior = Number(anteriorDiferente[key] ?? 0);

    return actual > anterior ? "📈 Subiendo" : "📉 Bajando";
  };

  const alerta =
    ultimo && (ultimo.humedad < 30 || ultimo.temperatura > 30)
      ? "⚠️ Riesgo"
      : ultimo
      ? "✅ Estable"
      : "Sin datos";

  const estadoZona = zonasEstado[zonaActual];

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <main className="flex-1 p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Analítica 📊</h1>
            <p className="text-gray-500 mt-1">
              Gráficas y tendencias por zona en tiempo real.
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
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500 mb-2">Zona actual</p>

            <select
              value={zonaActual}
              onChange={(e) => setZonaActual(e.target.value)}
              className="w-full border rounded-lg p-2 font-semibold"
            >
              {ZONAS.map((zona) => (
                <option key={zona} value={zona}>
                  {zona}
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
            <p className="text-gray-500">Bomba</p>
            <p
              className={`text-lg font-bold ${
                estadoZona?.bomba || estadoZona?.riegoActivo
                  ? "text-blue-600"
                  : "text-gray-600"
              }`}
            >
              {estadoZona?.bomba || estadoZona?.riegoActivo
                ? "Encendida"
                : "Apagada"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Estado general</p>
            <p className="text-lg font-bold">{alerta}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Humedad actual</p>
            <p className="text-3xl font-bold">
              {ultimo ? `${ultimo.humedad}%` : "--%"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">pH actual</p>
            <p className="text-3xl font-bold">{ultimo ? ultimo.ph : "--"}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Temperatura</p>
            <p className="text-3xl font-bold">
              {ultimo ? `${ultimo.temperatura}°C` : "--°C"}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-500">Índice agrícola</p>
            <p className="text-3xl font-bold">
              {ultimo ? `${ultimo.indice}%` : "--%"}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="mb-4 font-semibold">
                Humedad en tiempo real - {zonaActual}
              </h2>

              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dataFiltrada}>
                  <defs>
                    <linearGradient id="humedad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22C55E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="tiempo" />
                  <YAxis />
                  <Tooltip
                    formatter={(v) => [`${Number(v).toFixed(0)}%`, "Humedad"]}
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

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="mb-4 font-semibold">
                pH en tiempo real - {zonaActual}
              </h2>

              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dataFiltrada}>
                  <defs>
                    <linearGradient id="ph" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="tiempo" />
                  <YAxis />
                  <Tooltip
                    formatter={(v) => [`${Number(v).toFixed(2)} pH`, "pH"]}
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

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="mb-4 font-semibold">
                Temperatura en tiempo real - {zonaActual}
              </h2>

              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={dataFiltrada}>
                  <defs>
                    <linearGradient id="temp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="tiempo" />
                  <YAxis />
                  <Tooltip
                    formatter={(v) => [`${Number(v).toFixed(1)}°C`, "Temp"]}
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

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold">Última lectura</h2>
              <p>{ultimo?.tiempo ?? "Sin datos"}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold">Tendencia humedad</h2>
              <p>{tendencia("humedad")}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold">Tendencia pH</h2>
              <p>{tendencia("ph")}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold">Tendencia temperatura</h2>
              <p>{tendencia("temperatura")}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold">Tendencia índice</h2>
              <p>{tendencia("indice")}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-semibold">Modo</h2>
              <p>
                {estadoZona?.manual
                  ? "Manual"
                  : estadoZona?.automatico
                  ? "Automático"
                  : "Inactivo"}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

