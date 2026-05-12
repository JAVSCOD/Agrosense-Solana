import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { transporter } from "../utils/mailer.js";

const generarCodigo = () =>
  Math.floor(100000 + Math.random() * 900000).toString();


// =============================
// 🔥 REGISTER
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

    if (!nombres || !primerapellido || !email || !password) {
      return res.json({
        ok: false,
        error: "Datos incompletos",
      });
    }

    let user = await User.findOne({ email });

    const hashedPassword = await bcrypt.hash(password, 10);

    const code = generarCodigo();
    const expires = new Date(Date.now() + 5 * 60 * 1000);

    if (user) {
      if (user.verified) {
        return res.json({
          ok: false,
          error: "El usuario ya existe",
        });
      }

      user.password = hashedPassword;
      user.verificationCode = code;
      user.verificationExpires = expires;
    } else {
      user = new User({
        nombres,
        primerapellido,
        segundoapellido,
        email,
        telefono,
        password: hashedPassword,
        verificationCode: code,
        verificationExpires: expires,
        verified: false,
        proveedor: "credentials",
      });
    }

    await user.save();

    try {
      await transporter.sendMail({
        from: `"AgroSense 🌱" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Código de verificación",
        html: `
          <h2>Bienvenido a AgroSense 🌱</h2>
          <p>Tu código es:</p>
          <h1 style="color:#00BB77">${code}</h1>
          <p>Expira en 5 minutos</p>
        `,
      });
    } catch (error) {
      console.log("⚠️ Error enviando correo:", error.message);
    }

    return res.json({
      ok: true,
      message: "Usuario registrado",
    });
  } catch (error) {
    console.error("❌ ERROR REGISTER:", error);

    return res.status(500).json({
      ok: false,
      error: "Error en registro",
    });
  }
};


// =============================
// 🔐 LOGIN
// =============================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        ok: false,
        error: "Usuario no existe",
      });
    }

    if (!user.verified) {
      return res.json({
        ok: false,
        error: "Debes verificar tu correo",
      });
    }

    if (user.proveedor !== "credentials") {
      return res.json({
        ok: false,
        error: "Usa Google o GitHub para iniciar sesión",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({
        ok: false,
        error: "Contraseña incorrecta",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        nombres: user.nombres,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ✅ COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      ok: true,
      user: {
        id: user._id,
        nombres: user.nombres,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: "Error login",
    });
  }
};


// =============================
// 🔁 REENVIAR CÓDIGO
// =============================
export const resendCode = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        ok: false,
        error: "Usuario no existe",
      });
    }

    const code = generarCodigo();

    user.verificationCode = code;
    user.verificationExpires = new Date(Date.now() + 5 * 60 * 1000);

    await user.save();

    try {
      await transporter.sendMail({
        from: `"AgroSense 🌱" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Nuevo código",
        html: `<h1>${code}</h1>`,
      });
    } catch (error) {
      console.log("⚠️ Error correo:", error.message);
    }

    return res.json({
      ok: true,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
    });
  }
};


// =============================
// ✅ VERIFY CODE
// =============================
export const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        ok: false,
        error: "Usuario no existe",
      });
    }

    if (user.verificationCode !== code) {
      return res.json({
        ok: false,
        error: "Código incorrecto",
      });
    }

    if (user.verificationExpires < new Date()) {
      return res.json({
        ok: false,
        error: "Código expirado",
      });
    }

    user.verified = true;
    user.verificationCode = null;
    user.verificationExpires = null;

    await user.save();

    return res.json({
      ok: true,
      message: "Cuenta verificada",
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
    });
  }
};


// =============================
// 👤 PERFIL
// =============================
export const getMe = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: "No autorizado",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({
        ok: false,
        error: "Usuario no encontrado",
      });
    }

    return res.json({
      ok: true,
      user,
    });
  } catch (error) {
    console.error("❌ GETME ERROR:", error);

    return res.status(401).json({
      ok: false,
      error: "Token inválido",
    });
  }
};


// =============================
// 🚪 LOGOUT
// =============================
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });

  return res.json({
    ok: true,
  });
};


// =============================
// 🔥 OAUTH LOGIN
// =============================
export const oauthLogin = async (req, res) => {
  try {
    const { nombre, email, proveedor } = req.body;

    if (!email) {
      return res.json({
        ok: false,
        error: "Email requerido",
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        nombres: nombre || "Usuario",
        email,
        password: null,
        verified: true,
        proveedor,
      });

      await user.save();
    } else {
      user.proveedor = proveedor;
      user.verified = true;

      await user.save();
    }

    return res.json({
      ok: true,
      user,
    });
  } catch (error) {
    console.error("❌ OAuth error:", error);

    return res.status(500).json({
      ok: false,
    });
  }
};

