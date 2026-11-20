
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import superAdminMiddleware from "../middleware/superAdminMiddleware.js";

const router = express.Router();

// Sirf Super Admin naye Admin accounts bana sakta hai
router.post(
  "/admins",
  authMiddleware,
  superAdminMiddleware,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const normalizedEmail = email?.trim().toLowerCase();

      if (!name?.trim() || !normalizedEmail || !password) {
        return res.status(400).json({
          message: "Name, email, and password are required",
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          message: "Password must be at least 8 characters",
        });
      }

      const existingUser = await User.findOne({
        email: normalizedEmail,
      });

      if (existingUser) {
        return res.status(409).json({
          message: "Email is already registered",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const admin = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "admin",
      });

      return res.status(201).json({
        message: "Admin account created successfully",
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          message: "Email is already registered",
        });
      }

      console.error("Admin creation failed:", error.message);

      return res.status(500).json({
        message: "Unable to create admin account",
      });
    }
  }
);

export default router;
