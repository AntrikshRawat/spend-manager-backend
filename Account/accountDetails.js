/*

/account/details

*/

const express = require("express");
const Router = express.Router();
const Account = require("../Models/Account");

Router.post("/",async(req,res)=>{
 try{
  const {acId}  = req.body;
  const accountDetails = await Account.findById(acId);
  return res.json(accountDetails);
 }catch(e) {
  res.status(500).json({status:false,message:"Internal Application Error"});
 }
})

module.exports = Router;