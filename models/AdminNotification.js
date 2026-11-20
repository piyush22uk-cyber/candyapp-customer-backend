import mongoose from "mongoose";

const adminNotificationSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },

  customerName: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    default: "New Customer Order",
  },

  message: {
    type: String,
    required: true,
  },

  totalAmount: {
    type: Number,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model(
  "AdminNotification",
  adminNotificationSchema
);