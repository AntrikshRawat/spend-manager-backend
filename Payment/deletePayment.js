/*

/payment/delete

*/


const express = require("express");
const { dcrAccount } = require("../Middleware/updateaccount");
const Payment = require("../Models/Payment");
const Account = require("../Models/Account");
const Router = express.Router();
const createNotification = require("../Middleware/createNotification");

Router.delete("/",async (req, res) => {
   try {
     const { accountId, paymentId } = req.query;
     const payment = await Payment.findOne({ _id:paymentId, accountId });
     if (!payment) {
       return res.status(400).json({  message: "Payment not found!" });
     }

     await Payment.deleteOne({ _id:paymentId, accountId });
const uId = req.userId;
       const {accountMembers,accountName} = await Account.findById(accountId).select("accountMembers accountName");
       const message = `${payment.paidBy} deleted a transaction of amount ₹${payment.amount} from ${accountName} account.`;
       await createNotification(
         payment.paidBy,
         message,
         accountId,
         accountMembers.filter((member)=>member!==uId),
         "payment"
       )
       await dcrAccount(accountId,amount);
       return res.json({ message: "Payment deleted successfully." });;
   } catch (e) {
     res.status(500).json({  message: "Internal Application Error" });
   }
 }
);



module.exports = Router;