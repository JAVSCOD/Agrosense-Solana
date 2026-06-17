import dotenv from "dotenv";
import { redisClient } from "./redis/redisClient.js";
import { iniciarMQTT } from "./mqtt/mqttClient.js";

dotenv.config();

// ======================================================
// MICROSERVICIO: RECEPCIÓN DE SENSORES
// ======================================================
//
// Función:
//
// Punto de entrada del sistema.
//
// Este microservicio:
//
// • Escucha datos enviados por ESP32
// • Recibe información mediante MQTT
// • Publica lecturas en Redis
//
// Flujo:
//
// ESP32
//   ↓
// MQTT (Mosquitto)
//   ↓
// Recepción Sensores
//   ↓
// cola:sensores
//
// ======================================================

const iniciarServicio = async () => {

  console.log(
    "🚀 Microservicio Recepción de Sensores iniciado"
  );

  // ======================================
  // Conexión a Redis
  // ======================================
  //
  // Permite publicar datos en cola:sensores
  //
  // ======================================

  await redisClient.connect();

  // ======================================
  // Inicializar MQTT
  // ======================================
  //
  // Escucha datos provenientes del ESP32
  //
  // ======================================

  iniciarMQTT();

};

iniciarServicio().catch((error) => {

  console.error(
    "❌ Error iniciando servicio:",
    error
  );

  process.exit(1);

});


