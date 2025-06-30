/*

/account

*/



const express = require("express");
const verifyUser = require("../Middleware/verifyUser");

const Router = express.Router();

const createAccount = require('./createAccount');
Router.use("/create",verifyUser,createAccount);

const createdAccounts = require("./getCreatedAccount");
Router.use("/created",verifyUser,createdAccounts);

const otherAccounts = require("./getOtherAccount");
Router.use("/other",verifyUser,otherAccounts);

const deleteAccount = require("./deleteAccount");
Router.use("/delete",verifyUser,deleteAccount);

const accountDetails = require("./accountDetails");
Router.use("/details",verifyUser,accountDetails);

module.exports = Router;

