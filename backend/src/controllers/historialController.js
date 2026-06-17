import { obtenerHistorial } from "../services/historialService.js";

export const getHistorial = async (req, res) => {
  try {
    const historial = await obtenerHistorial();

    res.json({
      ok: true,
      data: historial,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
};

