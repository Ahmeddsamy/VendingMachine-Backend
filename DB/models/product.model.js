// Schema and Model

import mongoose from "mongoose";

// Define the schema for products
const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },
  cost: {
    type: Number,
    required: true,
    min: [5, "The minimum cost is 5 cents"], // Assuming the cost is in cents
  },
  amountAvailable: {
    type: Number,
    required: true,
    min: [0, "Amount available cannot be negative"],
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Create a model from the schema
const productModel = mongoose.model("Product", productSchema);

export default productModel;
