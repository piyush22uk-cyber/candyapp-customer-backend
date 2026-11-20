import express from "express";
import Address from "../models/Address.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      userId,
      fullName,
      phone,
      house,
      area,
      city,
      state,
      pincode,
    } = req.body;

    const address = await Address.create({
      userId,
      fullName,
      phone,
      house,
      area,
      city,
      state,
      pincode,
    });

    res.status(201).json({
      message: "Address saved successfully",
      address,
    });
  } catch (error) {
    console.log("Address save error:", error);

    res.status(500).json({
      message: "Failed to save address",
    });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const address = await Address.findOne({
      userId: req.params.userId,
    });

    if (!address) {
      return res.status(200).json({
        address: null,
      });
    }

    res.status(200).json({
      address,
    });
  } catch (error) {
    console.log("Address fetch error:", error);

    res.status(500).json({
      message: "Failed to fetch address",
    });
  }
});

router.put("/:userId", async (req, res) => {
  try {
    const address = await Address.findOneAndUpdate(
      {
        userId: req.params.userId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    res.status(200).json({
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    console.log("Address update error:", error);

    res.status(500).json({
      message: "Failed to update address",
    });
  }
});


router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!address) {
      return res.status(404).json({
        message: "Address not found",
      });
    }

    return res.status(200).json({
      message: "Address deleted successfully",
    });

  } catch (error) {
    console.log("Delete address error:", error.message);

    return res.status(500).json({
      message: "Failed to delete address",
    });
  }
});


export default router;