/*

/auth/v1/userInfo

*/


const express = require('express');
const verifyUser = require('../Middleware/verifyUser');
const User = require('../Models/User');
const router = express.Router();
router.get("/",verifyUser,async(req,res)=>{
 try{
  const userId = req.userId;
  const user = await User.findById(userId).select("firstName lastName userName email").exec();
  if(!user) {
   res.status(404).json({message:"No Account Found!"});
   return;
  }
  res.json({user});
 }catch(e){
  res.status(500).json({message:"Internal Application Error"});
 }
})


module.exports = router;