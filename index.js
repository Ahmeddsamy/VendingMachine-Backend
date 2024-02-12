import "dotenv/config";
import express from "express";
import initConnection from "./DB/initConnection.js";
import userRoutes from "./src/modules/users/user.routes.js";
import productRoutes from "./src/modules/products/product.routes.js";
import cors from "cors";
import morgan from "morgan";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./src/services/logger.js";

const server = express();

// Logging HTTP Requests
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

server.use(cors());
server.use(express.json());
server.use(morgan("combined", { stream: accessLogStream })); // Logging HTTP Requests
initConnection();

server.use(userRoutes);
server.use(productRoutes);

// Global Error Handler
server.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).send("An error occurred");
});

// Start the server
server.listen(3000, () => {
  console.log("Server running on port 3000");
});
