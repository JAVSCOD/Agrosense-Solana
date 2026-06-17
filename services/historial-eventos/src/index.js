import dotenv from "dotenv";

import { redisClient } from "./redis/redisClient.js";
import { guardarEvento } from "./storage/historialStore.js";

dotenv.config();

// ======================================================
// MICROSERVICIO: HISTORIAL-EVENTOS
// ======================================================
//
// Función:
//
// - Consumir eventos desde cola:prioridad.
// - Guardar el evento en memoria/local store.
// - Enviar evento a notificaciones.
// - Enviar evento a persistencia.
// - Conservar prioridad, sensorOrigen, detalle y acción.
//
// ======================================================

const COLA_PRIORIDAD = "cola:prioridad";
const COLA_NOTIFICACIONES = "cola:notificaciones";
const COLA_HISTORIAL = "cola:historial";

// ======================================================
// NORMALIZAR EVENTO HISTÓRICO
// ======================================================

const normalizarEvento = (evento) => {
  const detalle =
    typeof evento.detalle === "string"
      ? JSON.parse(evento.detalle || "{}")
      : evento.detalle || {};

  return {
    ...evento,

    tipo: "evento-agricola",

    prioridad: evento.prioridad || "estable",
    sensorOrigen: evento.sensorOrigen || "desconocido",
    razon: evento.razon || "Sin observaciones",
    accion: evento.accion || "Sin acción definida",
    bomba: !!evento.bomba,
    detalle,

    registradoEn: new Date().toISOString(),
  };
};

// ======================================================
// INICIAR SERVICIO
// ======================================================

const iniciarServicio = async () => {
  console.log("🧾 Microservicio Historial iniciado");

  await redisClient.connect();

  while (true) {
    try {
      const resultado = await redisClient.blPop(
        COLA_PRIORIDAD,
        0
      );

      if (!resultado) continue;

      const eventoRaw = JSON.parse(resultado.element);

      const evento = normalizarEvento(eventoRaw);

      console.log(
        "📥 Evento recibido en historial:",
        evento
      );

      guardarEvento(evento);

      await redisClient.rPush(
        COLA_NOTIFICACIONES,
        JSON.stringify(evento)
      );

      await redisClient.rPush(
        COLA_HISTORIAL,
        JSON.stringify(evento)
      );

      console.log(
        "📦 Evento enviado a notificaciones y persistencia"
      );
    } catch (error) {
      console.error("❌ Error historial:", error);
    }
  }
};

iniciarServicio().catch((error) => {
  console.error(
    "❌ Error iniciando historial:",
    error
  );
});

