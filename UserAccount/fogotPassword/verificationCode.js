const express = require("express");
const User = require("../../Models/User");
const crypto = require("crypto");
const sendMail = require("../../Middleware/sendGmail");

const Router = express.Router();
const generateVerificationCode = () => {
  const buffer = crypto.randomBytes(3);
  const code = (buffer.readUIntBE(0, 3) % 900000 + 100000).toString();
  return code;
};



const hashCode=(otp)=> {
  return crypto.createHash('sha256').update(otp).digest("hex");
}

Router.post("/", async (req, res) => {
  try {
    const { email } = req.body;

    if(!email) {
      return res.status(404).json({
        success:false,
        message:"Email is Required!"
      });
    }

    const user = await User.findOne({email})
    
    if(!user  || user.email !== email) {
      return res.status(404).json({
        status:false,
        error:"Invalid User! No user found with this email."
      });
    }
    
    const verificationCode = generateVerificationCode();

    
    user.verificationCode = hashCode(verificationCode);
    user.verificationExpiry = Date.now() + 10*60*1000;
    
    try {
      await sendMail(user.email,user.firstName,verificationCode);
      await user.save();
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }
    
    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
    });
    
  } catch (error) {
    console.error("Error in verification code process:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal Server Error" 
    });
  }
});

module.exports = Router;