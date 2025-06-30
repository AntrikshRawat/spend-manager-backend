/*

/payment

*/

const express = require("express");
const verifyUser = require("../Middleware/verifyUser");
const accountVerification = require("../Middleware/accountVerification");
const Payment = require("../Models/Payment");

const Router = express.Router();
Router.use(verifyUser);

Router.get("/",accountVerification,async(req,res)=>{
 try{
  const {accountId} = req.query;
  const allPayments = await Payment.find({accountId:accountId});
  return res.json(allPayments);
 }catch(e) {
  res.status(500).json({status:false,message:"Internal Application Error"});
 }
});

const addPayment = require("./addPayment");
Router.use("/add",accountVerification,addPayment);

const deletePayment = require("./deletePayment");
Router.use("/delete",accountVerification,deletePayment);

const clearPayments = require("./clearPayments");
Router.use("/clear",accountVerification,clearPayments);

const paidSpend = require("./paidSpendCalc");
Router.use("/paidspend",accountVerification,paidSpend);

module.exports = Router;
