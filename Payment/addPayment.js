/*

/payment/add

*/


const express = require("express");
const Payment = require("../Models/Payment");
const { inrAccount, dcrAccount } = require("../Middleware/updateaccount");
const { validationResult, body } = require('express-validator');
const createNotification = require("../Middleware/createNotification");
const Account = require("../Models/Account");
const Router = express.Router();

Router.post("/",[
 body("where","Please add a place where you spend!").isLength({min:4}),
 body("amount","Amount Should be greater than 0!").isFloat({ gt: 0 })
],async(req,res)=>{
 try{
   const errors = validationResult(req);
   if(!errors.isEmpty()) {
    return res.status(400).json({message:errors.array()})
   }
  const {accountId,where,paidBy,amount,memberExpenses} = req.body;
  if(!paidBy) return res.status(400).json({message:"Who paid for this Payment?"});

   const uId = req.userId;
  const {accountMembers,accountName} = await Account.findById(accountId).select("accountMembers accountName");
  const message = `${paidBy} added a new transaction of ₹${amount} in ${accountName} account.`;
  const res = await inrAccount(accountId,amount);
  if(res) {
  await Payment.create({
   accountId,
   where,
   paidBy,
   amount,
   memberExpenses
  });
  await createNotification(
    paidBy,
    message,
    accountId,
    accountMembers.filter((member)=>member!==uId),
    "payment"
  )
  return res.json({message:"Payment Added Successfully."});
  }
  return res.json({message:"Invalid Data!"});
 }catch(e) {
  res.status(500).json({message:"Internal Application Error at end"});
 }
})
module.exports = Router;