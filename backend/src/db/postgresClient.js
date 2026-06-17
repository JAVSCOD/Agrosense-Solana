import pkg from "pg";

const { Pool } = pkg;

export const pool = new Pool({
  host: process.env.POSTGRES_HOST || "postgres",
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USER || "agrosense",
  password: process.env.POSTGRES_PASSWORD || "agrosense123",
  database: process.env.POSTGRES_DB || "agrosense_db",
});

