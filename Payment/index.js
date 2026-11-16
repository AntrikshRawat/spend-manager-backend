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
  const {accountId, month} = req.query;
  const query = {accountId:accountId};

  if(month) {
   const [year, mon] = month.split("-").map(Number);
   if(!year || !mon || mon < 1 || mon > 12) {
    return res.status(400).json({message:"Invalid month format. Use YYYY-MM"});
   }
   const startDate = new Date(year, mon - 1, 1);
   const endDate = new Date(year, mon, 1);
   query.date = { $gte: startDate, $lt: endDate };
  }

  const allPayments = await Payment.find(query);
  return res.json(allPayments);
 }catch(e) {
  res.status(500).json({message:"Internal Application Error"});
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
