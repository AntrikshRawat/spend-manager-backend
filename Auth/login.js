/*

/auth/v1/login

*/

const express = require("express");
const User = require("../Models/User");
const bcrypt = require("bcryptjs");
require('dotenv').config();
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;
const Router = express.Router();

Router.post("/", async (req, res) => {
  try {
    const { userName, password } = req.body;

    // Determine if input is an email or username
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userName);

    const user = await User.findOne(isEmail ? { email: userName } : { userName: userName });

    if (!user) {
      return res.status(401).json({ status: false, message: "Incorrect Credentials" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ status: false, message: "Incorrect Credentials" });
    }

    const token = jwt.sign({ id: user._id }, secret);

    res.cookie("authToken", token, {
      httpOnly: false,       // In production: change to true
      sameSite: 'lax',       // 'none' for cross-origin with secure
      secure: false,         // In production: set to true
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return res.json({ status: true, message: "Login Successful" });

  } catch (e) {
    res.status(500).json({ status: false, message: "Internal Application Error" });
  }
});

module.exports = Router;
