const express = require("express");
const User = require("../../Models/User");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const Router = express.Router();

const hashCode = (otp) => {
  return crypto.createHash('sha256').update(otp).digest("hex");
};

// POST endpoint to verify the code and send temp token
Router.post("/", async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // Validate input
    if (!email || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required"
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email"
      });
    }

    // Check if verification code exists
    if (!user.verificationCode) {
      return res.status(400).json({
        success: false,
        message: "No verification code found. Please request a new code"
      });
    }

    // Check if verification code has expired
    if (!user.verificationExpiry || Date.now() > user.verificationExpiry) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code"
      });
    }

    // Hash the provided verification code
    const hashedProvidedCode = hashCode(verificationCode);

    // Compare hashed codes
    if (hashedProvidedCode !== user.verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code"
      });
    }

    // Generate temporary JWT token (valid for 15 minutes)
    const tempToken = jwt.sign(
      { 
        email: user.email,
        type: "password_reset" 
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Clear the verification code and expiry from database
    user.verificationCode = '';
    user.verificationExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Verification successful",
      tempToken: tempToken
    });

  } catch (error) {
    console.error("Error in verification process:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
});

module.exports = Router;