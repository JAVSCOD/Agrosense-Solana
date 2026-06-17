import dotenv from "dotenv";

import { redisClient } from "./redis/redisClient.js";
import { procesarZona } from "./rules/zoneRules.js";
import { evaluarPrioridadGrpc } from "./grpc/grpcClient.js";

dotenv.config();

// ======================================================
// MICROSERVICIO: ZONAS-AGRICOLAS
// ======================================================
//
// Función:
//
// - Recibir lecturas desde cola:sensores
// - Procesar la zona agrícola
// - Consultar prioridad-riego mediante gRPC
// - Unificar datos del sensor, zona y prioridad
// - Enviar el evento enriquecido a Redis
//
// Flujo:
//
// cola:sensores
//      ↓
// zonas-agricolas
//      ↓
// prioridad-riego vía gRPC
//      ↓
// cola:zonas
//
// ======================================================

const COLA_SENSORES = "cola:sensores";
const COLA_ZONAS = "cola:zonas";

const iniciarServicio = async () => {
  console.log("📍 Microservicio Zonas Agrícolas iniciado");

  await redisClient.connect();

  while (true) {
    try {
      // ======================================
      // Leer sensor desde Redis
      // ======================================

      const resultado = await redisClient.blPop(
        COLA_SENSORES,
        0
      );

      if (!resultado) continue;

      const sensorData = JSON.parse(
        resultado.element
      );

      console.log(
        "📥 Sensor recibido:",
        sensorData
      );

      // ======================================
      // Procesar zona agrícola
      // ======================================

      const zonaData = procesarZona(sensorData);

      console.log(
        "📍 Zona procesada:",
        zonaData
      );

      // ======================================
      // Consultar prioridad por gRPC
      // ======================================

      let decisionPrioridad = {
        prioridad: "estable",
        bomba: false,
        razon: "Sin evaluación de prioridad",
        accion: "Bomba apagada",
        sensorOrigen: "desconocido",
        detalle: {},
      };

      try {
        decisionPrioridad = await evaluarPrioridadGrpc(
          zonaData
        );

        console.log(
          "📡 Prioridad recibida por gRPC:",
          decisionPrioridad
        );
      } catch (grpcError) {
        console.error(
          "⚠️ Error consultando gRPC:",
          grpcError.message
        );
      }

      // ======================================
      // Evento enriquecido
      // ======================================
      //
      // Se combinan:
      //
      // - Datos del sensor
      // - Datos de zona
      // - Resultado de prioridad-riego
      //
      // Este evento ya puede ser usado por:
      //
      // - notificaciones
      // - historial-eventos
      // - persistencia
      //
      // ======================================

      const eventoEnriquecido = {
        ...zonaData,

        prioridad: decisionPrioridad.prioridad,
        bomba: decisionPrioridad.bomba,
        razon: decisionPrioridad.razon,
        accion: decisionPrioridad.accion,
        sensorOrigen: decisionPrioridad.sensorOrigen,
        detalle: decisionPrioridad.detalle,

        procesadoZonasEn: new Date().toISOString(),
      };

      console.log(
        "✅ Evento enriquecido:",
        eventoEnriquecido
      );

      // ======================================
      // Enviar a la siguiente cola
      // ======================================

      await redisClient.rPush(
        COLA_ZONAS,
        JSON.stringify(eventoEnriquecido)
      );

    } catch (error) {
      console.error("❌ Error zonas:", error);
    }
  }
};

iniciarServicio().catch((error) => {
  console.error("❌ Error iniciando zonas:", error);
});

