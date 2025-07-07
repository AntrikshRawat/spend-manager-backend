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
],async(req,res)=>{
 try {
   const errors = validationResult(req);
   if(!errors.isEmpty()) {
    return res.status(400).json({status:false,message:errors.array()})
   }

  const uId = req.userId;
  const {acName,acMembers} = req.body;
  const account = await Account.create({
   accountName:acName,
   accountHolder:uId,
   accountMembers:[...acMembers,uId]
  });

  const {userName} = await User.findById(uId).select("userName");
  const message = `${userName} added you to a new account(${account.accountName})`
  await createNotification(
    userName,
    message,
    account._id,
    acMembers,
    "account"
  );
  return res.json({status:true,message:"Account Created Successfully"});
 }catch(e) {
   res.status(500).json({status:false,message:"Internal Application Error"});
 }
})

module.exports = Router;