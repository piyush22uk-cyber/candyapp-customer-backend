import express from "express";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import Fruit from "../models/Fruit.js";
import authMiddleware from "../middleware/authMiddleware.js";
import screenPermissionMiddleware from "../middleware/screenPermissionMiddleware.js";

const router = express.Router();

const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, safeFileName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
      return;
    }
    cb(new Error("Only image files are allowed"), false);
  },
});

// ===============================
// GET ALL FRUITS
// ===============================

router.get("/", async (req, res) => {
  try {
    const fruits = await Fruit.find();

    res.status(200).json({
      message: "Fruits fetched successfully",
      fruits,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch fruits",
      error: error.message,
    });
  }
});

// ===============================
// SEARCH FRUIT
// ===============================

router.get("/search", async (req, res) => {
  try {
    const { search } = req.query;

    if (!search) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    const fruits = await Fruit.find({
      name: {
        $regex: search,
        $options: "i",
      },
    });

    res.status(200).json({
      message: "Search successful",
      fruits,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to search fruits",
      error: error.message,
    });
  }
});

// ===============================
// GET SINGLE FRUIT
// ===============================

router.get("/:id", async (req, res) => {
  try {
    const fruit = await Fruit.findById(req.params.id);

    if (!fruit) {
      return res.status(404).json({
        message: "Fruit not found",
      });
    }

    res.status(200).json({
      message: "Fruit fetched successfully",
      fruit,
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch fruit",
      error: error.message,
    });
  }
});

// ===============================
// ADD FRUIT
// ===============================


router.post(
  "/",authMiddleware,screenPermissionMiddleware("products"),upload.single("image"),async (req, res) => {
  try {
    const { name, price, quantity, maxQuantity, category, weight } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;
      
    const priceNumber = Number(price);
    const quantityNumber = Number(quantity);
    const maxQuantityNumber = Number(maxQuantity);
   if (
      !name ||
      !price ||
      quantity === undefined ||
      maxQuantity === undefined ||
      !category ||
      !weight ||
      !image
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (
      Number.isNaN(priceNumber) ||
      Number.isNaN(quantityNumber) ||
      Number.isNaN(maxQuantityNumber)
    ) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        message: "Price, quantity and maxQuantity must be numbers",
      });
    }

    if (
      priceNumber < 0 ||
      quantityNumber < 0 ||
      maxQuantityNumber < 0
    ) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        message: "Price and stock values cannot be negative",
      });
    }


    if (quantityNumber > maxQuantityNumber) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        message:
          "Quantity cannot be greater than maximum stock limit",
      });
    }

    const fruit = await Fruit.create({
      name,
      price: priceNumber,
      quantity: quantityNumber,
      maxQuantity: maxQuantityNumber,
      category,
      weight,
      image,
    });

    res.status(201).json({
      message: "Fruit added successfully",
      fruit,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Unable to add fruit",
      error: error.message,
    // res.status(500).json({
    //   message: "Unable to add fruit",
    //   error: error.message,
    });
  }
});

// ===============================
// UPDATE FRUIT
// ===============================

router.put("/:id",authMiddleware,screenPermissionMiddleware("products"),upload.single("image"),async (req, res) => {
  try {
    const { name, price, quantity, category, weight } = req.body;

    // 1. Same ID wala fruit find karo
    const existingFruit = await Fruit.findById(req.params.id);

    if (!existingFruit) {
      // Fruit nahi mila, new uploaded image delete
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(404).json({
        message: "Fruit not found",
      });
    }

    // 2. Purani image save karo
    const oldImage = existingFruit.image;

    // 3. Update data
    const updateData = {
      name: name ?? existingFruit.name,
      price: price !== undefined ? Number(price) : existingFruit.price,
      quantity:
        quantity !== undefined
          ? Number(quantity)
          : existingFruit.quantity,
      category: category ?? existingFruit.category,
      weight: weight ?? existingFruit.weight,
    };

    // 4. Agar new image upload hui hai
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    } else {
      // New image nahi hai to old image same rahegi
      updateData.image = oldImage;
    }

    // 5. SAME ID par update
    const fruit = await Fruit.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    // 6. Database update successful hone ke BAAD old image delete
    if (req.file && oldImage) {
      const oldImagePath = path.join(
        process.cwd(),
        oldImage.replace(/^\/uploads[\\/]/, "")
      );

      if (
        fs.existsSync(oldImagePath) &&
        oldImagePath !== req.file.path
      ) {
        fs.unlinkSync(oldImagePath);
      }
    }

    res.status(200).json({
      message: req.file
        ? "Fruit and image updated successfully"
        : "Fruit updated successfully",
      fruit,
    });

  } catch (error) {

    // Database update fail hua to newly uploaded image delete
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Unable to update fruit",
      error: error.message,
    });
  }
});
//  router.put("/:id", upload.single("image"), async(req,res) =>{
//   try{
//     const{name, price, quantity, category, weight } =req.body;
//     const existingFruit = await Fruit.findById(req.params.id);
     
//     if(!existingFruit){
//       if(req.file){
//         fs.unlinkSync(req.file.path);
//         return res.status(404).json({
//           message:"Fruit can not found",
//         });
//       }

//     }
//   }
//  })
// router.put("/:id", upload.single("image"), async (req, res) => {
//   try {
//     const { name, price, quantity, category, weight } = req.body;
//     const image = req.file ? `/uploads/${req.file.filename}` : req.body.image;

//     const updateData = {
//       name,
//       price: price !== undefined ? Number(price) : price,
//       quantity: quantity !== undefined ? Number(quantity) : quantity,
//       category,
//       weight,
//       ...(image ? { image } : {}),
//     };

//     const fruit = await Fruit.findByIdAndUpdate(req.params.id, updateData, {
//       new: true,
//       runValidators: true,
//     });

//     if (!fruit) {
//       return res.status(404).json({
//         message: "Fruit not found",
//       });
//     }

//     res.status(200).json({
//       message: "Fruit updated successfully",
//       fruit,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Unable to update fruit",
//       error: error.message,
//     });
//   }
// });

// ===============================
// DELETE FRUIT
// ===============================

router.delete("/:id",authMiddleware,screenPermissionMiddleware("products"),async (req, res) => {
  try {
    const fruit = await Fruit.findByIdAndDelete(req.params.id);

    if (!fruit) {
      return res.status(404).json({
        message: "Fruit not found",
      });
    }

    res.status(200).json({
      message: "Fruit deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to delete fruit",
      error: error.message,
    });
  }
});

export default router;