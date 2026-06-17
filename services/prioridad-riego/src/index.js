import dotenv from "dotenv";

import { redisClient } from "./redis/redisClient.js";
import { evaluarPrioridad } from "./rules/decisionRules.js";
import { publicarControlRiego } from "./mqtt/mqttClient.js";
import { iniciarGrpcServer } from "./grpc/grpcServer.js";

dotenv.config();

// ======================================================
// MICROSERVICIO: PRIORIDAD-RIEGO
// ======================================================
//
// Funciones principales:
//
// 1. Levantar el servidor gRPC para que otros
//    microservicios puedan consultar prioridad.
//
// 2. Consumir eventos desde cola:zonas.
//
// 3. Evaluar la prioridad agrícola con base en:
//    - Humedad
//    - pH
//    - Temperatura
//
// 4. Publicar control de riego por MQTT hacia ESP32.
//
// 5. Enviar la decisión final a cola:prioridad
//    para historial, persistencia y notificaciones.
//
// ======================================================

const COLA_ZONAS = "cola:zonas";
const COLA_PRIORIDAD = "cola:prioridad";

const iniciarServicio = async () => {
  console.log("🧠 Microservicio Prioridad-Riego iniciado");

  // ======================================
  // Iniciar servidor gRPC
  // ======================================
  //
  // Este servidor permite que zonas-agricolas
  // consulte prioridad-riego mediante gRPC.
  //
  // Puerto usado:
  // 50051
  //
  // ======================================

  iniciarGrpcServer();

  // ======================================
  // Conectar Redis
  // ======================================

  await redisClient.connect();

  // ======================================
  // Bucle principal del microservicio
  // ======================================

  while (true) {
    try {
      // ==================================
      // Leer evento desde cola:zonas
      // ==================================

      const resultado = await redisClient.blPop(
        COLA_ZONAS,
        0
      );

      if (!resultado) continue;

      const sensorData = JSON.parse(
        resultado.element
      );

      console.log(
        "📥 Evento recibido desde zonas:",
        sensorData
      );

      // ==================================
      // Evaluar prioridad
      // ==================================
      //
      // Aunque zonas-agricolas ya puede
      // consultar este servicio por gRPC,
      // aquí se recalcula para asegurar que
      // la decisión final de riego sea tomada
      // dentro de prioridad-riego.
      //
      // ==================================

      const decision = evaluarPrioridad(sensorData);

      console.log(
        "🚨 Decisión final de prioridad:",
        decision
      );

      // ==================================
      // Publicar orden MQTT hacia ESP32
      // ==================================
      //
      // El ESP32 recibe el estado final
      // de la bomba para la zona evaluada.
      //
      // ==================================

      publicarControlRiego(
        sensorData.zona,
        decision.bomba
      );

      // ==================================
      // Evento final enriquecido
      // ==================================
      //
      // Se conserva:
      //
      // - Información original del sensor
      // - Datos de zona
      // - Prioridad calculada
      // - Acción tomada
      // - Sensor origen
      // - Detalle por sensor
      //
      // ==================================

      const eventoPrioridad = {
        ...sensorData,
        ...decision,
        procesadoPrioridadEn: new Date().toISOString(),
      };

      // ==================================
      // Enviar a siguiente cola
      // ==================================
      //
      // cola:prioridad será consumida por:
      //
      // - historial-eventos
      // - persistencia
      // - notificaciones
      //
      // ==================================

      await redisClient.rPush(
        COLA_PRIORIDAD,
        JSON.stringify(eventoPrioridad)
      );

      console.log(
        "✅ Evento enviado a cola:prioridad:",
        eventoPrioridad
      );

    } catch (error) {
      console.error(
        "❌ Error procesando prioridad:",
        error
      );
    }
  }
};

iniciarServicio().catch((error) => {
  console.error(
    "❌ Error iniciando servicio:",
    error
  );
});

