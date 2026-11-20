
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Fruit",
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  category: {
    type: String,
  },

  price: {
    type: Number,
    required: true,
  },

  weight: {
    type: String,
  },

  image: {
    type: String,
  },

  quantity: {
    type: Number,
    required: true,
    min: 1,
  },

  availableQuantity: {
    type: Number,
    default: 0,
  },

  maxQuantity: {
    type: Number,
    default: 1,
  },

  totalPrice: {
    type: Number,
    required: true,
  },
});

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Cart", cartSchema);
