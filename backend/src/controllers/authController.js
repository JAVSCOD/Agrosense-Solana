import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { transporter } from "../utils/mailer.js";

const generarCodigo = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const registrosPendientes = new Map();

// =============================
// REGISTER: SOLO ENVÍA CÓDIGO
// =============================
export const register = async (req, res) => {
  try {
    const {
      nombres,
      primerapellido,
      segundoapellido,
      email,
      telefono,
      password,
    } = req.body;

    if (!nombres || !primerapellido || !email || !telefono || !password) {
      return res.json({
        ok: false,
        error: "Datos incompletos",
      });
    }

    const code = generarCodigo();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    registrosPendientes.set(email, {
      nombres,
      primerapellido,
      segundoapellido,
      email,
      telefono,
      password,
      verificationCode: code,
      verificationExpires: expires,
      verified: false,
    });

    await transporter.sendMail({
      from: `"AgroSense 🌱" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Código de verificación - AgroSense",
      html: `
        <h2>Bienvenido a AgroSense 🌱</h2>
        <p>Tu código de verificación es:</p>
        <h1 style="color:#00BB77">${code}</h1>
        <p>Este código expira en 5 minutos.</p>
      `,
    });

    return res.json({
      ok: true,
      message: "Código enviado al correo",
    });
  } catch (error) {
    console.error("❌ ERROR REGISTER:", error);

    return res.status(500).json({
      ok: false,
      error: "Error enviando código",
    });
  }
};

// =============================
// VERIFY CODE
// =============================
export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const pendingUser = registrosPendientes.get(email);

    if (!pendingUser) {
      return res.json({
        ok: false,
        error: "No hay registro pendiente para este correo",
      });
    }

    if (pendingUser.verificationCode !== code) {
      return res.json({
        ok: false,
        error: "Código incorrecto",
      });
    }

    if (pendingUser.verificationExpires < new Date()) {
      registrosPendientes.delete(email);

      return res.json({
        ok: false,
        error: "Código expirado",
      });
    }

    pendingUser.verified = true;
    registrosPendientes.set(email, pendingUser);

    return res.json({
      ok: true,
      message: "Correo verificado correctamente",
      user: {
        nombres: pendingUser.nombres,
        primerapellido: pendingUser.primerapellido,
        segundoapellido: pendingUser.segundoapellido,
        email: pendingUser.email,
        telefono: pendingUser.telefono,
      },
    });
  } catch (error) {
    console.error("❌ VERIFY ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Error verificando código",
    });
  }
};

// =============================
// ENVIAR CORREO FINAL
// DESPUÉS DE REGISTRAR EN SOLANA
// =============================
export const sendRegisterSuccess = async (req, res) => {
  try {
    const { email, wallet, pda, tx } = req.body;

    const pendingUser = registrosPendientes.get(email);

    if (!pendingUser || !pendingUser.verified) {
      return res.json({
        ok: false,
        error: "El correo no ha sido verificado",
      });
    }

    await transporter.sendMail({
      from: `"AgroSense 🌱" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Registro exitoso en AgroSense-Web3",
      html: `
        <h2>Cuenta creada correctamente 🌱</h2>

        <p>Tu cuenta fue registrada exitosamente en AgroSense-Web3.</p>

        <h3>Datos de acceso</h3>
        <p><b>Nombre:</b> ${pendingUser.nombres}</p>
        <p><b>Primer apellido:</b> ${pendingUser.primerapellido}</p>
        <p><b>Segundo apellido:</b> ${pendingUser.segundoapellido || "N/A"}</p>
        <p><b>Correo:</b> ${pendingUser.email}</p>
        <p><b>Teléfono:</b> ${pendingUser.telefono}</p>

        <h3>Datos Web3</h3>
        <p><b>Wallet:</b> ${wallet}</p>
        <p><b>UserAccount PDA:</b> ${pda}</p>
        <p><b>Transacción:</b> ${tx}</p>

        <p style="color:#00BB77;">
          Ya puedes ingresar a tu dashboard.
        </p>
      `,
    });

    registrosPendientes.delete(email);

    return res.json({
      ok: true,
      message: "Correo final enviado",
    });
  } catch (error) {
    console.error("❌ SEND SUCCESS EMAIL ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Error enviando correo final",
    });
  }
};

// =============================
// REENVIAR CÓDIGO
// =============================
export const resendCode = async (req, res) => {
  try {
    const { email } = req.body;

    const pendingUser = registrosPendientes.get(email);

    if (!pendingUser) {
      return res.json({
        ok: false,
        error: "No hay registro pendiente para este correo",
      });
    }

    const code = generarCodigo();

    pendingUser.verificationCode = code;
    pendingUser.verificationExpires = new Date(Date.now() + 5 * 60 * 1000);

    registrosPendientes.set(email, pendingUser);

    await transporter.sendMail({
      from: `"AgroSense 🌱" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Nuevo código de verificación - AgroSense",
      html: `
        <h2>Nuevo código de verificación</h2>
        <h1 style="color:#00BB77">${code}</h1>
        <p>Expira en 5 minutos.</p>
      `,
    });

    return res.json({
      ok: true,
      message: "Código reenviado",
    });
  } catch (error) {
    console.error("❌ RESEND ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Error reenviando código",
    });
  }
};

// =============================
// CORREO DE PERFIL ACTUALIZADO
// =============================
export const sendProfileUpdated = async (req, res) => {
  try {
    const {
      email,
      nombres,
      primerApellido,
      segundoApellido,
      telefono,
      wallet,
      pda,
      tx,
    } = req.body;

    if (!email) {
      return res.json({
        ok: false,
        error: "Correo requerido",
      });
    }

    await transporter.sendMail({
      from: `"AgroSense 🌱" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Perfil actualizado - AgroSense-Web3",
      html: `
        <h2>Perfil actualizado correctamente 🌱</h2>

        <p>Se realizaron cambios en tu perfil de AgroSense-Web3.</p>

        <h3>Datos actualizados</h3>
        <p><b>Nombre:</b> ${nombres || "N/A"}</p>
        <p><b>Primer apellido:</b> ${primerApellido || "N/A"}</p>
        <p><b>Segundo apellido:</b> ${segundoApellido || "N/A"}</p>
        <p><b>Correo:</b> ${email}</p>
        <p><b>Teléfono:</b> ${telefono || "N/A"}</p>

        <h3>Datos Web3</h3>
        <p><b>Wallet:</b> ${wallet || "N/A"}</p>
        <p><b>UserAccount PDA:</b> ${pda || "N/A"}</p>
        <p><b>Transacción:</b> ${tx || "N/A"}</p>

        <p style="color:#00BB77;">
          Tus cambios fueron registrados correctamente en Solana.
        </p>
      `,
    });

    return res.json({
      ok: true,
      message: "Correo de actualización enviado",
    });
  } catch (error) {
    console.error("❌ PROFILE UPDATED EMAIL ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Error enviando correo de actualización",
    });
  }
};

