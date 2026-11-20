import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { firebaseAdminAuth } from "../config/firebaseAdmin.js";
import { Expo } from "expo-server-sdk";
import screenPermissionMiddleware from "../middleware/screenPermissionMiddleware.js";
import crypto from "crypto";

const router = express.Router();


const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "30d";

// Generate short-lived Access Token
function createAccessToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
}

// Generate long-lived Refresh Token
function createRefreshToken(user) {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error("REFRESH_TOKEN_SECRET is missing");
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

// Generate both tokens and save refresh token hash
async function createTokenPair(user) {
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  user.refreshTokenHash = refreshTokenHash;

  await user.save();

  return {
    token: accessToken,
    refreshToken,
  };
}


router.post("/register", async (req, res) => {
  try {
    const { name, email, password} = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!name?.trim() || !normalizedEmail || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role:"customer",
    });
    
     const tokens = await createTokenPair(user);
     
    return res.status(201).json({
      message: "Registration successful",
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered"
      });
    }

    return res.status(500).json({
      message: "Unable to register user"
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email: normalizedEmail
    }).select("+password");

    const passwordMatches =
      user && (await bcrypt.compare(password, user.password));

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }
  
    if (user.role !== "customer") {
  return res.status(403).json({
    message: "Customer account required",
  });
}
const tokens = await createTokenPair(user);
    return res.json({
      message: "Login successful",
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to login"
    });
  }
});




router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({
      email: normalizedEmail
    }).select("+password");

    const passwordMatches =
      user && (await bcrypt.compare(password, user.password));

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    
if (!["admin", "superadmin"].includes(user.role)) {
  return res.status(403).json({
    message: "Admin account required",
  });
}

const tokens = await createTokenPair(user);

    return res.json({
      message: "Login successful",
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to login"
    });
  }
});



// SUPER ADMIN: CREATE ADMIN ACCOUNT
router.post("/admin/create", authMiddleware, async (req, res) => {
  try {
    // 1. Check karo request bhejne wala Super Admin hai ya nahi
    const creator = await User.findById(req.userId).select("role");

    if (!creator || creator.role !== "superadmin") {
      return res.status(403).json({
        message: "Only Super Admin can create Admin accounts",
      });
    }

    // 2. Frontend se data lo
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 80) {
      return res.status(400).json({
        message: "Name must be between 2 and 80 characters",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    // 3. Check karo email pehle se registered toh nahi
    const existingUser = await User.findOne({
      email: cleanEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    // 4. Password hash karo
    const hashedPassword = await bcrypt.hash(password, 12);

    // 5. Admin account create karo
    const newAdmin = await User.create({
      name: cleanName,
      email: cleanEmail,
      password: hashedPassword,
      role: "admin",
      allowedScreens: [],
      isApproved: false,
    });

    // 6. Safe response bhejo
    return res.status(201).json({
      message: "Admin account created successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        allowedScreens: newAdmin.allowedScreens,
        isApproved: newAdmin.isApproved,
      },
    });
  } catch (error) {
    // Duplicate email ki race condition bhi handle karo
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    console.log("CREATE ADMIN ERROR:", error.message);

    return res.status(500).json({
      message: "Unable to create Admin account",
    });
  }
});


 // Google login for CandyApp customers
router.post("/google", async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        message: "Google ID token is required",
      });
    }

    // Verify Firebase ID token
    const decoded = await firebaseAdminAuth.verifyIdToken(idToken);

    // Only allow verified Google accounts
    if (
      decoded.firebase?.sign_in_provider !== "google.com" ||
      !decoded.email ||
      decoded.email_verified !== true
    ) {
      return res.status(401).json({
        message: "Please sign in with a verified Google account",
      });
    }

    const email = decoded.email.trim().toLowerCase();
    const firebaseUid = decoded.uid;

    console.log("GOOGLE EMAIL:", email);

    // Search by Firebase UID first, then by email
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      user = await User.findOne({ email });
    }

    console.log(
      "MATCHED DATABASE USER:",
      user
        ? {
            email: user.email,
            role: user.role,
            firebaseUid: user.firebaseUid,
          }
        : "No existing user found"
    );

    if (user) {
      // Keep admin and superadmin accounts protected
      if (user.role !== "customer") {
        return res.status(403).json({
          message: "Customer account required",
        });
      }

      // Do not link a different Google identity
      if (user.firebaseUid && user.firebaseUid !== firebaseUid) {
        return res.status(409).json({
          message: "This account is linked to another Google account",
        });
      }

      // Link Google identity to an existing customer
      if (!user.firebaseUid) {
        user.firebaseUid = firebaseUid;
        await user.save();
      }
    } else {
      // Create a new customer
      user = await User.create({
        name: decoded.name?.trim() || email.split("@")[0],
        email,
        firebaseUid,
        role: "customer",
      });
    }
      const tokens = await createTokenPair(user);

    // Return the backend JWT and customer details
    return res.json({
      message: "Google login successful",
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("GOOGLE LOGIN ERROR:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "This account already exists. Please try again.",
      });
    }

    return res.status(401).json({
      message: "Google login failed. Please try again.",
    });
  }
});


// Save current user's Expo Push Token
router.post("/notifications/token", authMiddleware, async (req, res) => {
  try {
    const { expoPushToken } = req.body;

    if (
      typeof expoPushToken !== "string" ||
      !Expo.isExpoPushToken(expoPushToken)
    ) {
      return res.status(400).json({
        message: "Valid Expo Push Token is required",
      });
    }

    console.log("TOKEN REGISTRATION USER ID:", req.userId);
console.log("EXPO TOKEN RECEIVED:", expoPushToken);

const user = await User.findByIdAndUpdate(
  req.userId,
  { expoPushToken },
  {
    new: true,
    runValidators: true,
  }
);

console.log("TOKEN SAVED FOR:", user?.email);
console.log("USER ROLE:", user?.role);
console.log("SAVED TOKEN:", !!user?.expoPushToken);


    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json({
      message: "Push token saved successfully",
    });
  } catch (error) {
    console.error("SAVE PUSH TOKEN ERROR:", error.message);

    return res.status(500).json({
      message: "Unable to save push token",
    });
  }
});


// Admin app ke liye customer users ki list
router.get(
  "/admin/users",
  authMiddleware,
  screenPermissionMiddleware("customers"),
  async (req, res) => {
  try {
    // Token se current admin ko database mein dhoondho
    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Sirf admin aur superadmin ko list dekhne dein
    if (!["admin", "superadmin"].includes(currentUser.role)) {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    // App ke customer accounts lo; password response mein nahi aayega
    const users = await User.find({ role: "customer" })
      .select("name email role")
      .sort({ _id: -1 });

    return res.json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to fetch users",
    });
  }
});



// Refresh Access Token
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token required",
      });
    }

    if (!process.env.REFRESH_TOKEN_SECRET) {
      console.error("REFRESH_TOKEN_SECRET is missing");

      return res.status(500).json({
        message: "Refresh token authentication is not configured",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decoded.userId) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    // Find user and include hidden refreshTokenHash field
    const user = await User.findById(decoded.userId)
      .select("+refreshTokenHash");

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        message: "Session expired. Please login again.",
      });
    }

    // Hash received refresh token
    const receivedHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // Compare saved hash with received hash
    const savedHashBuffer = Buffer.from(
      user.refreshTokenHash,
      "hex"
    );

    const receivedHashBuffer = Buffer.from(
      receivedHash,
      "hex"
    );

    if (
      savedHashBuffer.length !== receivedHashBuffer.length ||
      !crypto.timingSafeEqual(
        savedHashBuffer,
        receivedHashBuffer
      )
    ) {
      return res.status(401).json({
        message: "Invalid refresh token. Please login again.",
      });
    }

    // Generate new tokens and rotate refresh token
    const tokens = await createTokenPair(user);

    return res.json({
      message: "Token refreshed successfully",
      ...tokens,
    });

  } catch (error) {
    console.error(
      "REFRESH TOKEN ERROR:",
      error.name,
      error.message
    );

    return res.status(401).json({
      message: "Refresh token expired or invalid. Please login again.",
    });
  }
});


export default router;