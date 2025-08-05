/*

/account

*/



const express = require("express");
const verifyUser = require("../Middleware/verifyUser");

const Router = express.Router();

const getAccounts = require("./getAccounts");
Router.use("/getaccounts",getAccounts);

const createAccount = require('./createAccount');
Router.use("/create",verifyUser,createAccount);

const deleteAccount = require("./deleteAccount");
Router.use("/delete",verifyUser,deleteAccount);

const accountDetails = require("./accountDetails");
Router.use("/details",verifyUser,accountDetails);

module.exports = Router;

