/*

/payment/clear

*/


const express = require("express");
const { clrAccount } = require("../Middleware/updateaccount");
const Payment = require("../Models/Payment");
const Router = express.Router();

Router.put("/",clrAccount,async(req,res)=>{
 try{
  const {accountId} = req.query;
  await Payment.deleteMany({accountId});
  return res.json({status:true,message:"Account Reset Successfully."});
 }catch(e) {
  res.status(500).json({status:false,message:"Internal Application Error"});
 }
})
module.exports = Router;