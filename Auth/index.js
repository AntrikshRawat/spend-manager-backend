/* 

     /auth/v1
     
*/
const express = require('express');
const Router = express.Router();

const register = require('./register');
const login = require('./login');
const userDetails = require("./userDetails");
const logout = require("./logOut");
const filter = require("./filteruser");
const usernames = require("./getUserNames");
const verifyUser = require('../Middleware/verifyUser');

Router.use("/register",register);
Router.use("/login",login);
Router.use("/userInfo",verifyUser,userDetails);
Router.use("/logout",verifyUser,logout);
Router.use("/filter",verifyUser,filter);
Router.use("/usernames",verifyUser,usernames);

module.exports = Router;