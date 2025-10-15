const express = require("express");
const verifyUser = require("../Middleware/verifyUser");

const Router = express.Router();

const updatePassword = require("./updatePassword");
Router.use("/updatepassword",verifyUser,updatePassword);

const forgotPassword = require("./forgotPassword");
Router.use("/forgotpassword",forgotPassword);

const notification = require("./notification");
Router.use("/subscribe",notification);

module.exports = Router;