const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../Models/User");

const Router = express.Router();

// POST endpoint to reset password
Router.post("/", async (req, res) => {
  try {
    const { email, newPassword, tempToken } = req.body;

    // Validate input
    if (!email || !newPassword || !tempToken) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!"
      });
    }

    // Verify the temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid Request!"
      });
    }

    // Check if the token type is correct and email matches
    if (decoded.type !== "password_reset") {
      return res.status(401).json({
        success: false,
        message: "Invalid Request!"
      });
    }

    if (decoded.email !== email) {
      return res.status(401).json({
        success: false,
        message: "Invalid User!"
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid User!"
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("Error in password reset:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
});

module.exports = Router;