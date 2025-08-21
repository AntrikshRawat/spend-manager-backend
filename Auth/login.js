/*

/auth/v1/login

*/

const express = require("express");
const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const secret = process.env.JWT_SECRET;
const Router = express.Router();

Router.post("/", async (req, res) => {
  try {
    const { userName, password, rememberMe } = req.body;

    // Determine if input is an email or username
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userName);

    const user = await User.findOne(isEmail ? { email: userName } : { userName: userName });

    if (!user) {
      return res.status(401).json({ message: "Incorrect Credentials" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Incorrect Credentials" });
    }

    const authToken = jwt.sign({ id: user._id }, secret);

    res.cookie("authToken", authToken, {
      httpOnly: true,
      sameSite: 'none',     
      secure: true,        
      maxAge:rememberMe ? 24*60*60*1000 : 30*24*60*60*1000 // 1day or 30 day
    });

    return res.json({ message: "Login Successful" });

  } catch (e) {
    res.status(500).json({ message: "Internal Application Error" });
  }
});

module.exports = Router;
