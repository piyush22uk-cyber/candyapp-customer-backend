
import express from "express";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import superAdminMiddleware from "../middleware/superAdminMiddleware.js";

const router = express.Router();

// Super Admin creates a new Admin
router.post(
  "/create",
  authMiddleware,
  superAdminMiddleware,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // 1. Check required fields
      if (
        typeof name !== "string" ||
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        return res.status(400).json({
          message: "Name, email and password must be text",
        });
      }

      // 2. Remove extra spaces
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();

      // 3. Validate fields
      if (!cleanName || !cleanEmail || !password) {
        return res.status(400).json({
          message: "All fields are required",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message: "Password must contain at least 8 characters",
        });
      }

      // 4. Check if email already exists
      const existingUser = await User.findOne({
        email: cleanEmail,
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email already registered",
        });
      }

      // 5. Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // 6. Create Admin account
      const admin = await User.create({
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        role: "admin",
        isApproved: false,
        allowedScreens: [],
      });

      // 7. Send response
      return res.status(201).json({
        message: "Admin created successfully",
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          isApproved: admin.isApproved,
          allowedScreens: admin.allowedScreens,
        },
      });

    } catch (error) {
      console.error("Create Admin Error:", error);

      return res.status(500).json({
        message: "Unable to create Admin",
      });
    }
  }
);

export default router;
