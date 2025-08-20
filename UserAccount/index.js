const express = require("express");
const verifyUser = require("../Middleware/verifyUser");

const Router = express.Router();

const updatePassword = require("./updatePassword");
Router.use("/updatepass",verifyUser,updatePassword);

const forgotPassword = require("./forgotPassword");
Router.use("/forgotpass",verifyUser,forgotPassword);

const deleteAccount = require("./deleteAccount");
Router.use("/delete",verifyUser,deleteAccount);

const notification = require("./notification");
Router.use("/subscribe",notification);

module.exports = Router;