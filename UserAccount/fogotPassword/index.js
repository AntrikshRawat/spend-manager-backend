const express = require("express");

const verificationCode = require("./verificationCode");
const verifyOtp = require("./verifyOtp");
const resetPassword = require("./resetPassword");

const Router = express.Router();

Router.use("/verificationcode" , verificationCode);
Router.use("/verifyOtp",verifyOtp);
Router.use("/reset",resetPassword);

module.exports = Router;