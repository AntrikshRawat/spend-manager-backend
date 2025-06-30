/*

/account/delete

*/

const express = require("express");
const Account = require("../Models/Account");
const Payment = require("../Models/Payment");
const Router = express.Router();

Router.delete("/",async(req,res)=>{
 try{
  const {accountId} = req.body;
  const deleted = await Account.findByIdAndDelete(accountId);
  if(!deleted) {
   return res.status(404).json({status:false,message:"No Matching Account Found!"});
  }
  await Payment.deleteMany({accountId});
  return res.json({status:true,message:"Account Deleted Succesfully."});
 }catch(e) {
  res.status(500).json({status:false,message:"Internal Application Error"});
 }
})
module.exports = Router;