/*

/account/create

*/



const express = require("express");
const Account = require("../Models/Account");
const { validationResult, body } = require('express-validator');

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
  await Account.create({
   accountName:acName,
   accountHolder:uId,
   accountMembers:[...acMembers,uId]
  });
  return res.json({status:true,message:"Account Created Successfully"});
 }catch(e) {
   res.status(500).json({status:false,message:"Internal Application Error"});
 }
})

module.exports = Router;