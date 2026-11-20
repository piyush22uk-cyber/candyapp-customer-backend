

import express from "express";
import { Expo } from "expo-server-sdk";
import mongoose from "mongoose";

import User from "../models/User.js";
import Notification from "../models/Notification.js";
import authMiddleware from "../middleware/authMiddleware.js";
import screenPermissionMiddleware from "../middleware/screenPermissionMiddleware.js";

const router = express.Router();
const expo = new Expo();


// 1. ADMIN: Save notification and send push
router.post(
  "/send",
  authMiddleware,
  screenPermissionMiddleware("notifications"),
  async (req, res) => {
    try {
      // Step 1: Request body se title aur message lo
      const {
        title: rawTitle,
        message: rawMessage,
      } = req.body;

      // Step 2: Check karo dono values text hain
      if (
        typeof rawTitle !== "string" ||
        typeof rawMessage !== "string"
      ) {
        return res.status(400).json({
          message: "Title and message must be text",
        });
      }

      // Step 3: Extra spaces remove karo
      const title = rawTitle.trim();
      const message = rawMessage.trim();

      // Step 4: Empty values check karo
      if (!title || !message) {
        return res.status(400).json({
          message: "Title and message are required",
        });
      }

      // Step 5: Maximum length check karo
      if (title.length > 100 || message.length > 500) {
        return res.status(400).json({
          message: "Title max 100 and message max 500 characters",
        });
      }
// Database se sabhi customers fetch karo
const customers = await User.find({
  role: "customer",
}).select("_id expoPushToken");

      // Step 7: Har customer ki notification save karo
      if (customers.length > 0) {
        await Notification.insertMany(
          customers.map((customer) => ({
            userId: customer._id,
            title,
            message,
          }))
        );
      }

      // Step 8: Valid push tokens collect karo
      const pushMessages = [];

      for (const customer of customers) {
        const token = customer.expoPushToken;

        if (token && Expo.isExpoPushToken(token)) {
          pushMessages.push({
            to: token,
            sound: "default",
            title,
            body: message,
          });
        }
      }

      // Step 9: Push notifications send karo
      let acceptedByExpo = 0;

      if (pushMessages.length > 0) {
        const chunks = expo.chunkPushNotifications(pushMessages);

        for (const chunk of chunks) {
          const tickets =
            await expo.sendPushNotificationsAsync(chunk);

          acceptedByExpo += tickets.filter(
            (ticket) => ticket.status === "ok"
          ).length;
        }
      }

      // Step 10: Response return karo
      return res.json({
        message: "Notifications saved successfully",
        totalCustomers: customers.length,
        pushRecipients: pushMessages.length,
        acceptedByExpo,
      });

    } catch (error) {
      console.error("Notification send error:", error);

      return res.status(500).json({
        message: "Unable to send notifications",
      });
    }
  }
);
// 2. CUSTOMER: Get own notifications
router.get("/", authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    return res.json({ notifications });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      message: "Unable to load notifications",
    });
  }
});

// 3. CUSTOMER: Mark one notification as read
// router.patch(
//   "/:id/read",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       if (!mongoose.isValidObjectId(req.params.id)) {
//         return res.status(400).json({
//           message: "Invalid notification ID",
//         });
//       }

//       const notification = await Notification.findOneAndUpdate(
//         {
//           _id: req.params.id,
//           userId: req.userId,
//         },
//         { isRead: true },
//         { new: true }
//       );

//       if (!notification) {
//         return res.status(404).json({
//           message: "Notification not found",
//         });
//       }

//       return res.json({
//         message: "Notification marked as read",
//         notification,
//       });
//     } catch (error) {
//       console.error("Mark read error:", error);

//       return res.status(500).json({
//         message: "Unable to update notification",
//       });
//     }
//   }
// );

// 4. CUSTOMER: Delete all read notifications
// Keep this route ABOVE "/:id"
// router.delete(
//   "/read",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       const result = await Notification.deleteMany({
//         userId: req.userId,
//         isRead: true,
//       });

//       return res.json({
//         message: "Read notifications deleted",
//         deletedCount: result.deletedCount,
//       });
//     } catch (error) {
//       console.error("Delete read notifications error:", error);

//       return res.status(500).json({
//         message: "Unable to delete notifications",
//       });
//     }
//   }
// );

// // 5. CUSTOMER: Delete one read notification
// router.delete(
//   "/:id",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       if (!mongoose.isValidObjectId(req.params.id)) {
//         return res.status(400).json({
//           message: "Invalid notification ID",
//         });
//       }

//       const notification = await Notification.findOneAndDelete({
//         _id: req.params.id,
//         userId: req.userId,
//         isRead: true,
//       });

//       if (!notification) {
//         return res.status(404).json({
//           message: "Read notification not found",
//         });
//       }

//       return res.json({
//         message: "Notification deleted",
//       });
//     } catch (error) {
//       console.error("Delete notification error:", error);

//       return res.status(500).json({
//         message: "Unable to delete notification",
//       });
//     }
//   }
// );

// Customer apni notification delete kar sakta hai
// Customer can delete their own notification
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    // Check notification ID
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid notification ID",
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      message: "Notification deleted successfully",
    });

  } catch (error) {
    console.log("Delete notification error:", error.message);

    return res.status(500).json({
      message: "Failed to delete notification",
    });
  }
});

export default router;