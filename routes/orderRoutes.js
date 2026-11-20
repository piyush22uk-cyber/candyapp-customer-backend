import authMiddleware from "../middleware/authMiddleware.js";
import screenPermissionMiddleware from "../middleware/screenPermissionMiddleware.js";
import express from "express";
import Order from "../models/Order.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import { Expo } from "expo-server-sdk";
import Fruit from "../models/Fruit.js";
import Notification from "../models/Notification.js";
import AdminNotification from "../models/AdminNotification.js";


const ALLOWED_STATUSES = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const router = express.Router();
// Initialize Expo push notification service
const expo = new Expo();

router.post("/", authMiddleware, async (req, res) => {
  const reservedStock = [];
  let orderCreated = false;

  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    // Check required order information
    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      !deliveryAddress
    ) {
      return res.status(400).json({
        message: "Required order information is missing",
      });
    }

    // Find the logged-in customer
    const customer = await User.findById(req.userId);

    if (!customer || customer.role !== "customer") {
      return res.status(403).json({
        message: "Only customers can place orders",
      });
    }

    // Combine duplicate products into one quantity
    const productQuantities = {};

    for (const item of items) {
      const productId = item.productId;
      const quantity = Number(item.quantity);

      if (
        !mongoose.isValidObjectId(productId) ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          message: "Invalid product ID or quantity",
        });
      }

      if (!productQuantities[productId]) {
        productQuantities[productId] = 0;
      }

      productQuantities[productId] += quantity;
    }

    // Prepare products using database information
    const orderItems = [];

    for (const productId of Object.keys(productQuantities)) {
      const requestedQuantity = productQuantities[productId];

      const fruit = await Fruit.findById(productId);

      if (!fruit) {
        return res.status(404).json({
          message: "One or more products were not found",
        });
      }

      // Check maximum quantity allowed per order
      if (requestedQuantity > fruit.maxQuantity) {
        return res.status(400).json({
          message: `${fruit.name}: Maximum allowed quantity is ${fruit.maxQuantity}`,
        });
      }

      // Check current available stock
      if (fruit.quantity <= 0) {
        return res.status(409).json({
          message: `${fruit.name} is Out of Stock`,
        });
      }

      if (requestedQuantity > fruit.quantity) {
        return res.status(409).json({
          message: `Only ${fruit.quantity} ${fruit.name} available in stock`,
        });
      }

      orderItems.push({
        productId: fruit._id,
        name: fruit.name,
        price: fruit.price,
        weight: fruit.weight,
        image: fruit.image,
        quantity: requestedQuantity,
        totalPrice: fruit.price * requestedQuantity,
      });
    }

    // Calculate totals using database prices
    const totalItems = orderItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    const totalAmount = orderItems.reduce(
      (total, item) => total + item.totalPrice,
      0
    );

    // Reserve stock before creating the order
    for (const item of orderItems) {
      const updatedFruit = await Fruit.findOneAndUpdate(
        {
          _id: item.productId,
          quantity: { $gte: item.quantity },
        },
        {
          $inc: { quantity: -item.quantity },
        },
        {
          new: true,
        }
      );

      // Another customer may have purchased the stock first
      if (!updatedFruit) {
        // Restore any stock already reserved for this order
        for (const reserved of reservedStock) {
          await Fruit.updateOne(
            { _id: reserved.productId },
            { $inc: { quantity: reserved.quantity } }
          );
        }

        reservedStock.length = 0;

        const latestFruit = await Fruit.findById(item.productId);

        if (!latestFruit || latestFruit.quantity <= 0) {
          return res.status(409).json({
            message: `${item.name} is Out of Stock`,
          });
        }

        return res.status(409).json({
          message: `Only ${latestFruit.quantity} ${item.name} available in stock`,
        });
      }

      // Remember the stock reserved for this order
      reservedStock.push({
        productId: item.productId,
        quantity: item.quantity,
      });
    }

    // Create order after stock reservation
    const order = await Order.create({
      userId: customer._id,
      userEmail: customer.email,
      items: orderItems,
      totalItems,
      totalAmount,
      deliveryAddress,
      paymentMethod: paymentMethod || "COD",
      paymentStatus: "Pending",
      orderStatus: "Pending",
    });

    orderCreated = true;

    // Notify Super Admin and permitted Admins
try {
  // Step 1: Save new order notification in MongoDB
  await AdminNotification.create({
    orderId: order._id,
    customerName: customer.name || "A customer",
    title: "New Order Received!",
    message: `${customer.name || "A customer"} placed a new order.`,
    totalAmount: totalAmount,
  });


  console.log("MATCHED ADMIN DEVICES:", admins.length);

admins.forEach((admin) => {
  console.log("ADMIN TOKEN EXISTS:", !!admin.expoPushToken);
});

  console.log("ADMIN NOTIFICATION SAVED SUCCESSFULLY");

} catch (notificationError) {
  console.log(
    "ADMIN NOTIFICATION SAVE ERROR:",
    notificationError.message
  );
}


// Notify Super Admin and permitted Admins
try {
  // Step 1: Save notification in MongoDB
  await AdminNotification.create({
    orderId: order._id,
    customerName: customer.name || "A customer",
    title: "New Order Received!",
    message: `${customer.name || "A customer"} placed a new order.`,
    totalAmount,
  });

  console.log("ADMIN NOTIFICATION SAVED SUCCESSFULLY");

  // Step 2: Find eligible admin accounts with push tokens
  const admins = await User.find({
    $or: [
      { role: "superadmin" },
      {
        role: "admin",
        isApproved: true,
        allowedScreens: "notifications",
      },
    ],
    expoPushToken: {
      $type: "string",
      $ne: "",
    },
  }).select("expoPushToken role");

  console.log("MATCHED ADMIN DEVICES:", admins.length);

  admins.forEach((admin) => {
    console.log(
      "ADMIN ROLE:",
      admin.role,
      "TOKEN EXISTS:",
      !!admin.expoPushToken
    );
  });

  // Step 3: Collect valid Expo tokens
  const adminTokens = admins
    .map((admin) => admin.expoPushToken)
    .filter((token) => Expo.isExpoPushToken(token));

  console.log("VALID ADMIN PUSH TOKENS:", adminTokens.length);

  // Step 4: Prepare messages
  const messages = adminTokens.map((token) => ({
    to: token,
    sound: "default",
    title: "New Order Received!",
    body: `${customer.name || "A customer"} placed an order. Amount: Rs. ${totalAmount.toFixed(2)}`,
    data: {
      orderId: order._id.toString(),
      type: "NEW_ORDER",
    },
  }));

  // Step 5: Send notifications
  const chunks = expo.chunkPushNotifications(messages);

  for (const chunk of chunks) {
    const tickets = await expo.sendPushNotificationsAsync(chunk);
    console.log("ADMIN PUSH TICKETS:", tickets);
  }

  console.log(
    `Order notification sent to ${adminTokens.length} admin devices`
  );

} catch (notificationError) {
  console.log(
    "ADMIN PUSH ERROR:",
    notificationError.message
  );
}

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });

  } catch (error) {
    console.log("CREATE ORDER ERROR:", error);

    // Restore reserved stock if order creation failed
    if (!orderCreated) {
      for (const reserved of reservedStock) {
        try {
          await Fruit.updateOne(
            { _id: reserved.productId },
            { $inc: { quantity: reserved.quantity } }
          );
        } catch (restoreError) {
          console.log(
            "STOCK RESTORE ERROR:",
            restoreError.message
          );
        }
      }
    }

    return res.status(500).json({
      message: "Failed to create order",
    });
  }
});

    

router.put(
  "/:orderId/status",
  authMiddleware,
  screenPermissionMiddleware("orders"),
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { orderStatus } = req.body;

      // Validate order ID
      if (!mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({
          message: "Invalid order ID",
        });
      }

      // Validate order status
      if (!ALLOWED_STATUSES.includes(orderStatus)) {
        return res.status(400).json({
          message: "Invalid order status",
          allowedStatuses: ALLOWED_STATUSES,
        });
      }

      // Find the existing order
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // Check whether the status actually changed
      if (order.orderStatus === orderStatus) {
        return res.status(200).json({
          message: "Order already has this status",
          order,
        });
      }

      // Update order status
      order.orderStatus = orderStatus;
      await order.save();

      // Save notification in MongoDB for customer
try {
  await Notification.create({
    userId: order.userId,
    title: "Order Status Updated!",
    message: `Your CandyApp order is now ${orderStatus}.`,
  });

  console.log("ORDER NOTIFICATION SAVED SUCCESSFULLY");

} catch (notificationError) {
  console.log(
    "SAVE ORDER NOTIFICATION ERROR:",
    notificationError.message
  );
}

      // Find the customer who placed this order
      try {
        const customer = await User.findById(
          order.userId
        ).select("name expoPushToken");

        if (
          customer &&
          Expo.isExpoPushToken(customer.expoPushToken)
        ) {

          // Prepare customer notification
          const message = {
            to: customer.expoPushToken,
            sound: "default",
            title: "Order Status Updated!",
            body: `Your CandyApp order is now ${orderStatus}.`,
            data: {
              orderId: order._id.toString(),
              orderStatus,
              type: "ORDER_STATUS_UPDATE",
            },
          };

          // Send notification
          const tickets = await expo.sendPushNotificationsAsync([
            message,
          ]);

          console.log(
            "CUSTOMER PUSH TICKETS:",
            tickets
          );

        } else {
          console.log(
            "Customer Expo push token not found or invalid"
          );
        }

      } catch (notificationError) {
        // Notification failure should not cancel status update
        console.log(
          "CUSTOMER NOTIFICATION ERROR:",
          notificationError.message
        );
      }

      return res.status(200).json({
        message: "Order status updated successfully",
        order,
      });

    } catch (error) {
      console.log(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      return res.status(500).json({
        message: "Failed to update order status",
      });
    }
  }
);


router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const requester = await User.findById(req.userId);

    if (!requester) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    // Customer can only see their own orders
    if (
      requester.role === "customer" &&
      requester._id.toString() !== userId
    ) {
      return res.status(403).json({
        message: "You can only view your own orders",
      });
    }

    // Admin must have Orders permission
    if (requester.role === "admin") {
      const allowedScreens = Array.isArray(requester.allowedScreens)
        ? requester.allowedScreens
        : [];

      if (
        requester.isApproved !== true ||
        !allowedScreens.includes("orders")
      ) {
        return res.status(403).json({
          message: "You do not have Orders permission",
        });
      }
    }

    if (!["customer", "admin", "superadmin"].includes(requester.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    const orders = await Order.find({ userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "Orders fetched successfully",
      orders,
    });

  } catch (error) {
    console.log("FETCH ORDERS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
});


// ADMIN: Get all customer orders
router.get(
  "/admin/all",
  authMiddleware,
  screenPermissionMiddleware("orders"),
  async (req, res) => {
    try {
      const orders = await Order.find()
        .sort({ createdAt: -1 });

      return res.status(200).json({
        message: "All orders fetched successfully",
        orders,
      });

    } catch (error) {
      console.log("ADMIN FETCH ORDERS ERROR:", error);

      return res.status(500).json({
        message: "Failed to fetch orders",
      });
    }
  }
);


// DELETE ORDER
router.delete(
  "/:orderId",
  authMiddleware,
  async (req, res) => {
    try {
      const { orderId } = req.params;

      // Validate order ID
      if (!mongoose.isValidObjectId(orderId)) {
        return res.status(400).json({
          message: "Invalid order ID",
        });
      }

      // Find logged-in user
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(401).json({
          message: "User not found",
        });
      }

      // Find order
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      // Only order owner or admin/superadmin can delete
      // Check whether the logged-in user owns this order
const isOrderOwner =
  order.userId.toString() === user._id.toString();

// Super Admin has full access
if (user.role === "superadmin") {
  // Allowed
}

// Admin needs Orders permission
else if (user.role === "admin") {
  const allowedScreens = Array.isArray(user.allowedScreens)
    ? user.allowedScreens
    : [];

  if (
    user.isApproved !== true ||
    !allowedScreens.includes("orders")
  ) {
    return res.status(403).json({
      message: "You do not have Orders permission",
    });
  }
}

// Customer can only delete their own order
else if (user.role === "customer") {
  if (!isOrderOwner) {
    return res.status(403).json({
      message: "You can only delete your own orders",
    });
  }
}

// Other roles are not allowed
else {
  return res.status(403).json({
    message: "Access denied",
  });
}

      // Delivered orders cannot be deleted
      if (order.orderStatus === "Delivered") {
        return res.status(400).json({
          message: "Delivered orders cannot be deleted",
        });
      }

      // Cancelled orders have already been processed
      // Restore stock only if this order was not cancelled
      if (order.orderStatus !== "Cancelled") {
        for (const item of order.items) {
          await Fruit.updateOne(
            { _id: item.productId },
            {
              $inc: {
                quantity: item.quantity,
              },
            }
          );
        }
      }

      // Delete order
      await Order.findByIdAndDelete(orderId);

      return res.status(200).json({
        message: "Order deleted successfully",
      });

    } catch (error) {
      console.log("DELETE ORDER ERROR:", error);

      return res.status(500).json({
        message: "Failed to delete order",
      });
    }
  }
);


export default router;