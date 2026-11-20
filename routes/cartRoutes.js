
// // import express from "express";
// // import Cart from "../models/Cart.js";
// // import Fruit from "../models/Fruit.js";

// // const router = express.Router();

// // // CHECK AVAILABLE STOCK
// // const checkStock = (product, requestedQuantity) => {
// //   const stock = Number(product.quantity);

// //   if (
// //     !Number.isInteger(stock) ||
// //     stock < 0 ||
// //     !Number.isInteger(Number(requestedQuantity)) ||
// //     Number(requestedQuantity) < 1
// //   ) {
// //     return false;
// //   }

// //   return Number(requestedQuantity) <= stock;
// // };

// // // GET USER CART
// // router.get("/:userId", async (req, res) => {
// //   try {
// //     const cart = await Cart.findOne({
// //       userId: req.params.userId,
// //     });

// //     if (!cart) {
// //       return res.status(200).json({
// //         items: [],
// //       });
// //     }

// //     res.status(200).json(cart);

// //   } catch (error) {
// //     console.log("GET CART ERROR:", error.message);

// //     res.status(500).json({
// //       message: "Unable to fetch cart",
// //     });
// //   }
// // });


// // // ADD PRODUCT TO CART
// // router.post("/", async (req, res) => {
// //   try {
// //     const { userId, productId } = req.body;

// //     // Check required data.
// //     if (!userId || !productId) {
// //       return res.status(400).json({
// //         message: "User ID and product ID are required",
// //       });
// //     }

// //     // Find the actual product.
// //     const product = await Fruit.findById(productId);

// //     if (!product) {
// //       return res.status(404).json({
// //         message: "Product not found",
// //       });
// //     }

// //     // Get available stock from the database.
// //     const stock = Number(product.quantity);

// //     if (!Number.isFinite(stock) || stock <= 0) {
// //       return res.status(400).json({
// //         message: "Product is out of stock",
// //       });
// //     }

// //     if (existingItem) {
// //   const newQuantity = Number(existingItem.quantity) + 1;

// //   if (!checkStock(product, newQuantity)) {
// //     return res.status(400).json({
// //       message: "Maximum available stock reached",
// //     });
// //   }

// //   existingItem.quantity = newQuantity;
// //   existingItem.availableQuantity = stock;
// //   existingItem.price = Number(product.price);

// //   existingItem.totalPrice =
// //     Number(product.price) * newQuantity;
// // }

// //     // Find the user's cart.
// //     let cart = await Cart.findOne({ userId });

// //     // Create a new cart if it does not exist.
// //     if (!cart) {
// //       cart = await Cart.create({
// //         userId,
// //         items: [
// //           {
// //             productId: product._id,
// //             name: product.name,
// //             category: product.category,
// //             price: Number(product.price),
// //             weight: product.weight,
// //             image: product.image,
// //             quantity: 1,
// //             availableQuantity: stock,
// //             totalPrice: Number(product.price),
// //           },
// //         ],
// //       });
// //     } else {

// //       // Check whether the product already exists in the cart.
// //       const existingItem = cart.items.find(
// //         item =>
// //           item.productId.toString() === productId.toString()
// //       );

// //       if (existingItem) {

// //         // Increase the product quantity by one.
// //         const newQuantity = Number(existingItem.quantity) + 1;

// //         if (newQuantity > stock) {
// //           return res.status(400).json({
// //             message: "Stock limit reached",
// //           });
// //         }

// //         existingItem.quantity = newQuantity;
// //         existingItem.availableQuantity = stock;
// //         existingItem.price = Number(product.price);

// //         existingItem.totalPrice =
// //           Number(product.price) * newQuantity;

// //       } else {

// //         // Add a new product to the existing cart.
// //         cart.items.push({
// //           productId: product._id,
// //           name: product.name,
// //           category: product.category,
// //           price: Number(product.price),
// //           weight: product.weight,
// //           image: product.image,
// //           quantity: 1,
// //           availableQuantity: stock,
// //           totalPrice: Number(product.price),
// //         });
// //       }

// //       await cart.save();
// //     }

// //     res.status(200).json({
// //       message: "Product added to cart",
// //       cart,
// //     });

// //   } catch (error) {
// //     console.log("ADD CART ERROR:", error.message);

// //     res.status(500).json({
// //       message: "Unable to add product to cart",
// //     });
// //   }
// // });


// // // UPDATE CART QUANTITY
// // router.put("/:userId/:productId", async (req, res) => {
// //   try {
// //     const { userId, productId } = req.params;
// //     const { quantity } = req.body;

// //     // Find the product.
// //     const product = await Fruit.findById(productId);

// //     if (!product) {
// //       return res.status(404).json({
// //         message: "Product not found",
// //       });
// //     }

// //     // Get current available stock.
// //     const stock = Number(product.quantity);

// //     if (!Number.isFinite(stock) || stock < 0) {
// //       return res.status(400).json({
// //         message: "Invalid product stock",
// //       });
// //     }

// //     // Find the user's cart.
// //     const cart = await Cart.findOne({ userId });

// //     if (!cart) {
// //       return res.status(404).json({
// //         message: "Cart not found",
// //       });
// //     }

// //     // Find the product inside the cart.
// //     const item = cart.items.find(
// //       item =>
// //         item.productId.toString() === productId.toString()
// //     );

// //     if (!item) {
// //       return res.status(404).json({
// //         message: "Product not found in cart",
// //       });
// //     }

// //     // Check the requested quantity.
// //     const requestedQuantity = Number(quantity);

// // if (!checkStock(product, requestedQuantity)) {
// //   return res.status(400).json({
// //     message: "Requested quantity exceeds available stock",
// //   });
// // }
// //     // Do not allow quantity to increase beyond available stock.

    
// //     // Update cart item details.
// //     item.quantity = requestedQuantity;
// //     item.availableQuantity = stock;
// //     item.price = Number(product.price);

// //     item.totalPrice =
// //       Number(product.price) * requestedQuantity;

// //     // Save the updated cart.
// //     await cart.save();

// //     res.status(200).json({
// //       message: "Cart quantity updated",
// //       cart,
// //     });

// //   } catch (error) {
// //     console.log("UPDATE CART ERROR:", error.message);

// //     res.status(500).json({
// //       message: "Unable to update cart",
// //     });
// //   }
// // });


// // // REMOVE ONE PRODUCT FROM CART
// // router.delete("/:userId/:productId", async (req, res) => {
// //   try {
// //     const { userId, productId } = req.params;

// //     const cart = await Cart.findOne({ userId });

// //     if (!cart) {
// //       return res.status(404).json({
// //         message: "Cart not found",
// //       });
// //     }

// //     const itemIndex = cart.items.findIndex(
// //       item =>
// //         item.productId.toString() === productId.toString()
// //     );

// //     if (itemIndex === -1) {
// //       return res.status(404).json({
// //         message: "Product not found in cart",
// //       });
// //     }

// //     // Remove the selected product.
// //     cart.items.splice(itemIndex, 1);

// //     await cart.save();

// //     res.status(200).json({
// //       message: "Product removed from cart",
// //       cart,
// //     });

// //   } catch (error) {
// //     console.log("DELETE CART ERROR:", error.message);

// //     res.status(500).json({
// //       message: "Unable to remove product",
// //     });
// //   }
// // });


// // // CLEAR COMPLETE USER CART
// // router.delete("/:userId", async (req, res) => {
// //   try {
// //     const { userId } = req.params;

// //     const cart = await Cart.findOne({ userId });

// //     if (!cart) {
// //       return res.status(200).json({
// //         message: "Cart is already empty",
// //         items: [],
// //       });
// //     }

// //     // Remove all cart items.
// //     cart.items = [];

// //     await cart.save();

// //     res.status(200).json({
// //       message: "Cart cleared successfully",
// //       items: [],
// //     });

// //   } catch (error) {
// //     console.log("CLEAR CART ERROR:", error.message);

// //     res.status(500).json({
// //       message: "Unable to clear cart",
// //     });
// //   }
// // });


// // export default router;



// import express from "express";
// import Cart from "../models/Cart.js";
// import Fruit from "../models/Fruit.js";

// const router = express.Router();

// // CHECK AVAILABLE STOCK
// const checkStock = (product, requestedQuantity) => {
//   const stock = Number(product.quantity);
//   const quantity = Number(requestedQuantity);

//   if (
//     !Number.isInteger(stock) ||
//     stock < 0 ||
//     !Number.isInteger(quantity) ||
//     quantity < 1
//   ) {
//     return false;
//   }

//   return quantity <= stock;
// };


// // GET USER CART
// router.get("/:userId", async (req, res) => {
//   try {
//     const cart = await Cart.findOne({
//       userId: req.params.userId,
//     });

//     if (!cart) {
//       return res.status(200).json({
//         items: [],
//       });
//     }

//     res.status(200).json(cart);

//   } catch (error) {
//     console.log("GET CART ERROR:", error.message);

//     res.status(500).json({
//       message: "Unable to fetch cart",
//     });
//   }
// });


// // ADD PRODUCT TO CART
// router.post("/", async (req, res) => {
//   try {
//     const { userId, productId } = req.body;

//     if (!userId || !productId) {
//       return res.status(400).json({
//         message: "User ID and product ID are required",
//       });
//     }

//     // Find product from database
//     const product = await Fruit.findById(productId);

//     if (!product) {
//       return res.status(404).json({
//         message: "Product not found",
//       });
//     }

//     const stock = Number(product.quantity);

//     if (!checkStock(product, 1)) {
//       return res.status(400).json({
//         message: "Product is out of stock",
//       });
//     }

//     // Find user's cart
//     let cart = await Cart.findOne({ userId });

//     // Create new cart
//     if (!cart) {
//       cart = await Cart.create({
//         userId,
//         items: [
//           {
//             productId: product._id,
//             name: product.name,
//             category: product.category,
//             price: Number(product.price),
//             weight: product.weight,
//             image: product.image,
//             quantity: 1,
//             availableQuantity: stock,
//             totalPrice: Number(product.price),
//           },
//         ],
//       });

//     } else {

//       // Find existing product
//       const existingItem = cart.items.find(
//         item =>
//           item.productId.toString() === productId.toString()
//       );

//       if (existingItem) {

//         // Increase quantity
//         const newQuantity = Number(existingItem.quantity) + 1;

//         if (!checkStock(product, newQuantity)) {
//           return res.status(400).json({
//             message: "Maximum available stock reached",
//           });
//         }

//         existingItem.quantity = newQuantity;
//         existingItem.availableQuantity = stock;
//         existingItem.price = Number(product.price);

//         existingItem.totalPrice =
//           Number(product.price) * newQuantity;

//       } else {

//         // Add new product
//         cart.items.push({
//           productId: product._id,
//           name: product.name,
//           category: product.category,
//           price: Number(product.price),
//           weight: product.weight,
//           image: product.image,
//           quantity: 1,
//           availableQuantity: stock,
//           totalPrice: Number(product.price),
//         });
//       }

//       await cart.save();
//     }

//     res.status(200).json({
//       message: "Product added to cart",
//       cart,
//     });

//   } catch (error) {
//     console.log("ADD CART ERROR:", error.message);

//     res.status(500).json({
//       message: "Unable to add product to cart",
//     });
//   }
// });


// // UPDATE CART QUANTITY
// router.put("/:userId/:productId", async (req, res) => {
//   try {
//     const { userId, productId } = req.params;
//     const { quantity } = req.body;

//     // Find product
//     const product = await Fruit.findById(productId);

//     if (!product) {
//       return res.status(404).json({
//         message: "Product not found",
//       });
//     }

//     const stock = Number(product.quantity);

//     // Find user's cart
//     const cart = await Cart.findOne({ userId });

//     if (!cart) {
//       return res.status(404).json({
//         message: "Cart not found",
//       });
//     }

//     // Find product inside cart
//     const item = cart.items.find(
//       item =>
//         item.productId.toString() === productId.toString()
//     );

//     if (!item) {
//       return res.status(404).json({
//         message: "Product not found in cart",
//       });
//     }

//     // Validate requested quantity
//     const requestedQuantity = Number(quantity);

//     if (!checkStock(product, requestedQuantity)) {
//       return res.status(400).json({
//         message: "Requested quantity exceeds available stock",
//       });
//     }

//     // Update cart item
//     item.quantity = requestedQuantity;
//     item.availableQuantity = stock;
//     item.price = Number(product.price);

//     item.totalPrice =
//       Number(product.price) * requestedQuantity;

//     await cart.save();

//     res.status(200).json({
//       message: "Cart quantity updated",
//       cart,
//     });

//   } catch (error) {
//     console.log("UPDATE CART ERROR:", error.message);

//     res.status(500).json({
//       message: "Unable to update cart",
//     });
//   }
// });


// // REMOVE ONE PRODUCT FROM CART
// router.delete("/:userId/:productId", async (req, res) => {
//   try {
//     const { userId, productId } = req.params;

//     const cart = await Cart.findOne({ userId });

//     if (!cart) {
//       return res.status(404).json({
//         message: "Cart not found",
//       });
//     }

//     const itemIndex = cart.items.findIndex(
//       item =>
//         item.productId.toString() === productId.toString()
//     );

//     if (itemIndex === -1) {
//       return res.status(404).json({
//         message: "Product not found in cart",
//       });
//     }

//     cart.items.splice(itemIndex, 1);

//     await cart.save();

//     res.status(200).json({
//       message: "Product removed from cart",
//       cart,
//     });

//   } catch (error) {
//     console.log("DELETE CART ERROR:", error.message);

//     res.status(500).json({
//       message: "Unable to remove product",
//     });
//   }
// });


// // CLEAR COMPLETE USER CART
// router.delete("/:userId", async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const cart = await Cart.findOne({ userId });

//     if (!cart) {
//       return res.status(200).json({
//         message: "Cart is already empty",
//         items: [],
//       });
//     }

//     cart.items = [];

//     await cart.save();

//     res.status(200).json({
//       message: "Cart cleared successfully",
//       items: [],
//     });

//   } catch (error) {
//     console.log("CLEAR CART ERROR:", error.message);

//     res.status(500).json({
//       message: "Unable to clear cart",
//     });
//   }
// });


// export default router;







import express from "express";
import mongoose from "mongoose";

import Cart from "../models/Cart.js";
import Fruit from "../models/Fruit.js";

const router = express.Router();

// Validate MongoDB ID
const isValidId = (id) => {
  return mongoose.isValidObjectId(id);
};

// Check available stock

// CHECK PRODUCT QUANTITY LIMIT
const checkStock = (product, requestedQuantity) => {
  const stock = Number(product.quantity);
  const maxQuantity = Number(product.maxQuantity);
  const quantity = Number(requestedQuantity);

  if (
    !Number.isInteger(stock) ||
    stock < 0 ||
    !Number.isInteger(maxQuantity) ||
    maxQuantity < 1 ||
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    return false;
  }

  // Find the actual customer purchase limit
  const allowedQuantity = Math.min(
    stock,
    maxQuantity
  );

  return quantity <= allowedQuantity;
};


// Check product price
const getValidPrice = (product) => {
  const price = Number(product.price);

  if (!Number.isFinite(price) || price < 0) {
    return null;
  }

  return price;
};

// GET USER CART
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(200).json({
        items: [],
      });
    }

    // Refresh available stock from database
    const updatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Fruit.findById(item.productId);

        if (!product) {
          return {
            ...item.toObject(),
            availableQuantity: 0,
          };
        }

        const stock = Number(product.quantity) || 0;

        const maxQuantity = Number(product.maxQuantity) || 0;

        const allowedQuantity = Math.min(
        stock,
        maxQuantity
);

        return {
        ...item.toObject(),

        availableQuantity: stock,

        maxQuantity: maxQuantity,

        allowedQuantity: allowedQuantity,
};
      })
    );

    const cartData = cart.toObject();
    cartData.items = updatedItems;

    return res.status(200).json(cartData);

  } catch (error) {
    console.log("GET CART ERROR:", error.message);

    return res.status(500).json({
      message: "Unable to fetch cart",
    });
  }
});


// ADD PRODUCT TO CART
router.post("/", async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({
        message: "User ID and product ID are required",
      });
    }

    if (!isValidId(userId) || !isValidId(productId)) {
      return res.status(400).json({
        message: "Invalid user ID or product ID",
      });
    }

    // Find product
    const product = await Fruit.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const stock = Number(product.quantity);
    const price = getValidPrice(product);

    // No stock available
    if (!checkStock(product, 1)) {
      return res.status(400).json({
        message: "Product is out of stock",
        availableQuantity: 0,
      });
    }

    if (price === null) {
      return res.status(400).json({
        message: "Invalid product price",
      });
    }

    // Find user's cart
    let cart = await Cart.findOne({ userId });

    // Create new cart
    if (!cart) {
      cart = await Cart.create({
        userId,
        items: [
          {
            productId: product._id,
            name: product.name,
            category: product.category,
            price,
            weight: product.weight,
            image: product.image,
            quantity: 1,
            availableQuantity: stock,
            totalPrice: price,
          },
        ],
      });

    } else {

      // Check existing product
      const existingItem = cart.items.find(
        (item) =>
          item.productId.toString() === productId.toString()
      );

      if (existingItem) {

        const newQuantity =
          Number(existingItem.quantity) + 1;

        // Check latest stock
        if (!checkStock(product, newQuantity)) {
          return res.status(400).json({
            message: "Maximum available stock reached",
            availableQuantity: stock,
            currentCartQuantity: existingItem.quantity,
          });
        }

        existingItem.quantity = newQuantity;
        existingItem.availableQuantity = stock;
        existingItem.price = price;
        existingItem.totalPrice = price * newQuantity;

      } else {

        // Add new product
        cart.items.push({
          productId: product._id,
          name: product.name,
          category: product.category,
          price,
          weight: product.weight,
          image: product.image,
          quantity: 1,
          availableQuantity: stock,
          totalPrice: price,
        });
      }

      await cart.save();
    }

    return res.status(200).json({
      message: "Product added to cart",
      cart,
    });

  } catch (error) {
    console.log("ADD CART ERROR:", error.message);

    return res.status(500).json({
      message: "Unable to add product to cart",
    });
  }
});


// UPDATE CART QUANTITY
router.put("/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const { quantity } = req.body;

    if (!isValidId(userId) || !isValidId(productId)) {
      return res.status(400).json({
        message: "Invalid user ID or product ID",
      });
    }

    // Validate quantity
    const requestedQuantity = Number(quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    // Find latest product
    const product = await Fruit.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const stock = Number(product.quantity);
    const price = getValidPrice(product);

    // Check current available stock
    if (!checkStock(product, requestedQuantity)) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
        availableQuantity: stock,
      });
    }

    if (price === null) {
      return res.status(400).json({
        message: "Invalid product price",
      });
    }

    // Find user's cart
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    // Find product inside cart
    const item = cart.items.find(
      (item) =>
        item.productId.toString() === productId.toString()
    );

    if (!item) {
      return res.status(404).json({
        message: "Product not found in cart",
      });
    }

    // Update item
    item.quantity = requestedQuantity;
    item.availableQuantity = stock;
    item.price = price;
    item.totalPrice = price * requestedQuantity;

    await cart.save();

    return res.status(200).json({
      message: "Cart quantity updated",
      cart,
    });

  } catch (error) {
    console.log("UPDATE CART ERROR:", error.message);

    return res.status(500).json({
      message: "Unable to update cart",
    });
  }
});


// REMOVE ONE PRODUCT FROM CART
router.delete("/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (!isValidId(userId) || !isValidId(productId)) {
      return res.status(400).json({
        message: "Invalid user ID or product ID",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId.toString()
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Product not found in cart",
      });
    }

    cart.items.splice(itemIndex, 1);

    await cart.save();

    return res.status(200).json({
      message: "Product removed from cart",
      cart,
    });

  } catch (error) {
    console.log("DELETE CART ERROR:", error.message);

    return res.status(500).json({
      message: "Unable to remove product",
    });
  }
});


// CLEAR COMPLETE USER CART
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return res.status(400).json({
        message: "Invalid user ID",
      });
    }

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(200).json({
        message: "Cart is already empty",
        items: [],
      });
    }

    cart.items = [];

    await cart.save();

    return res.status(200).json({
      message: "Cart cleared successfully",
      items: [],
    });

  } catch (error) {
    console.log("CLEAR CART ERROR:", error.message);

    return res.status(500).json({
      message: "Unable to clear cart",
    });
  }
});

export default router;

