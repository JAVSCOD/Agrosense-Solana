import dotenv from "dotenv";

import { redisClient } from "./redis/redisClient.js";

import {
  iniciarSocketServer,
  emitirNotificacion,
} from "./socket/socketServer.js";

dotenv.config();

// ======================================================
// MICROSERVICIO: NOTIFICACIONES
// ======================================================
//
// Función:
//
// - Consumir eventos desde Redis.
// - Recuperar notificaciones pendientes.
// - Emitir alertas al frontend en tiempo real.
// - Confirmar la entrega eliminando el evento procesado.
//
// Cola principal:
//
// cola:notificaciones
//
// Cola de respaldo:
//
// cola:notificaciones:procesando
//
// ======================================================

const COLA_NOTIFICACIONES = "cola:notificaciones";
const COLA_PROCESANDO = "cola:notificaciones:procesando";

// ======================================================
// NORMALIZAR NOTIFICACIÓN
// ======================================================
//
// Convierte el evento interno del sistema en una alerta
// clara para el operador.
//
// ======================================================

const normalizarNotificacion = (evento) => {
  const detalle =
    typeof evento.detalle === "string"
      ? JSON.parse(evento.detalle || "{}")
      : evento.detalle || {};

  const sensorOrigen =
    evento.sensorOrigen || "desconocido";

  const valorSensor =
    detalle?.[sensorOrigen]?.valor ??
    evento[sensorOrigen] ??
    null;

  const nivelSensor =
    detalle?.[sensorOrigen]?.nivel ??
    evento.prioridad ??
    "estable";

  const mensajeSensor =
    detalle?.[sensorOrigen]?.mensaje ??
    evento.razon ??
    "Sin observaciones";

  return {
    ...evento,

    tipo: "alerta-agricola",

    titulo: `🚨 Alerta ${String(
      evento.prioridad || "estable"
    ).toUpperCase()}`,

    zona: evento.zona || "Zona no definida",

    deviceId:
      evento.deviceId || "Dispositivo no identificado",

    prioridad:
      evento.prioridad || "estable",

    sensorOrigen,

    valorSensor,

    nivelSensor,

    mensajeSensor,

    razon:
      evento.razon || mensajeSensor,

    accion:
      evento.accion || "Sin acción definida",

    bomba:
      !!evento.bomba,

    detalle,

    emitidoEn: new Date().toISOString(),
  };
};

// ======================================================
// PROCESAR EVENTO
// ======================================================
//
// 1. Lee el evento desde Redis.
// 2. Normaliza la información.
// 3. Lo emite al frontend.
// 4. Confirma la entrega removiéndolo de la cola
//    de procesamiento.
//
// ======================================================

const procesarEvento = async (eventoRaw) => {
  const evento = JSON.parse(eventoRaw);

  console.log(
    "📥 Notificación recibida:",
    evento
  );

  const notificacion = normalizarNotificacion(evento);

  console.log(
    "🔔 Notificación normalizada:",
    notificacion
  );

  emitirNotificacion(notificacion);

  await redisClient.lRem(
    COLA_PROCESANDO,
    1,
    eventoRaw
  );

  console.log(
    "✅ Notificación entregada y confirmada"
  );
};

// ======================================================
// RECUPERAR PENDIENTES
// ======================================================
//
// Si el microservicio se cae mientras procesa eventos,
// estos quedan en cola:notificaciones:procesando.
//
// Al reiniciar, se recuperan para evitar pérdida.
//
// ======================================================

const recuperarPendientes = async () => {
  const pendientes = await redisClient.lRange(
    COLA_PROCESANDO,
    0,
    -1
  );

  if (pendientes.length > 0) {
    console.log(
      `♻️ Recuperando ${pendientes.length} notificaciones pendientes`
    );

    for (const eventoRaw of pendientes) {
      try {
        await procesarEvento(eventoRaw);
      } catch (error) {
        console.error(
          "❌ Error recuperando pendiente:",
          error
        );
      }
    }
  }
};

// ======================================================
// INICIAR SERVICIO
// ======================================================

const iniciarServicio = async () => {
  console.log(
    "🔔 Microservicio Notificaciones iniciado"
  );

  await redisClient.connect();

  iniciarSocketServer();

  await recuperarPendientes();

  while (true) {
    try {
      const eventoRaw = await redisClient.sendCommand([
        "BRPOPLPUSH",
        COLA_NOTIFICACIONES,
        COLA_PROCESANDO,
        "0",
      ]);

      if (!eventoRaw) continue;

      await procesarEvento(eventoRaw);
    } catch (error) {
      console.error(
        "❌ Error en notificaciones:",
        error
      );
    }
  }
};

iniciarServicio().catch((error) => {
  console.error(
    "❌ Error iniciando notificaciones:",
    error
  );
});

