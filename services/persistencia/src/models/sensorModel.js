import { pool } from "../db/postgresClient.js";

// ======================================================
// MODELO: SENSORES / EVENTOS AGRÍCOLAS
// ======================================================
//
// Función:
//
// - Crear la tabla sensores si no existe.
// - Guardar eventos procesados por el sistema.
// - Conservar datos del sensor, zona, prioridad,
//   acción, bomba y detalle de evaluación.
//
// ======================================================

export const crearTablaSensores = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS sensores (
      id SERIAL PRIMARY KEY,

      device_id VARCHAR(100),

      humedad FLOAT,
      ph FLOAT,
      temperatura FLOAT,

      zona VARCHAR(50),
      sector VARCHAR(100),
      cultivo VARCHAR(100),

      prioridad VARCHAR(30),
      sensor_origen VARCHAR(50),
      razon TEXT,
      accion VARCHAR(100),
      bomba BOOLEAN,

      detalle JSONB,

      recibido_por VARCHAR(100),

      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("📊 Tabla sensores lista");
};

export const guardarSensor = async (data) => {
  const {
    deviceId,

    humedad,
    ph,
    temperatura,

    zona,
    sector,
    cultivo,

    prioridad,
    sensorOrigen,
    razon,
    accion,
    bomba,
    detalle,

    recibidoPor,
  } = data;

  await pool.query(
    `
    INSERT INTO sensores (
      device_id,
      humedad,
      ph,
      temperatura,
      zona,
      sector,
      cultivo,
      prioridad,
      sensor_origen,
      razon,
      accion,
      bomba,
      detalle,
      recibido_por
    )
    VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9,$10,
      $11,$12,$13,$14
    )
    `,
    [
      deviceId || null,

      Number(humedad ?? 0),
      Number(ph ?? 0),
      Number(temperatura ?? 0),

      zona || null,
      sector || null,
      cultivo || null,

      prioridad || "estable",
      sensorOrigen || "desconocido",
      razon || "Sin observaciones",
      accion || "Sin acción definida",
      !!bomba,

      detalle ? JSON.stringify(detalle) : null,

      recibidoPor || null,
    ]
  );
};

