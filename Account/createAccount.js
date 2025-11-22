/*

/account/create

*/



const express = require("express");
const Account = require("../Models/Account");
const { validationResult, body } = require('express-validator');
const User = require("../Models/User");
const createNotification = require("../Middleware/createNotification");

const Router = express.Router();

Router.post("/",[
 body('acName',"Account Name Should be At least 4 Charater!").isLength({min:4}),
 body('accountType',"Account Type Can Not Be Empty!").notEmpty(),
],async(req,res)=>{
 try {
   const errors = validationResult(req);
   if(!errors.isEmpty()) {
    return res.status(400).json({message:errors.array()})
   }

  const uId = req.userId;
  const {acName,acMembers,accountType} = req.body;
  const account = await Account.create({
   accountName:acName,
   accountType,
   accountHolder:uId,
   accountMembers:accountType==="shared"?[...acMembers,uId]:[uId]
  });

  const {userName} = await User.findById(uId).select("userName");
  const message = `${userName} added you to a new account(${account.accountName})`
  if(accountType === "shared") {
  await createNotification(
    userName,
    message,
    account._id,
    acMembers.filter((mem)=>mem!==uId),
    "account"
  )};
  return res.json({message:"Account Created Successfully"});
 }catch(e) {
   res.status(500).json({message:"Internal Application Error"});
 }
})

module.exports = Router;