import express from "express";
import cors from "cors";
// import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import riegoRoutes from "./routes/riegoRoutes.js";
import historialRoutes from "./routes/historialRoutes.js";

import { setIO } from "./socket.js";
import { pool } from "./db/postgresClient.js";

import {
  getEstado,
  getUltimoDato,
  getDecision,
} from "./services/estadoService.js";

// ======================================================
// BACKEND PRINCIPAL - AGROSENSE
// ======================================================
//
// Función:
//
// - Levantar servidor Express.
// - Configurar rutas REST.
// - Inicializar Socket.IO.
// - Enviar datos en tiempo real al frontend.
// - Conectarse a PostgreSQL.
// - Coordinar Dashboard, Gestión, Sistema y Analítica.
//
// ======================================================

// ======================================================
// CONFIGURACIÓN DE ES MODULES
// ======================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ======================================================
// CARGA DE VARIABLES DE ENTORNO
// ======================================================

dotenv.config({
  path: path.join(__dirname, "../.env"),
});

const app = express();
const server = http.createServer(app);

const PORT = 3001;

// ======================================================
// CONFIGURACIÓN SOCKET.IO
// ======================================================
//
// Socket.IO permite actualizar el frontend en tiempo real
// sin necesidad de recargar la página.
//
// ======================================================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

setIO(io);

// ======================================================
// MIDDLEWARES
// ======================================================

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ======================================================
// RUTAS REST
// ======================================================
//
// /api/auth      → autenticación
// /api/riego     → sensores, control manual y automático
// /api/historial → historial de eventos
//
// ======================================================

app.use("/api/auth", authRoutes);
app.use("/api/riego", riegoRoutes);
app.use("/api/historial", historialRoutes);

// ======================================================
// EVENTOS SOCKET.IO
// ======================================================
//
// Al conectarse un cliente, se envía:
//
// - Estado general
// - Último dato del sensor
// - Estado actual de bomba/riego
//
// ======================================================

io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado");

  try {
    socket.emit("estado", getEstado());
    socket.emit("sensor", getUltimoDato() || {});
    socket.emit("bomba", getDecision());
  } catch (error) {
    console.error("❌ Error enviando estado:", error);
  }

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado");
  });
});

// ======================================================
// INICIO DEL SERVIDOR
// ======================================================
//
// Antes de levantar Express, se verifica conexión
// con PostgreSQL.
//
// ======================================================

const iniciarServidor = async () => {
  try {
    await pool.query("SELECT NOW()");

    console.log("🐘 PostgreSQL conectado desde Backend");

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🔥 Backend corriendo en ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error PostgreSQL:", error);
    process.exit(1);
  }
};

iniciarServidor();

