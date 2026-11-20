
import express from "express";
import mongoose from "mongoose";
import User from "../models/User.js";

import authMiddleware from "../middleware/authMiddleware.js";
import superAdminMiddleware from "../middleware/superAdminMiddleware.js";

const router = express.Router();

// Admin ko mil sakne wali screens
const allowedScreenNames = [
  "dashboard",
  "products",
  "orders",
  "customers",
  "notifications",
   "viewUsers",
  "adminNotifications",
  "about",
  "account",
];


// 1. SUPER ADMIN: Get all Admin accounts
router.get(
  "/admins",
  authMiddleware,
  superAdminMiddleware,
  async (req, res) => {
    try {
      const admins = await User.find({ role: "admin" })
        .select("name email role allowedScreens isApproved createdAt")
        .sort({ createdAt: -1 });

      return res.json({
        message: "Admin list fetched successfully",
        admins,
      });

    } catch (error) {
      console.error("GET ADMINS ERROR:", error);

      return res.status(500).json({
        message: "Unable to fetch Admin list",
      });
    }
  }
);


// 2. SUPER ADMIN: Give or update Admin permissions
router.put(
  "/admins/:id/permissions",
  authMiddleware,
  superAdminMiddleware,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { allowedScreens } = req.body;

      // Check MongoDB ID
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid Admin ID",
        });
      }

      // Permissions must be an array
      if (!Array.isArray(allowedScreens)) {
        return res.status(400).json({
          message: "Allowed screens must be an array",
        });
      }

      // Check every requested screen
      const invalidScreens = allowedScreens.filter(
        (screen) =>
          typeof screen !== "string" ||
          !allowedScreenNames.includes(screen)
      );

      if (invalidScreens.length > 0) {
        return res.status(400).json({
          message: "One or more screen permissions are invalid",
          allowedScreenNames,
        });
      }

      // Remove duplicate screen names
      const uniqueScreens = [...new Set(allowedScreens)];

      // Find only an Admin account
      const admin = await User.findOne({
        _id: id,
        role: "admin",
      });

      if (!admin) {
        return res.status(404).json({
          message: "Admin account not found",
        });
      }

      // Save permissions
      admin.allowedScreens = uniqueScreens;

      // No permissions means not approved
      admin.isApproved = uniqueScreens.length > 0;

      await admin.save();

      return res.json({
        message: admin.isApproved
          ? "Admin permissions updated successfully"
          : "Admin access revoked successfully",

        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          allowedScreens: admin.allowedScreens,
          isApproved: admin.isApproved,
        },
      });

    } catch (error) {
      console.error("UPDATE PERMISSIONS ERROR:", error);

      return res.status(500).json({
        message: "Unable to update Admin permissions",
      });
    }
  }
);


// 3. ADMIN: Check own permissions
// 3. ADMIN: Check own permissions
router.get(
  "/my-permissions",
  authMiddleware,
  async (req, res) => {
    try {
      const user = await User.findById(req.userId)
        .select("name email role allowedScreens isApproved");

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      // Super Admin always has full screen access
      if (user.role === "superadmin") {
        return res.json({
          message: "Super Admin has full access",
          isApproved: true,
          allowedScreens: allowedScreenNames,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        });
      }

      // Only Admin accounts can use this endpoint
      if (user.role !== "admin") {
        return res.status(403).json({
          message: "Admin account required",
        });
      }

      // Existing Admins without these fields stay pending
      const isApproved = user.isApproved === true;

      const screens = isApproved && Array.isArray(user.allowedScreens)
        ? user.allowedScreens
        : [];

      return res.json({
        message: isApproved
          ? "Admin permissions fetched successfully"
          : "Waiting for Super Admin approval",

        isApproved,
        allowedScreens: screens,

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });

    } catch (error) {
      console.error("MY PERMISSIONS ERROR:", error);

      return res.status(500).json({
        message: "Unable to check permissions",
      });
    }
  }
);

export default router;
