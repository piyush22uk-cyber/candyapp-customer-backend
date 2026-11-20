
import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");

      return res.status(500).json({
        message: "Server authentication is not configured",
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authorization token required",
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        message: "Authorization token required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded.userId) {
      return res.status(401).json({
        message: "Invalid authorization token",
      });
    }

    req.userId = decoded.userId;

    next();
  } catch (error) {
    // Actual error terminal mein check karo
    console.error("JWT VERIFY ERROR:", error.name, error.message);

    return res.status(401).json({
      message:
        error.name === "TokenExpiredError"
          ? "Session expired. Please login again."
          : "Invalid authorization token",
    });
  }
}
