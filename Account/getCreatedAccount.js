/*

/account/created

*/

const express = require("express");
const Router = express.Router();
const Account = require("../Models/Account");

Router.get("/",async(req,res)=>{
 try{
  const userId = req.userId;
  const createdAccounts = await Account.find({accountHolder:userId});
  return res.json(createdAccounts);
 }catch(e) {
  res.status(500).json({message:"Internal Application Error"});
 }
})

module.exports = Router;