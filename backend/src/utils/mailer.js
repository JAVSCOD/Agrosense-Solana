import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// 🔥 Fix para ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔥 Cargar .env correctamente
dotenv.config({
  path: path.join(__dirname, "../../.env"),
});

// 🧪 DEBUG (puedes quitar después)
//console.log("EMAIL_USER:", process.env.EMAIL_USER);
//console.log("EMAIL_PASS:", process.env.EMAIL_PASS);

// 🚀 TRANSPORTER
export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

