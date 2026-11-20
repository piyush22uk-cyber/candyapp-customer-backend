import express from "express";
import mongoose from "mongoose";

import AdminNotification from "../models/AdminNotification.js";
import authMiddleware from "../middleware/authMiddleware.js";
import screenPermissionMiddleware from "../middleware/screenPermissionMiddleware.js";

const router = express.Router();

// GET: Notifications receive karna
router.get(
  "/",
  authMiddleware,
  screenPermissionMiddleware("notifications"),
  async (req, res) => {
    try {
      const notifications = await AdminNotification.find()
        .sort({ createdAt: -1 });

      return res.json({ notifications });
    } catch (error) {
      console.error("Admin notification error:", error);

      return res.status(500).json({
        message: "Unable to load notifications",
      });
    }
  }
);

// DELETE ALL: Saari notifications delete karna
router.delete(
  "/delete-all",
  authMiddleware,
  screenPermissionMiddleware("notifications"),
  async (req, res) => {
    try {
      const result = await AdminNotification.deleteMany({});

      return res.json({
        message: "All notifications deleted",
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      console.error("Delete all error:", error);

      return res.status(500).json({
        message: "Unable to delete notifications",
      });
    }
  }
);

// DELETE ONE: Ek notification delete karna
router.delete(
  "/:id",
  authMiddleware,
  screenPermissionMiddleware("notifications"),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          message: "Invalid notification ID",
        });
      }

      const notification =
        await AdminNotification.findByIdAndDelete(req.params.id);

      if (!notification) {
        return res.status(404).json({
          message: "Notification not found",
        });
      }

      return res.json({
        message: "Notification deleted successfully",
      });
    } catch (error) {
      console.error("Delete notification error:", error);

      return res.status(500).json({
        message: "Unable to delete notification",
      });
    }
  }
);

export default router;