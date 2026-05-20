import express from "express";

import {
  register,
  verifyCode,
  resendCode,
  sendRegisterSuccess,
  sendProfileUpdated,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify", verifyCode);
router.post("/resend", resendCode);
router.post("/register-success", sendRegisterSuccess);
router.post("/profile-updated", sendProfileUpdated);

export default router;

