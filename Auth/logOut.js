/*

/auth/v1/logout

*/

const express = require("express");
const Router = express.Router();

Router.post("/",async(req,res)=>{
 try{
 res.clearCookie("authToken",{
  httpOnly:false,
  sameSite:'lax',
  secure:false,
 })
 return res.json({message:"LogOut Successfully!"});
}catch(e) {
 res.status(500).json({message:"Internal Application Error"});
}
})

module.exports = Router;