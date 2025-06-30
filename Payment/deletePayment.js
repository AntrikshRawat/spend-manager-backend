/*

/payment/delete

*/


const express = require("express");
const { dcrAccount } = require("../Middleware/updateaccount");
const Payment = require("../Models/Payment");
const Router = express.Router();

Router.delete("/",dcrAccount,async (req, res) => {
   try {
     const { accountId, paymentId } = req.query;
     const payment = await Payment.findOne({ _id:paymentId, accountId });
     if (!payment) {
       return res.status(400).json({ status: false, message: "Payment not found!" });
     }

     await Payment.deleteOne({ _id:paymentId, accountId });

     return res.json({ status: true, message: "Payment deleted successfully." });
   } catch (e) {
     res.status(500).json({ status: false, message: "Internal Application Error" });
   }
 }
);



module.exports = Router;