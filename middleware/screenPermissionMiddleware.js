
import User from "../models/User.js";

export default function screenPermissionMiddleware(screenName) {
  return async function (req, res, next) {
    try {
      // Find logged-in user
      const user = await User.findById(req.userId)
        .select("role allowedScreens isApproved");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Super Admin has full access
      if (user.role === "superadmin") {
        req.userRole = user.role;
        return next();
      }

      // Only Admin can continue
      if (user.role !== "admin") {
        return res.status(403).json({
          message: "Admin access required",
        });
      }

      // Check Super Admin approval
      if (user.isApproved !== true) {
        return res.status(403).json({
          message: "Waiting for Super Admin approval",
          isApproved: false,
        });
      }

      // Check requested screen permission
      const allowedScreens = Array.isArray(user.allowedScreens)
        ? user.allowedScreens
        : [];

      if (!allowedScreens.includes(screenName)) {
        return res.status(403).json({
          message: "You do not have permission for this screen",
          requiredScreen: screenName,
        });
      }

      req.userRole = user.role;
      return next();

    } catch (error) {
      console.error("SCREEN PERMISSION ERROR:", error);

      return res.status(500).json({
        message: "Unable to verify screen permission",
      });
    }
  };
}
