import express from "express";
import { getHistorial } from "../controllers/historialController.js";

const router = express.Router();

router.get("/", getHistorial);

export default router;

