
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    password: {
      type: String,
      required: false,
      minlength: 6,
      select: false,
    },

    firebaseUid: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["customer", "admin", "superadmin"],
      default: "customer",
    },

    expoPushToken: {
      type: String,
      default: null,
    },

    // Refresh Token Hash
    refreshTokenHash: {
      type: String,
      default: null,
      select: false,
    },

    // Admin screen permissions
    allowedScreens: {
      type: [String],
      default: [],
    },

    // Super Admin approval status
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Automatically approve Super Admin accounts
userSchema.pre("save", function () {
  if (this.role === "superadmin") {
    this.isApproved = true;
  }
});

export default mongoose.model("User", userSchema);