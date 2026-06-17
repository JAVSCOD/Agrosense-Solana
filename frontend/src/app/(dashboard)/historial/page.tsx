"use client";

import { useEffect, useMemo, useState } from "react";
import { socket } from "@/lib/socket";

type HistorialItem = {
  id: number;
  humedad: number;
  ph: number;
  temperatura: number;
  zona: string;
  fecha: string;
  sector: string | null;
  cultivo: string | null;
  prioridad: string | null;
  razon: string | null;
  accion: string | null;
  recibido_por: string | null;
};

export default function HistorialPage() {
  const [historial, setHistorial] = useState<HistorialItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [filtroZona, setFiltroZona] = useState("todas");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todas");
  const [filtroCultivo, setFiltroCultivo] = useState("todos");

  const obtenerHistorial = async (mostrarCarga = true) => {
    try {
      if (mostrarCarga) setCargando(true);

      const res = await fetch("/api/historial");
      const data = await res.json();

      if (!data.ok) {
        setError("No se pudo cargar el historial");
        return;
      }

      setHistorial(data.data || []);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Error de conexión con el backend");
    } finally {
      if (mostrarCarga) setCargando(false);
    }
  };

  useEffect(() => {
    obtenerHistorial();
  }, []);

  useEffect(() => {
    if (!socket.connected) socket.connect();

    const actualizarHistorial = (evento: any) => {
      console.log("📋 Nuevo evento recibido en Historial:", evento);

      setTimeout(() => {
        obtenerHistorial(false);
      }, 700);
    };

    socket.on("alerta-agricola", actualizarHistorial);
    socket.on("dashboard", actualizarHistorial);
    socket.on("notificacion", actualizarHistorial);
    socket.on("bomba", actualizarHistorial);

    return () => {
      socket.off("alerta-agricola", actualizarHistorial);
      socket.off("dashboard", actualizarHistorial);
      socket.off("notificacion", actualizarHistorial);
      socket.off("bomba", actualizarHistorial);
    };
  }, []);

  const historialFiltrado = useMemo(() => {
    return historial.filter((item) => {
      const textoBusqueda = busqueda.toLowerCase().trim();

      const coincideBusqueda =
        !textoBusqueda ||
        item.zona?.toLowerCase().includes(textoBusqueda) ||
        item.sector?.toLowerCase().includes(textoBusqueda) ||
        item.cultivo?.toLowerCase().includes(textoBusqueda) ||
        item.prioridad?.toLowerCase().includes(textoBusqueda) ||
        item.accion?.toLowerCase().includes(textoBusqueda) ||
        item.razon?.toLowerCase().includes(textoBusqueda) ||
        item.recibido_por?.toLowerCase().includes(textoBusqueda);

      const coincideZona =
        filtroZona === "todas" || item.zona === filtroZona;

      const coincidePrioridad =
        filtroPrioridad === "todas" ||
        (filtroPrioridad === "sin prioridad" && !item.prioridad) ||
        item.prioridad === filtroPrioridad;

      const coincideCultivo =
        filtroCultivo === "todos" ||
        (filtroCultivo === "sin cultivo" && !item.cultivo) ||
        item.cultivo === filtroCultivo;

      return (
        coincideBusqueda &&
        coincideZona &&
        coincidePrioridad &&
        coincideCultivo
      );
    });
  }, [historial, busqueda, filtroZona, filtroPrioridad, filtroCultivo]);

  const zonas = Array.from(
    new Set(historial.map((item) => item.zona).filter(Boolean))
  );

  const cultivos = Array.from(
    new Set(historial.map((item) => item.cultivo).filter(Boolean))
  );

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroZona("todas");
    setFiltroPrioridad("todas");
    setFiltroCultivo("todos");
  };

  const formatoFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString("es-MX");
  };

  const colorPrioridad = (prioridad: string | null) => {
    if (prioridad === "critica") return "bg-red-100 text-red-700";
    if (prioridad === "media") return "bg-yellow-100 text-yellow-700";
    if (prioridad === "baja") return "bg-green-100 text-green-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F172A]">
          Historial de eventos 📋
        </h1>
        <p className="text-gray-500 mt-2">
          Registro de lecturas, prioridades y acciones tomadas por el sistema.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-gray-500">Total registros</p>
          <p className="text-3xl font-bold">{historial.length}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-gray-500">Alertas críticas</p>
          <p className="text-3xl font-bold text-red-600">
            {historial.filter((item) => item.prioridad === "critica").length}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-gray-500">Riegos activados</p>
          <p className="text-3xl font-bold text-green-600">
            {
              historial.filter((item) =>
                item.accion?.toLowerCase().includes("encendida")
              ).length
            }
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow">
          <p className="text-gray-500">Última humedad</p>
          <p className="text-3xl font-bold">
            {historial[0]?.humedad ?? "--"}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow overflow-hidden">
        <div className="px-6 py-5 border-b">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-[#0F172A]">
                Eventos registrados
              </h2>
              <p className="text-sm text-gray-500">
                Mostrando {historialFiltrado.length} de {historial.length} registros.
              </p>
            </div>

            <button
              onClick={() => obtenerHistorial()}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-4 py-2 rounded-xl font-semibold transition"
            >
              Actualizar
            </button>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Buscar..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-[#22C55E]"
            />

            <select
              value={filtroZona}
              onChange={(e) => setFiltroZona(e.target.value)}
              className="border rounded-xl px-4 py-2 outline-none"
            >
              <option value="todas">Todas las zonas</option>
              {zonas.map((zona) => (
                <option key={zona} value={zona}>
                  {zona}
                </option>
              ))}
            </select>

            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              className="border rounded-xl px-4 py-2 outline-none"
            >
              <option value="todas">Todas las prioridades</option>
              <option value="critica">Crítica</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
              <option value="sin prioridad">Sin prioridad</option>
            </select>

            <select
              value={filtroCultivo}
              onChange={(e) => setFiltroCultivo(e.target.value)}
              className="border rounded-xl px-4 py-2 outline-none"
            >
              <option value="todos">Todos los cultivos</option>
              <option value="sin cultivo">Sin cultivo</option>
              {cultivos.map((cultivo) => (
                <option key={cultivo ?? "sin-cultivo"} value={cultivo ?? ""}>
                  {cultivo}
                </option>
              ))}
            </select>

            <button
              onClick={limpiarFiltros}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-xl font-semibold transition"
            >
              Limpiar filtros
            </button>
          </div>
        </div>

        {cargando ? (
          <p className="p-6 text-gray-500">Cargando historial...</p>
        ) : error ? (
          <p className="p-6 text-red-600 font-semibold">{error}</p>
        ) : historialFiltrado.length === 0 ? (
          <p className="p-6 text-gray-500">
            No hay eventos que coincidan con los filtros.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0F172A] text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Fecha</th>
                  <th className="px-4 py-3 text-left">Zona</th>
                  <th className="px-4 py-3 text-left">Sector</th>
                  <th className="px-4 py-3 text-left">Cultivo</th>
                  <th className="px-4 py-3 text-left">Humedad</th>
                  <th className="px-4 py-3 text-left">pH</th>
                  <th className="px-4 py-3 text-left">Temp.</th>
                  <th className="px-4 py-3 text-left">Prioridad</th>
                  <th className="px-4 py-3 text-left">Acción</th>
                  <th className="px-4 py-3 text-left">Procesado por</th>
                </tr>
              </thead>

              <tbody>
                {historialFiltrado.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatoFecha(item.fecha)}
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      {item.zona || "Sin zona"}
                    </td>

                    <td className="px-4 py-3">
                      {item.sector || "Sin sector"}
                    </td>

                    <td className="px-4 py-3">
                      {item.cultivo || "Sin cultivo"}
                    </td>

                    <td className="px-4 py-3 font-bold">
                      {item.humedad ?? "--"}%
                    </td>

                    <td className="px-4 py-3">{item.ph ?? "--"}</td>

                    <td className="px-4 py-3">
                      {item.temperatura ?? "--"}°C
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${colorPrioridad(
                          item.prioridad
                        )}`}
                      >
                        {item.prioridad || "sin prioridad"}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {item.accion || item.razon || "Sin acción"}
                    </td>

                    <td className="px-4 py-3">
                      {item.recibido_por || "Sin instancia"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

