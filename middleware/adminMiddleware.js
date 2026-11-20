
// import User from "../models/User.js";

// export default async function adminMiddleware(req, res, next) {
//   try {
//     // Database se current user ka role check karo
//     const user = await User.findById(req.userId).select("role");
    
//     if (!user) {
//       return res.status(401).json({
//         message: "User not found",
//       });
//     }

//     // Sirf admin ko permission milegi
//     if (user.role !== "admin") {
//       return res.status(403).json({
//         message: "Admin access required",
//       });
//     }

//     req.userRole = user.role;
//     next();
//   } catch (error) {
//     return res.status(500).json({
//       message: "Unable to verify admin access",
//     });
//   }
// }



import User from "../models/User.js";

export default async function adminMiddleware(req, res, next) {
  try {
    const user = await User.findById(req.userId).select("role");

    if (!user) {
      return res.status(401).json({
        message: "User account not found",
      });
    }

    if (!["admin", "superadmin"].includes(user.role)) {
      return res.status(403).json({
        message: "Admin permission required",
      });
    }

    req.userRole = user.role;

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Unable to verify admin permission",
    });
  }
}
