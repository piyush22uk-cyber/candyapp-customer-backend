
// // import dotenv from "dotenv";
// // import mongoose from "mongoose";
// // import readline from "node:readline";

// // import connectDB from "../config/db.js";
// // import User from "../models/User.js";

// // dotenv.config();

// // const rl = readline.createInterface({
// //   input: process.stdin,
// //   output: process.stdout,
// // });

// // function ask(question) {
// //   return new Promise((resolve) => {
// //     rl.question(question, resolve);
// //   });
// // }

// // async function main() {
// //   try {
// //     if (!process.env.MONGODB_URI) {
// //       throw new Error("MONGODB_URI is missing from .env");
// //     }

// //     await connectDB();

// //     const email = (
// //       await ask("Enter the existing admin account email: ")
// //     ).trim().toLowerCase();

// //     const confirm = (
// //       await ask("Type PROMOTE to confirm Super Admin setup: ")
// //     ).trim();

// //     if (confirm !== "PROMOTE") {
// //       console.log("Cancelled. No changes made.");
// //       return;
// //     }

// //     const user = await User.findOne({ email });

// //     if (!user) {
// //       throw new Error("Account not found. No changes made.");
// //     }

// //     if (user.role !== "admin" && user.role !== "superadmin") {
// //       throw new Error(
// //         "This account is not an admin. No changes made."
// //       );
// //     }

// //     const existingSuperAdmin = await User.exists({
// //       role: "superadmin",
// //       _id: { $ne: user._id },
// //     });

// //     if (existingSuperAdmin) {
// //       throw new Error(
// //         "Another Super Admin already exists. No changes made."
// //       );
// //     }

// //     user.role = "superadmin";
// //     await user.save();

// //     console.log("Existing account promoted to Super Admin.");
// //     console.log("The account password was not changed.");
// //   } finally {
// //     rl.close();
// //     await mongoose.disconnect();
// //   }
// // }

// // main().catch((error) => {
// //   console.error("Setup failed:", error.message);
// //   process.exitCode = 1;
// // });



// import dotenv from "dotenv";
// import mongoose from "mongoose";
// import readline from "node:readline";
// import bcrypt from "bcryptjs";

// import connectDB from "../config/db.js";
// import User from "../models/User.js";

// dotenv.config();

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// function ask(question) {
//   return new Promise((resolve) => {
//     rl.question(question, resolve);
//   });
// }

// async function main() {
//   try {
//     if (!process.env.MONGODB_URI) {
//       throw new Error("MONGODB_URI is missing from .env");
//     }

//     if (!process.env.JWT_SECRET) {
//       throw new Error("JWT_SECRET is missing from .env");
//     }

//     await connectDB();

//     console.log("\n=== CandyApp Developer Setup ===");
//     console.log("1. Promote existing admin to Super Admin");
//     console.log("2. Reset existing Super Admin password");

//     const choice = (await ask("Choose 1 or 2: ")).trim();

//     const email = (
//       await ask("Enter account email: ")
//     ).trim().toLowerCase();

//     const user = await User.findOne({ email });

//     if (!user) {
//       throw new Error("Account not found.");
//     }

//     if (choice === "1") {
//       if (user.role === "superadmin") {
//         console.log("This account is already Super Admin.");
//         return;
//       }

//       if (user.role !== "admin") {
//         throw new Error(
//           "Only an existing admin can be promoted."
//         );
//       }

//       const existingSuperAdmin = await User.exists({
//         role: "superadmin",
//       });

//       if (existingSuperAdmin) {
//         throw new Error(
//           "A Super Admin already exists. Promotion cancelled."
//         );
//       }

//       const confirm = (
//         await ask("Type PROMOTE to confirm: ")
//       ).trim();

//       if (confirm !== "PROMOTE") {
//         console.log("Cancelled. No changes made.");
//         return;
//       }

//       user.role = "superadmin";
//       await user.save();

//       console.log("Super Admin setup successful.");
//     } else if (choice === "2") {
//       if (user.role !== "superadmin") {
//         throw new Error(
//           "Password reset is allowed only for the Super Admin account."
//         );
//       }

//       const password = await ask("Enter new password: ");

//       if (password.length < 8) {
//         throw new Error(
//           "Password must contain at least 8 characters."
//         );
//       }

//       const confirmPassword = await ask(
//         "Confirm new password: "
//       );

//       if (password !== confirmPassword) {
//         throw new Error("Passwords do not match.");
//       }

//       const confirm = (
//         await ask("Type RESET to confirm: ")
//       ).trim();

//       if (confirm !== "RESET") {
//         console.log("Cancelled. No changes made.");
//         return;
//       }

//       user.password = await bcrypt.hash(password, 12);
//       await user.save();

//       console.log("Super Admin password updated.");
//     } else {
//       console.log("Invalid choice. No changes made.");
//     }
//   } catch (error) {
//     console.error("Setup failed:", error.message);
//     process.exitCode = 1;
//   } finally {
//     rl.close();
//     await mongoose.disconnect();
//   }
// }

// main();




import dotenv from "dotenv";
import mongoose from "mongoose";
import readline from "node:readline";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  try {
    const developerEmail = process.env.SUPERADMIN_EMAIL
      ?.trim()
      .toLowerCase();

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from .env");
    }

    if (!developerEmail) {
      throw new Error("SUPERADMIN_EMAIL is missing from .env");
    }

    await connectDB();

    console.log("\n=== CandyApp Developer Setup ===");
    console.log("1. Create the first Super Admin");
    console.log("2. Reset Super Admin password");

    const choice = (await ask("Choose 1 or 2: ")).trim();

    const email = (await ask("Enter developer email: "))
      .trim()
      .toLowerCase();

    if (email !== developerEmail) {
      throw new Error("Developer email does not match.");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new Error("Developer account not found.");
    }

    if (choice === "1") {
      const existingSuperAdmin = await User.exists({
        role: "superadmin",
      });

      if (existingSuperAdmin) {
        throw new Error(
          "A Super Admin already exists. Creation blocked."
        );
      }

      if (user.role !== "admin") {
        throw new Error(
          "Developer account must already have admin role."
        );
      }

      const confirm = (
        await ask("Type CREATE-SUPERADMIN to confirm: ")
      ).trim();

      if (confirm !== "CREATE-SUPERADMIN") {
        console.log("Cancelled. No changes made.");
        return;
      }

      user.role = "superadmin";
      await user.save();

      console.log("First Super Admin created successfully.");
    } else if (choice === "2") {
      if (user.role !== "superadmin") {
        throw new Error(
          "The developer account is not Super Admin."
        );
      }

      const password = await ask("Enter new password: ");

      if (password.length < 8) {
        throw new Error(
          "Password must contain at least 8 characters."
        );
      }

      const confirmPassword = await ask(
        "Confirm new password: "
      );

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const confirm = (
        await ask("Type RESET to confirm: ")
      ).trim();

      if (confirm !== "RESET") {
        console.log("Cancelled. No changes made.");
        return;
      }

      user.password = await bcrypt.hash(password, 12);
      await user.save();

      console.log("Super Admin password reset successfully.");
    } else {
      console.log("Invalid choice. No changes made.");
    }
  } catch (error) {
    console.error("Setup failed:", error.message);
    process.exitCode = 1;
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

main();
