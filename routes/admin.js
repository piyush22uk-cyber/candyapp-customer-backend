
// import express from "express";
// import authMiddleware from "../middleware/authMiddleware.js";
// import adminMiddleware from "../middleware/adminMiddleware.js";

// const router = express.Router();

// // Protected test route
// router.get(
//   "/test",
//   authMiddleware,
//   adminMiddleware,
//   (req, res) => {
//     res.json({
//       message: "Admin access granted",
//       role: req.userRole,
//     });
//   }
// );

// export default router;


import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import superAdminMiddleware from "../middleware/superAdminMiddleware.js";

const router = express.Router();

// Admin aur Super Admin dono access kar sakte hain
router.get(
  "/test",
  authMiddleware,
  adminMiddleware,
  (req, res) => {
    res.json({
      message: "Admin access granted",
      role: req.userRole,
    });
  }
);

// Sirf Super Admin access kar sakta hai
router.get(
  "/superadmin-test",
  authMiddleware,
  superAdminMiddleware,
  (req, res) => {
    res.json({
      message: "Super Admin access granted",
      role: req.userRole,
    });
  }
);

export default router;

