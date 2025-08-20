const express = require("express");
const User = require("../Models/User");
const verifyUser = require("../Middleware/verifyUser");

const Router = express.Router();

Router.post("/", verifyUser, async (req, res) => {
  const { subscription } = req.body;
  const userId = req.userId;
  try {
    const user = await User.findByIdAndUpdate(userId, {
      pushSubscription: subscription,
    });
    if (!user) {
      res.status(404).json({ status: false, message: "No User Found!" });
      return;
    }
    res.json({ status: true, message: "Push Notification Enabled!" });
    return;
  } catch (_) {
    res.status(500).json({ status: false, message: "Internal Server Error!" });
    return;
  }
});

Router.delete("/", verifyUser, async (req, res) => {
  const userId = req.userId;
  try {
     const user  = await User.findByIdAndUpdate(userId,{
          pushSubscription:null
     });
     if(!user) {
          res.status(404).json({ status: false, message: "No User Found!" });
      return;
     }
     res.json({status:false,message:"Push Notification Disabled!"});
  } catch (_) {
    res.status(500).json({ status: false, message: "Internal Server Error!" });
    return;
  }
});

module.exports = Router;
