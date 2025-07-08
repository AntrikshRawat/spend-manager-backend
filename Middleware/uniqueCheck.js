const User = require("../Models/User");


const userNameCheck = async(req,res,next)=>{
 try{
 const {userName} = req.body;
 const user = await User.findOne({userName})
 if(user) {
  return res.status(400).json({message:"userName already Exists"});
 }
 next();
}catch(e){
 res.status(500).json({message:"Internal Application Error"});
}
}

const emailCheck=async(req,res,next)=>{
 try{
 const {email} = req.body;
 const user = await User.findOne({email})
 if(user) {
  return res.status(400).json({message:"email already Exists"});
 }
 next();
}catch(e){
 res.status(500).json({message:"Internal Application Error"});
}
}


module.exports = {userNameCheck,emailCheck};