/*

/account/other

*/

const express = require("express");
const Account = require("../Models/Account");
const Router = express.Router();
Router.get("/",async(req,res)=>{
 try{
  const userId = req.userId;
  const otherAccounts = await Account.find({
   accountHolder:{$ne:userId},
   accountMembers:userId
  })
  res.json(otherAccounts);
 }catch(e) {
  res.status(500).json({status:false,message:"Internal Application Error"});
 }
})
module.exports = Router;