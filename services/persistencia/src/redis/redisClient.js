import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// ======================================================
// CLIENTE REDIS
// ======================================================
//
// Función:
//
// Proporcionar acceso al servidor Redis utilizado
// como sistema de colas entre microservicios.
//
// Este microservicio utiliza Redis para:
//
// cola:historial
//
// Flujo:
//
// historial-eventos
//        ↓
//   cola:historial
//        ↓
//   persistencia
//        ↓
//   PostgreSQL
//
// ======================================================

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

// ======================================================
// MANEJO DE ERRORES
// ======================================================
//
// Permite detectar problemas de conexión
// con Redis.
//
// ======================================================

redisClient.on("error", (err) => {
  console.error("❌ Redis Error:", err);
});

