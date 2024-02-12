import userModel from "../../../../DB/models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  sendPasswordResetMail,
  sendVerificationMail,
} from "../../../services/sendEmail.js";
import productModel from "../../../../DB/models/product.model.js";
import logger from "../../../services/logger.js";

// Create a New User Controller
export const createUser = async (req, res) => {
  try {
    const { username, email, password, Cpassword, role } = req.body;

    if (password !== Cpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if email or username already exists
    let foundUserByEmail = await userModel.findOne({ email });
    let foundUserByUsername = await userModel.findOne({ username });

    if (foundUserByEmail) {
      return res.status(409).json({ message: "Email already registered" });
    }

    if (foundUserByUsername) {
      return res.status(409).json({ message: "Username taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
      role, // role should be either 'buyer' or 'seller'
      deposit: 0, // Initialize deposit to 0
    });
    // Verification Email
    let token = jwt.sign({ id: newUser._id }, "NewUser");
    let url = `https://ahmed-samy-flapkap-backend-challenge.onrender.com/users/verify/${token}`;
    await sendVerificationMail(email, url);

    await newUser.save();
    res.status(201).json({ message: "User created successfully", newUser });
    logger.info(`User created: ${req.body.username}`);
  } catch (error) {
    res.status(500).send("Error in creating user");
    logger.error(`User creation failed: ${error.message}`);
    console.error(error);
  }
};

// User Verification
export const verifyAccount = (req, res) => {
  let { token } = req.params;
  jwt.verify(token, "NewUser", async (err, decoded) => {
    let userFound = await userModel.findById(decoded.id);
    if (!userFound) return res.json({ message: "invalid user" });
    let updatedUser = await userModel.findByIdAndUpdate(
      decoded.id,
      { isVerified: true },
      { new: true }
    );
    res.status(200).json({ message: "User Verified", updatedUser });
  });
};

// Sign in
export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(404).send("You need to register first");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).send("Invalid credentials");
    }

    if (!user.isVerified)
      return res.json({ message: "please verify your account first" });
    const token = jwt.sign({ id: user._id }, "FlapKap", { expiresIn: "1h" }); // generate token which lasts for 1 hr
    res.status(200).json({ message: "Welcome To FlapKap", token });
    logger.info(`User signed in: ${user.username}`);
  } catch (error) {
    res.status(500).send("Error in signin");
    logger.error(`Sign in error: ${error.message}`);
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, CNewPassword } = req.body;

    // Find the current user
    const user = await userModel.findById(req.userID);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      return res.status(400).send("Invalid old password");
    }

    // Check if new password and confirm new password match
    if (newPassword !== CNewPassword) {
      return res.status(400).send("New passwords do not match");
    }

    // Hash and set new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    res.status(200).send("Password changed successfully");
    logger.info(`Password changed for user: ${user.username}`);
  } catch (error) {
    res.status(500).send("Error in changing password");
    logger.error(`Change password error: ${error.message}`);
  }
};

// Update User Data
export const updateUser = async (req, res) => {
  try {
    const userId = req.userID;
    const userToUpdate = await userModel.findById(userId);

    if (!userToUpdate) {
      return res.status(403).send("User Not Found");
    }

    Object.assign(userToUpdate, req.body);
    await userToUpdate.save();

    res
      .status(200)
      .json({ message: "User updated successfully", userToUpdate });
    logger.info(`User updated: ${userToUpdate.username}`);
  } catch (error) {
    res.status(500).send("Error in updating user");
    logger.error(`Update user error: ${error.message}`);
  }
};

// Forget Password
export const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      logger.warn(`Password reset requested for non-existing email: ${email}`);
      return res.status(404).send("User not found");
    }

    let token = jwt.sign({ id: user._id }, "ResetPassword", {
      expiresIn: "1h",
    });
    let url = `https://ahmed-samy-flapkap-backend-challenge.onrender.com/users/resetpassword/${token}`;
    sendPasswordResetMail(email, url);
    res.send("Password reset email sent");
    logger.info(`Password reset email sent to: ${email}`);
  } catch (error) {
    res.status(500).send("Error in forgetPassword");
    logger.error(
      `Error in forgetPassword for email ${email}: ${error.message}`
    );
  }
};
// Reset Password
export const resetPassword = async (req, res) => {
  let { token } = req.params;
  jwt.verify(token, "ResetPassword", async (err, decoded) => {
    if (err) {
      return res.status(400).send("Invalid or expired token");
    }

    const { newPassword, CNewPassword } = req.body;

    // Check if passwords match
    if (newPassword !== CNewPassword) {
      return res.status(400).send("Passwords do not match");
    }

    try {
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update the user's password in the database
      await userModel.findByIdAndUpdate(decoded.id, {
        password: hashedPassword,
      });

      res.status(200).send("Password reset successfully");
      logger.info(`Password reset successfully for token: ${token}`);
    } catch (error) {
      res.status(500).send("Error in resetting password");
      logger.error(
        `Error in resetPassword for token ${token}: ${error.message}`
      );
    }
  });
};

// Delete User
export const deleteUser = async (req, res) => {
  const userId = req.userID;
  try {
    const deletedUser = await userModel.findByIdAndDelete(userId);

    if (!deletedUser) {
      res.status(404).json({ message: "User not found" });
      logger.warn(`Attempt to delete non-existing user: ${userId}`);
      return;
    }

    res.status(200).json({ message: "User deleted successfully", deletedUser });
    logger.info(`User deleted: ${userId}`);
  } catch (error) {
    // Handle potential errors
    res.status(500).json({ message: "Error deleting user", error });
    logger.error(`Error in deleteUser: ${error.message}`);
  }
};

// Depositing Coins
export const depositCoins = async (req, res) => {
  try {
    const userId = req.userID;
    const { amount } = req.body;

    // Check if user is a buyer
    const user = await userModel.findById(userId);
    if (!user || user.role !== "buyer") {
      return res.status(403).json({ error: "Only buyers can deposit coins" });
    }

    // Validate the coin amount
    const validAmounts = [5, 10, 20, 50, 100];
    if (!validAmounts.includes(amount)) {
      return res
        .status(400)
        .json({ error: "Invalid coin, Use Only 5, 10, 20, 50, 100 Coins" });
    }

    // Update user's deposit
    user.deposit += amount;
    await user.save();

    res
      .status(200)
      .json({ message: "Deposit successful", totalDeposit: user.deposit });
    logger.info(`Deposit made by user ${userId}: ${amount} cents`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to deposit coins" });
    logger.error(`Error in depositCoins by user ${userId}: ${error.message}`);
  }
};

// Reset Coins
export const resetDeposit = async (req, res) => {
  try {
    const userId = req.userID;

    // Retrieve the user from the database
    const user = await userModel.findById(userId);
    if (!user || user.role !== "buyer") {
      return res.status(403).json({ error: "Only buyers can reset deposit" });
    }

    if (user.deposit == "0") {
      return res
        .status(403)
        .json({ error: "You have not deposited any money" });
    }
    const refundedAmount = user.deposit;
    // Calculate change
    const change = calculateChange(refundedAmount);
    user.deposit = 0;
    await user.save();

    res.status(200).json({
      message: "Deposit refunded successfully",
      refundedAmount,
      change,
    });
    logger.info(`Deposit reset for user ${userId}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset deposit" });
    logger.error(`Error in resetDeposit for user ${userId}: ${error.message}`);
  }
};

// Buy Products
export const buyProduct = async (req, res) => {
  try {
    const userId = req.userID;
    const { productId, amount } = req.body;

    // Fetch user and product details
    const user = await userModel.findById(userId);
    const product = await productModel.findById(productId);

    if (!user || user.role !== "buyer") {
      return res
        .status(403)
        .json({ error: "Only buyers are allowed to make purchases" });
    }

    if (!product || product.amountAvailable < amount) {
      return res.status(400).json({
        error: `Only ${product.amountAvailable} pieces of product are left in stock.`,
      });
    }

    const totalCost = product.cost * amount;
    const additionalDepositRequired = totalCost - user.deposit;

    if (user.deposit < totalCost) {
      return res.status(400).json({
        error: `Insufficient deposit for this purchase. You need to deposit an additional ${additionalDepositRequired} cents.`,
      });
    }

    // Update product availability and user's deposit
    product.amountAvailable -= amount;
    user.deposit -= totalCost;

    await product.save();
    await user.save();

    // Calculate change
    const change = calculateChange(user.deposit);

    res.status(200).json({
      message: "Purchase successful",
      totalSpent: totalCost,
      productsPurchased: { productName: product.productName, quantity: amount },
      change: change,
    });
    logger.info(`Product purchased by user ${userId}: ${productId}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to complete purchase" });
    logger.error(`Error in buyProduct by user ${userId}: ${error.message}`);
  }
};

// Function to calculate change
function calculateChange(amount) {
  const denominations = [100, 50, 20, 10, 5];
  let remaining = amount;
  const change = {};

  denominations.forEach((denom) => {
    change[`${denom}c`] = Math.floor(remaining / denom);
    remaining = remaining % denom;
  });

  return change;
}
