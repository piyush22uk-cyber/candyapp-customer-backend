import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import path from "node:path";
import authRoutes from "./routes/authRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js";
import adminRoutes from "./routes/admin.js";
import fruitRoutes from "./routes/fruitRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import connectDB from "./config/db.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import adminPermissionsRoutes from "./routes/adminPermissionRoutes.js";
import adminNotificationsRouter from "./routes/adminNotifications.js";




const app = express();
const port = process.env.PORT || 2005;

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "uploads"))
);
// app.use("/uploads", express.static("uploads"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/superadmin",superAdminRoutes);
app.use("/api/fruits", fruitRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin/permissions", adminPermissionsRoutes);
app.use("/api/admin-notifications", adminNotificationsRouter);


async function startServer() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  await connectDB();
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});

