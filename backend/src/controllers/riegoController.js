import {
  setSensorData,
  getDecision,
  actualizarEstado,
  getUltimoDato,
  getEstado,
  getHistorial,
} from "../services/estadoService.js";

import { getIO } from "../socket.js";

// ==========================================
// ESP32 ENVÍA DATOS
// ==========================================

export const recibirSensorData = (req, res) => {

  const data = req.body;

  if (
    !data ||
    typeof data.humedad !== "number" ||
    typeof data.ph !== "number" ||
    typeof data.temperatura !== "number"
  ) {
    return res.status(400).json({
      ok: false,
      error: "Datos inválidos",
    });
  }

  const zona = data.zona || "Zona 1";

  setSensorData(data);

  global.ultimaConexion = Date.now();

  console.log(`📡 Sensor ${zona}:`, data);

  let io;

  try {
    io = getIO();
  } catch (e) {
    console.log("⚠️ Socket no listo aún");
  }

  if (io) {

    io.emit("sensor", {
      zona,
      data,
    });

    const decision = getDecision(zona);

    io.emit("bomba", decision);

    io.emit("estado", getEstado());
  }

  res.json({
    ok: true,
    zona,
  });

};

// ==========================================
// ESP32 CONSULTA DECISIÓN
// ==========================================

export const obtenerControl = (req, res) => {

  const zona = req.query.zona || "Zona 1";

  const decision = getDecision(zona);

  console.log(`🤖 Decision ${zona}:`, decision);

  let io;

  try {
    io = getIO();
  } catch (e) {}

  if (io) {
    io.emit("bomba", decision);
  }

  res.json(decision);

};

// ==========================================
// ESTADO GENERAL
// ==========================================

export const obtenerEstado = (req, res) => {

  res.json({
    ok: true,
    data: getEstado(),
  });

};

// ==========================================
// CAMBIAR AUTOMÁTICO
// ==========================================

export const cambiarModo = (req, res) => {

  const {
    zona,
    automatico,
  } = req.body;

  if (!zona) {
    return res.status(400).json({
      ok: false,
      error: "Zona requerida",
    });
  }

  const estado = actualizarEstado({
    zona,
    automatico,
  });

  console.log(`🤖 Automático ${zona}:`, estado);

  let io;

  try {
    io = getIO();
  } catch (e) {}

  if (io) {

    io.emit("estado", getEstado());

    const decision = getDecision(zona);

    io.emit("bomba", decision);

  }

  res.json({
    ok: true,
    estado,
  });

};

// ==========================================
// CONTROL MANUAL
// ==========================================

export const controlManual = (req, res) => {

  const {
    zona,
    encender,
  } = req.body;

  if (!zona) {
    return res.status(400).json({
      ok: false,
      error: "Zona requerida",
    });
  }

  if (typeof encender !== "boolean") {
    return res.status(400).json({
      ok: false,
      error: "Valor inválido",
    });
  }

  const estado = actualizarEstado({
    zona,
    manual: encender,
    automatico: false,
  });

  console.log(`🕹️ Manual ${zona}:`, estado);

  let io;

  try {
    io = getIO();
  } catch (e) {}

  if (io) {

    io.emit("estado", getEstado());

    const decision = getDecision(zona);

    io.emit("bomba", decision);

  }

  res.json({
    ok: true,
    estado,
  });

};

// ==========================================
// ÚLTIMO SENSOR POR ZONA
// ==========================================

export const obtenerSensores = (req, res) => {

  const zona = req.query.zona || "Zona 1";

  res.json({
    ok: true,
    zona,
    data: getUltimoDato(zona),
  });

};

// ==========================================
// HISTORIAL
// ==========================================

export const obtenerHistorial = (req, res) => {

  res.json({
    ok: true,
    data: getHistorial(),
  });

};

