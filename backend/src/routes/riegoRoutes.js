import express from "express";
import {
  recibirSensorData,
  obtenerControl,
  cambiarModo,
  controlManual,
  obtenerSensores,
  obtenerEstado,
  obtenerHistorial,
} from "../controllers/riegoController.js";

const router = express.Router();

// 📡 ESP32 manda datos
router.post("/sensores", recibirSensorData);

// 🤖 ESP32 consulta decisión
router.get("/control", obtenerControl);

// 📊 estado del sistema
router.get("/estado", obtenerEstado);

// 📊 último dato sensores
router.get("/sensores", obtenerSensores);

// 🧾 historial
router.get("/historial", obtenerHistorial);

// 🔁 cambiar modo
router.post("/modo", cambiarModo);

// 🕹️ control manual
router.post("/manual", controlManual);

export default router;
