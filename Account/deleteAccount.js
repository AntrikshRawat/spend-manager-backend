/*

/account/delete

*/

const express = require("express");
const Account = require("../Models/Account");
const Payment = require("../Models/Payment");
const createNotification = require("../Middleware/createNotification");
const User = require("../Models/User");
const Router = express.Router();

Router.delete("/",async(req,res)=>{
 try{
  const {accountId} = req.body;
  const deleted = await Account.findByIdAndDelete(accountId);
  if(!deleted) {
   return res.status(404).json({message:"No Matching Account Found!"});
  }
  await Payment.deleteMany({accountId});

  const uId = req.userId;
  const {userName} = await User.findById(uId).select("userName");

  const message = `${userName} deleted the ${deleted.accountName} account.`
  if(deleted.accountType === "shared") {
   await createNotification(
      userName,
      message,
      null,
      deleted.accountMembers.filter((mem)=>mem!==uId),
      "account"
    )};
    return res.json({message:"Account Deleted Succesfully."});;
 }catch(e) {
  res.status(500).json({message:"Internal Application Error"});
 }
})
module.exports = Router;