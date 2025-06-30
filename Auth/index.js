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

Router.use("/register",register);
Router.use("/login",login);
Router.use("/userInfo",userDetails);
Router.use("/logout",logout);
Router.use("/filter",filter);
Router.use("/usernames",usernames);

module.exports = Router;