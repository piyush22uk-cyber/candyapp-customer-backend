
import User from "../models/User.js";
export default async function superAdminMiddleware(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("role");

    if (!user) {
      return res.status(401).json({
        message: "User account not found",
      });
    }

    if (user.role !== "superadmin") {
      return res.status(403).json({
        message: "Super Admin permission required",
      });
    }

    req.userRole = user.role;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Unable to verify Super Admin permission",
    });
  }
}
