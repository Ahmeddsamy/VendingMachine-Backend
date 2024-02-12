import productModel from "../../../../DB/models/product.model.js";
import userModel from "../../../../DB/models/user.model.js";
import logger from "../../../services/logger.js";

// Add Product
export const addProduct = async (req, res) => {
  try {
    const user = await userModel.findById(req.userID);
    if (!user || user.role !== "seller") {
      logger.warn(`Non-seller user ${req.userID} tried to add a product`);
      return res.status(403).json({ error: "Only sellers can add products" });
    }

    const newProduct = new productModel({
      ...req.body,
      sellerId: req.userID,
    });
    await newProduct.save();
    logger.info(
      `Product added successfully by user ${req.userID}: ${newProduct._id}`
    );
    return res
      .status(201)
      .json({ message: "Product Added Successfully", newProduct });
  } catch (error) {
    console.error(error);
    logger.error(`Error in addProduct by user ${req.userID}: ${error.message}`);
    return res.status(500).json({ error: "Failed to add a new product" });
  }
};
// Update Product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userID;

    const user = await userModel.findById(userId);
    const product = await productModel.findById(id);

    if (
      !(
        user &&
        (user.role === "seller" || product.sellerId.toString() === userId)
      )
    ) {
      logger.warn(`User ${userId} unauthorized to update product ${id}`);
      return res.status(403).json({ error: "Permission denied" });
    }
    // Prepare the update object
    let updateData = req.body;

    const updatedProduct = await productModel.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
      }
    );
    if (!updatedProduct) {
      logger.warn(`Product ${id} not found for update`);
      return res.status(404).json({ error: "Product not found" });
    }
    logger.info(`Product ${id} updated successfully by user ${userId}`);
    return res.json({ message: "Product Update Successfully", updatedProduct });
  } catch (error) {
    console.error(error);
    logger.error(
      `Error in updateProduct for product ${req.params.id} by user ${req.userID}: ${error.message}`
    );
    return res.status(500).json({ error: "Failed to update the product" });
  }
};
// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userID;

    const user = await userModel.findById(userId);
    const product = await productModel.findById(id);

    if (
      !(
        user &&
        (user.role === "seller" || product.sellerId.toString() === userId)
      )
    ) {
      logger.warn(`User ${userId} unauthorized to delete product ${id}`);
      return res.status(403).json({ error: "Permission denied" });
    }

    const deletedProduct = await productModel.findByIdAndDelete(id);
    if (!deletedProduct) {
      logger.warn(`Product ${id} not found for deletion`);
      return res.status(404).json({ error: "Product not found" });
    }
    logger.info(`Product ${id} deleted successfully by user ${userId}`);
    return res.json({
      message: "Product deleted successfully",
      deletedProduct,
    });
  } catch (error) {
    logger.error(
      `Error in deleteProduct for product ${req.params.id} by user ${req.userID}: ${error.message}`
    );
    return res.status(500).json({ error: "Failed to delete the product" });
  }
};
// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    logger.info("All products fetched");
    res.json(products);
  } catch (error) {
    logger.error(`Error in getAllProducts: ${error.message}`);
    console.error(error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};
// Get Product By ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productModel.findById(id);

    if (!product) {
      logger.warn(`Product ${id} not found`);
      return res.status(404).json({ error: "Product not found" });
    }
    logger.info(`Product ${id} fetched`);
    res.json(product);
  } catch (error) {
    logger.error(
      `Error in getProductById for product ${req.params.id}: ${error.message}`
    );
    console.error(error);
    res.status(500).json({ error: "Failed to fetch the product" });
  }
};
