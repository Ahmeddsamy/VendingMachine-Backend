import express from "express";
import { auth } from "../../middleware/auth.js";
import {
  addProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "./controller/product.controller.js";
import { validation } from "../../middleware/validation.js";
import { addProductSchema, updateProductSchema } from "./product.validation.js";

const productRoutes = express.Router();

// Add a new product - Auth required, validation needed
productRoutes.post("/products", auth, validation(addProductSchema), addProduct);

// Update a product - Auth required, validation needed
productRoutes.patch(
  "/products/:id",
  auth,
  validation(updateProductSchema),
  updateProduct
);

// Delete a product - Auth required
productRoutes.delete("/products/:id", auth, deleteProduct);

// Get all products - No auth required
productRoutes.get("/products", getAllProducts);

// Get a single product - No auth required
productRoutes.get("/products/:id", getProductById);

export default productRoutes;
