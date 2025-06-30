/*

/payment/add

*/


const express = require("express");
const Payment = require("../Models/Payment");
const { inrAccount } = require("../Middleware/updateaccount");
const { validationResult, body } = require('express-validator');
const Router = express.Router();

Router.post("/",[
 body("where","Please add a place where you spend!").isLength({min:4}),
 body("amount","Amount Should be greater than 0!").isFloat({ gt: 0 })
],inrAccount,async(req,res)=>{
 try{
   const errors = validationResult(req);
   if(!errors.isEmpty()) {
    return res.status(400).json({status:false,message:errors.array()})
   }
  const {accountId,where,paidBy,amount,memberExpenses} = req.body;
  if(!paidBy) return res.status(400).json({status:false,message:"Who paid for this Payment?"});
  await Payment.create({
   accountId,
   where,
   paidBy,
   amount,
   memberExpenses
  })
  return res.json({status:true,message:"Payment Added Successfully."});
 }catch(e) {
  res.status(500).json({status:false,message:"Internal Application Error at end"});
 }
})
module.exports = Router;