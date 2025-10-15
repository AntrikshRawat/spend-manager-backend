const express = require("express");
const User = require("../../Models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const Router = express.Router();
const generateVerificationCode = () => {
  const buffer = crypto.randomBytes(3);
  const code = (buffer.readUIntBE(0, 3) % 900000 + 100000).toString();
  return code;
};

const html = (name,otp) =>(
  `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2>Password Reset</h2>
          <p>Hello,${name}</p>
          <p>You have requested to reset your password. Please use the following verification code to complete the process:</p>
          <div style="background-color: #f4f4f4; padding: 10px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email or contact support if you have concerns.</p>
        </div>
      `
);

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

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Verification Code",
      html:html(user.firstName,verificationCode)
    };
    
    user.verificationCode = hashCode(verificationCode);
    user.verificationExpiry = Date.now() + 10*60*1000;

    try {
      await transporter.sendMail(mailOptions);
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