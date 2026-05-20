import express from "express";
import cors from "cors";
//import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import riegoRoutes from "./routes/riegoRoutes.js";
import { setIO } from "./socket.js";

import {
  getEstado,
  getUltimoDato,
  getDecision,
} from "./services/estadoService.js";

// 🔥 FIX ES MODULES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 CARGA DEL .ENV
dotenv.config({
  path: path.join(__dirname, "../.env"),
});

const app = express();
const server = http.createServer(app);

const PORT = 3001;

// 🔥 SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

setIO(io);

// 🔥 CONEXIÓN MONGO
//mongoose
//  .connect(process.env.MONGO_URI)
//  .then(() => console.log("✅ MongoDB conectado"))
//  .catch((err) => console.log("❌ Error Mongo:", err));

// 🔥 MIDDLEWARES
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

// 🔥 ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/riego", riegoRoutes);

// 🔌 SOCKETS
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

// 🚀 START SERVER
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🔥 Backend corriendo en ${PORT}`);
});

