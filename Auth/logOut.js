/*

/auth/v1/logout

*/

const express = require("express");
const Router = express.Router();

Router.post("/",async(req,res)=>{
 try{
 res.clearCookie("authToken",{
  httpOnly:true,
  sameSite:'none',
  secure:true,
 })
 return res.json({message:"logout Successfully!"});
}catch(e) {
 res.status(500).json({message:"Internal Application Error"});
}
})

module.exports = Router;