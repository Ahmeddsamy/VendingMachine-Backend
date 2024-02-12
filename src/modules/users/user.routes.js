import express from "express";
import { validation } from "../../middleware/validation.js";
import { auth } from "../../middleware/auth.js";
import {
  changePasswordSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  updateUserSchema,
} from "./user.validation.js";
import {
  createUser,
  updateUser,
  deleteUser,
  signIn,
  verifyAccount,
  changePassword,
  forgetPassword,
  resetPassword,
  depositCoins,
  resetDeposit,
  buyProduct,
} from "./controller/user.controller.js";

const userRoutes = express.Router();

// Create User - No auth required, validation needed
userRoutes.post("/users", validation(signUpSchema), createUser);

// Verify User
userRoutes.get("/users/verify/:token", verifyAccount);

// Signin - No auth required, validation needed, user verification needed
userRoutes.post("/users/signin", validation(signInSchema), signIn);

// Update User - Auth and ownership validation required
userRoutes.put("/users", auth, validation(updateUserSchema), updateUser);

// Change Password - Validation and auth required
userRoutes.patch(
  "/users/changepassword",
  auth,
  validation(changePasswordSchema),
  changePassword
);

// Forget Password Email
userRoutes.post(
  "/users/forgetpassword",
  validation(forgetPasswordSchema),
  forgetPassword
);

// Reset Password
userRoutes.patch(
  "/users/resetpassword/:token",
  validation(resetPasswordSchema),
  resetPassword
);

// Delete User - Auth and ownership validation required
userRoutes.delete("/users", auth, deleteUser);

// Depositing coins
userRoutes.post("/deposit", auth, depositCoins);

// Reset coins
userRoutes.post("/reset", auth, resetDeposit);

// Buy Products
userRoutes.post("/buy", auth, buyProduct);

export default userRoutes;
