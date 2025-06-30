/*

/auth/v1/register

*/


const express = require('express');
const router = express.Router();
require('dotenv').config();
const bcrypt = require("bcryptjs");
const User = require('../Models/User');
const secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");
const { validationResult, body } = require('express-validator');
const {userNameCheck,emailCheck} = require('../Middleware/uniqueCheck');

router.post("/",[
 body('userName',"userName should be at least 8 character").isLength({min:8}),
 body("email","Invalid Email").isEmail(),
 body("password","password should be at least 8 charater").isLength({min:8})
],userNameCheck,emailCheck,async(req,res)=>{
 const errors = validationResult(req);
 if(!errors.isEmpty()) {
  return res.status(400).json({status:false,message:errors.array()})
 }
 try{
 const {firstName,lastName,userName,email,password} = req?.body;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password,salt);
  const newUser = await User.create({
   firstName:firstName,
   lastName:lastName,
   userName:userName,
   email:email,
   password:hashedPassword
  });
  const authToken = jwt.sign({id:newUser._id},secret);
  res.cookie('authToken',authToken,{
   httpOnly:false,
   sameSite:'lax',
   secure:false,
   maxAge:30*24*60*60*1000
  })
  return res.json({status:true,message:"Account Created Succesfully"})
 }catch(e){
  res.status(500).json({status:false,message:"Internal Application Error"});
 }``
})


module.exports = router;