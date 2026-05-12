import {
  setSensorData,
  getDecision,
  actualizarEstado,
  getUltimoDato,
  getEstado,
  getHistorial,
} from "../services/estadoService.js";

import { getIO } from "../socket.js";

// 📡 ESP32 manda datos
export const recibirSensorData = (req, res) => {
  const data = req.body;

  if (
    !data ||
    typeof data.humedad !== "number" ||
    typeof data.ph !== "number"
  ) {
    return res.status(400).json({
      ok: false,
      error: "Datos inválidos",
    });
  }

  setSensorData(data);
  global.ultimaConexion = Date.now();

  console.log("📡 Sensor:", data);

  let io;
  try {
    io = getIO();
  } catch (e) {
    console.log("⚠️ Socket no listo aún");
  }

  if (io) {
    io.emit("sensor", data);

    // 🔥 recalcular SIEMPRE después de sensor
    const decision = getDecision();
    io.emit("bomba", decision);

    // 🔥 mantener frontend sincronizado
    io.emit("estado", getEstado());
  }

  res.json({ ok: true });
};

// 🤖 ESP32 consulta decisión
export const obtenerControl = (req, res) => {
  const decision = getDecision();

  console.log("🤖 Decision:", decision);

  let io;
  try {
    io = getIO();
  } catch (e) {}

  if (io) {
    io.emit("bomba", decision);
  }

  res.json(decision);
};

// 📊 FRONTEND obtiene estado
export const obtenerEstado = (req, res) => {
  res.json(getEstado());
};

// 🔁 FRONTEND cambia modo (AUTO / ZONA)
export const cambiarModo = (req, res) => {
  const { riego, automatico, zona } = req.body;

  // 🔥 UNA SOLA ACTUALIZACIÓN (CLAVE)
  const estado = actualizarEstado({
    riego,
    automatico: riego === true ? false : automatico,
    zona,
  });

  console.log("🔁 Estado:", estado);

  let io;
  try {
    io = getIO();
  } catch (e) {}

  if (io) {
    io.emit("estado", estado);

    // 🔥 recalcular bomba
    const decision = getDecision();
    io.emit("bomba", decision);
  }

  res.json({
    ok: true,
    estado,
  });
};

// 🕹️ CONTROL MANUAL
export const controlManual = (req, res) => {
  const { encender } = req.body;

  if (typeof encender !== "boolean") {
    return res.status(400).json({
      ok: false,
      error: "Valor inválido",
    });
  }

  // 🔥 MANUAL DESACTIVA AUTOMÁTICO
  const estado = actualizarEstado({
    riego: encender,
    automatico: false,
  });

  console.log("🕹️ Manual:", estado);

  let io;
  try {
    io = getIO();
  } catch (e) {}

  if (io) {
    io.emit("estado", estado);

    // 🔥 recalcular bomba
    const decision = getDecision();
    io.emit("bomba", decision);
  }

  res.json({
    ok: true,
    estado,
  });
};

// 📊 ÚLTIMO SENSOR
export const obtenerSensores = (req, res) => {
  res.json({
    ok: true,
    data: getUltimoDato(),
  });
};

// 🧾 HISTORIAL
export const obtenerHistorial = (req, res) => {
  res.json({
    ok: true,
    data: getHistorial(),
  });
};

