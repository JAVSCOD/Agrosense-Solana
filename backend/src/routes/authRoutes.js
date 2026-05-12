import express from "express";
import {
  register,
  verifyCode,
  login,
  resendCode,
  getMe,     // 🔥 NUEVO
  logout,    // 🔥 NUEVO
} from "../controllers/authController.js";

import { authMiddleware } from "../middleware/auth.js"; // 🔥 IMPORTANTE
import { oauthLogin } from "../controllers/authController.js";

const router = express.Router();

// 🔐 AUTH
router.post("/register", register);
router.post("/verify", verifyCode);
router.post("/login", login);
router.post("/resend", resendCode);

// 👤 PERFIL (PROTEGIDO)
router.get("/me", authMiddleware, getMe);

// 🚪 LOGOUT
router.post("/logout", logout);

//DATOS A MONGO
router.post("/oauth", oauthLogin);

export default router;

