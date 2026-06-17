import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

// ======================================================
// CLIENTE POSTGRESQL
// ======================================================
//
// Este archivo crea la conexión hacia PostgreSQL
// usando las variables definidas en docker-compose:
//
// POSTGRES_HOST
// POSTGRES_PORT
// POSTGRES_USER
// POSTGRES_PASSWORD
// POSTGRES_DB
//
// En este microservicio se usa para guardar
// permanentemente los eventos agrícolas procesados.
//
// ======================================================

export const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
});

// ======================================================
// VERIFICACIÓN DE CONEXIÓN
// ======================================================

pool.connect()
  .then(() => {
    console.log("🐘 PostgreSQL conectado");
  })
  .catch((err) => {
    console.error("❌ Error PostgreSQL:", err);
  });

  