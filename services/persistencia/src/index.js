import dotenv from "dotenv";

import { redisClient } from "./redis/redisClient.js";

import {
  crearTablaSensores,
  guardarSensor,
} from "./models/sensorModel.js";

dotenv.config();

// ======================================================
// MICROSERVICIO: PERSISTENCIA
// ======================================================
//
// Función:
//
// - Consumir eventos desde cola:historial.
// - Crear/verificar la tabla en PostgreSQL.
// - Guardar permanentemente los datos procesados.
//
// Este servicio recibe eventos completos con:
//
// - deviceId
// - zona
// - humedad
// - ph
// - temperatura
// - prioridad
// - sensorOrigen
// - razon
// - accion
// - bomba
// - detalle
//
// ======================================================

const COLA_HISTORIAL = "cola:historial";

// ======================================================
// UTILIDAD: ESPERAR
// ======================================================
//
// Permite pausar el servicio antes de reintentar
// conexiones a Redis o PostgreSQL.
//
// ======================================================

const esperar = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// ======================================================
// CONEXIÓN CON REINTENTOS
// ======================================================
//
// Docker puede iniciar contenedores en diferente orden.
// Por eso este microservicio intenta conectarse hasta
// que Redis y PostgreSQL estén listos.
//
// ======================================================

const conectarConReintentos = async () => {
  while (true) {
    try {
      await redisClient.connect();
      console.log("🟢 Redis conectado");

      await crearTablaSensores();
      console.log("🐘 PostgreSQL listo");

      break;
    } catch (error) {
      console.error(
        "⚠️ Servicios no listos, reintentando en 5s..."
      );
      console.error(error.message);

      try {
        if (redisClient.isOpen) {
          await redisClient.disconnect();
        }
      } catch {}

      await esperar(5000);
    }
  }
};

// ======================================================
// INICIAR SERVICIO
// ======================================================
//
// Flujo:
//
// cola:historial
//      ↓
// persistencia
//      ↓
// PostgreSQL
//
// ======================================================

const iniciarServicio = async () => {
  console.log("💾 Microservicio Persistencia iniciado");

  await conectarConReintentos();

  while (true) {
    try {
      const resultado = await redisClient.blPop(
        COLA_HISTORIAL,
        0
      );

      if (!resultado) continue;

      const sensorData = JSON.parse(resultado.element);

      console.log(
        "📥 Guardando evento en PostgreSQL:",
        sensorData
      );

      await guardarSensor(sensorData);

      console.log("✅ Evento guardado en PostgreSQL");
    } catch (error) {
      console.error("❌ Error persistencia:", error);

      await esperar(3000);
    }
  }
};

iniciarServicio().catch((error) => {
  console.error(
    "❌ Error fatal en persistencia:",
    error
  );
});

