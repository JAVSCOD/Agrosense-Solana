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

// ==========================================
// RECEPCIÓN DE DATOS DESDE ESP32
// ==========================================
router.post("/sensores", recibirSensorData);

// ==========================================
// CONSULTA DE DECISIÓN DE RIEGO
// ==========================================
router.get("/control", obtenerControl);

// ==========================================
// ESTADO GLOBAL DE TODAS LAS ZONAS
// ==========================================
router.get("/estado", obtenerEstado);

// ==========================================
// ÚLTIMA LECTURA DE SENSORES
// ==========================================
router.get("/sensores", obtenerSensores);

// ==========================================
// HISTORIAL DE EVENTOS DE RIEGO
// ==========================================
router.get("/historial", obtenerHistorial);

// ==========================================
// CAMBIO DE MODO AUTOMÁTICO
// ==========================================
router.post("/modo", cambiarModo);

// ==========================================
// ACTIVACIÓN MANUAL DE BOMBA
// ==========================================
router.post("/manual", controlManual);

export default router;

