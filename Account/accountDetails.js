/*

/account/details

*/

const express = require("express");
const Router = express.Router();
const Account = require("../Models/Account");
const Payment = require("../Models/Payment");

Router.post("/",async(req,res)=>{
 try{
  const {acId}  = req.body;
  const accountDetails = await Account.findById(acId);
  accountDetails.recentTransaction = await Payment.find({accountId:acId}).limit(5);
  return res.json(accountDetails);
 }catch(e) {
  res.status(500).json({message:"Internal Application Error"});
 }
})

module.exports = Router;