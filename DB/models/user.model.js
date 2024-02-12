// Schema and Model

import mongoose from "mongoose";

// Define the schema for users
let userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // ensures email uniqueness
  },
  deposit: {
    type: Number,
    default: 0,
    validate: {
      validator: function (v) {
        // Ensure the deposit is in multiples of 5, 10, 20, 50, or 100 cents
        return v % 5 === 0;
      },
      message: (props) => `${props.value} is not a valid coin denomination`,
    },
  },
  role: {
    type: String,
    enum: ["buyer", "seller"],
  },
  isVerified: { type: Boolean, default: false },
});

// Create a model from the schema
const userModel = mongoose.model("User", userSchema);

export default userModel;
