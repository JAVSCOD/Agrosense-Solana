import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    // ✅ leer token desde cookies
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: "No autorizado",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      error: "Token inválido",
    });
  }
};

