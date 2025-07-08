/*

/payment/add

*/


const express = require("express");
const Payment = require("../Models/Payment");
const { inrAccount } = require("../Middleware/updateaccount");
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
  await Payment.create({
   accountId,
   where,
   paidBy,
   amount,
   memberExpenses
  })
   const uId = req.userId;
  const {accountMembers,accountName} = await Account.findById(accountId).select("accountMembers accountName");
  const message = `${paidBy} added a new transaction of ₹${amount} in ${accountName} account.`;
  await createNotification(
    paidBy,
    message,
    accountId,
    accountMembers.filter((member)=>member!==uId),
    "payment"
  )
  await inrAccount(accountId,amount);
  return res.json({message:"Payment Added Successfully."});;
 }catch(e) {
  res.status(500).json({message:"Internal Application Error at end"});
 }
})
module.exports = Router;