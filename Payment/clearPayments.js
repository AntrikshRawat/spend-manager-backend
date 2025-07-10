/*

/payment/clear

*/


const express = require("express");
const { clrAccount } = require("../Middleware/updateaccount");
const Payment = require("../Models/Payment");
const Account = require("../Models/Account");
const Router = express.Router();
const createNotification = require("../Middleware/createNotification");
const User = require("../Models/User");

Router.put("/",async(req,res)=>{
 try{
  const {accountId} = req.query;
  await Payment.deleteMany({accountId});

  const {accountMembers , accountName , accountHolder} = await Account.findById(accountId).select("accountMembers accountName accountHolder");
const uId = req.userId;
  const {userName} = await User.findById(accountHolder).select("userName");
       const message = `${userName} cleared all the transactions from ${accountName} account.`;
       await createNotification(
         userName,
         message,
         accountId,
         accountMembers.filter((member)=>member!==uId),
         "payment"
        )
    await clrAccount(accountId);
       return res.json({message:"Account Reset Successfully."});;
 }catch(e) {
  res.status(500).json({message:"Internal Application Error"});
 }
})
module.exports = Router;