import { pool } from "../db/postgresClient.js";

export const obtenerHistorial = async () => {
  const resultado = await pool.query(`
    SELECT *
    FROM sensores
    ORDER BY fecha DESC
    LIMIT 100
  `);

  return resultado.rows;
};

