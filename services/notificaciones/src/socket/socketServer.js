import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

let io;

// ======================================================
// SERVIDOR SOCKET.IO - NOTIFICACIONES
// ======================================================
//
// Función:
//
// - Abrir un servidor WebSocket.
// - Permitir conexión del frontend.
// - Emitir alertas agrícolas en tiempo real.
// - Enviar cambios de bomba al operador.
//
// ======================================================

export const iniciarSocketServer = () => {
  const app = express();
  const server = http.createServer(app);

  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
  );

  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Operador conectado a notificaciones");

    socket.emit("notificaciones:status", {
      ok: true,
      servicio: "notificaciones",
    });

    socket.on("disconnect", () => {
      console.log("🔴 Operador desconectado");
    });
  });

  server.listen(process.env.PORT, "0.0.0.0", () => {
    console.log(
      `🔔 Notificaciones corriendo en puerto ${process.env.PORT}`
    );
  });

  return io;
};

// ======================================================
// EMITIR NOTIFICACIÓN
// ======================================================
//
// Recibe una alerta ya normalizada desde index.js y la
// envía al frontend.
//
// Eventos emitidos:
//
// alerta-agricola:
// - Notificación completa para el operador.
//
// bomba:
// - Estado resumido para actualizar UI.
//
// ======================================================

export const emitirNotificacion = (evento) => {
  if (!io) return;

  io.emit("alerta-agricola", evento);

  io.emit("bomba", {
    zona: evento.zona,
    deviceId: evento.deviceId,
    bomba: evento.bomba,
    razon: evento.razon,
    prioridad: evento.prioridad,
    accion: evento.accion,
    sensorOrigen: evento.sensorOrigen,
    detalle: evento.detalle,
  });

  console.log("📢 Notificación emitida:", evento);
};

