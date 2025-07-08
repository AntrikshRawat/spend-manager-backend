require('dotenv').config();
const secret = process.env.JWT_SECRET;
const jwt = require("jsonwebtoken");

const verifyUser = async(req,res,next)=>{
 const token = req.cookies.authToken;
 try{
  if(!token) {
   return res.status(401).json({message:"Your Token is Expired! Please Login Again."})
  }
  let user;
  try{
   user = await jwt.verify(token,secret);
  }catch(e) {
   return res.status(401).json({message:"Malformed token."});
  }
  if(!user) {
   return res.status(501).json({message:"Unauthorized Access! Not Allowed"})
  }
  req.userId = user.id;
  next();
 }catch(e){
  res.status(500).json({message:"Internal Application Error"});
 }
}

module.exports = verifyUser;