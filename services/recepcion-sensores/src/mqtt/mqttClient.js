import mqtt from "mqtt";
import dotenv from "dotenv";

import { validarSensorData } from "../validators/sensorValidator.js";
import { encolarSensorData } from "../queue/sensorQueue.js";

dotenv.config();

// ======================================================
// MICROSERVICIO: RECEPCIÓN DE SENSORES
// CLIENTE MQTT
// ======================================================
//
// Función:
//
// - Conectarse al broker MQTT.
// - Escuchar datos publicados por el ESP32.
// - Validar la estructura del mensaje.
// - Enviar datos al backend principal.
// - Encolar datos en Redis para microservicios.
//
// Flujo:
//
// ESP32
//   ↓
// Mosquitto MQTT
//   ↓
// recepcion-sensores
//   ↓
// Backend + cola:sensores
//
// ======================================================

const BACKEND_RIEGO_URL =
  process.env.BACKEND_RIEGO_URL ||
  "http://backend:3001/api/riego/sensores";

// ======================================================
// ENVIAR DATOS AL BACKEND DE RIEGO
// ======================================================
//
// Este envío mantiene sincronizado el backend principal,
// que es el encargado de emitir datos hacia el frontend
// mediante Socket.IO.
//
// ======================================================

const enviarAlBackendRiego = async (data) => {
  try {
    const res = await fetch(BACKEND_RIEGO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();

      console.error(
        "❌ Backend riego rechazó datos:",
        text
      );

      return false;
    }

    console.log(
      "✅ Datos enviados al backend riego"
    );

    return true;
  } catch (error) {
    console.error(
      "❌ Error enviando al backend riego:",
      error.message
    );

    return false;
  }
};

// ======================================================
// INICIAR CLIENTE MQTT
// ======================================================
//
// Cada instancia de recepcion-sensores se conecta con
// un INSTANCE_ID diferente.
//
// Se utiliza un shared subscription:
//
// $share/recepcion/agrosense/sensores
//
// Esto permite que Mosquitto distribuya los mensajes
// entre varias instancias del mismo microservicio.
//
// ======================================================

export const iniciarMQTT = () => {
  const INSTANCE_ID =
    process.env.INSTANCE_ID || "recepcion-local";

  const MQTT_URL = process.env.MQTT_URL;

  const MQTT_TOPIC_REAL =
    process.env.MQTT_TOPIC || "agrosense/sensores";

  const MQTT_SHARED_TOPIC =
    process.env.MQTT_SHARED_TOPIC ||
    `$share/recepcion/${MQTT_TOPIC_REAL}`;

  const client = mqtt.connect(MQTT_URL, {
    clientId: `${INSTANCE_ID}-${Date.now()}`,
    clean: true,
  });

  // ====================================================
  // Conexión al broker MQTT
  // ====================================================

  client.on("connect", () => {
    console.log(
      `🟢 MQTT conectado en ${INSTANCE_ID}`
    );

    client.subscribe(
      MQTT_SHARED_TOPIC,
      { qos: 1 },
      (err) => {
        if (err) {
          console.error(
            `❌ ${INSTANCE_ID} error al suscribirse:`,
            err
          );
        } else {
          console.log(
            `📡 ${INSTANCE_ID} suscrito a: ${MQTT_SHARED_TOPIC}`
          );
        }
      }
    );
  });

  // ====================================================
  // Recepción de mensajes MQTT
  // ====================================================
  //
  // Cada mensaje debe contener:
  //
  // - deviceId
  // - humedad
  // - ph
  // - temperatura
  // - zona
  //
  // ====================================================

  client.on("message", async (topic, message) => {
    try {
      const data = JSON.parse(
        message.toString()
      );

      console.log(
        `📨 ${INSTANCE_ID} procesó mensaje MQTT:`,
        data
      );

      // ================================================
      // Validar estructura del sensor
      // ================================================

      if (!validarSensorData(data)) {
        console.log(
          `⚠️ ${INSTANCE_ID} datos inválidos:`,
          data
        );

        return;
      }

      // ================================================
      // Enriquecer lectura recibida
      // ================================================
      //
      // recibidoPor:
      // Permite saber qué instancia procesó el mensaje.
      //
      // recibidoEn:
      // Timestamp del momento de recepción.
      //
      // ================================================

      const sensorData = {
        ...data,
        recibidoPor: INSTANCE_ID,
        recibidoEn: new Date().toISOString(),
      };

      // ================================================
      // Enviar al backend principal
      // ================================================

      await enviarAlBackendRiego(sensorData);

      // ================================================
      // Encolar en Redis
      // ================================================
      //
      // La cola será consumida por:
      //
      // zonas-agricolas
      //
      // ================================================

      await encolarSensorData(sensorData);

    } catch (error) {
      console.error(
        `❌ ${INSTANCE_ID} error procesando MQTT:`,
        error.message
      );
    }
  });

  // ====================================================
  // Manejo de errores MQTT
  // ====================================================

  client.on("error", (error) => {
    console.error(
      `❌ Error MQTT en ${INSTANCE_ID}:`,
      error.message
    );
  });
};


