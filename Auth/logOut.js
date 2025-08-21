/*

/auth/v1/logout

*/

const express = require("express");
const Router = express.Router();
const verifyUser = require("../Middleware/verifyUser");
const User = require("../Models/User");

Router.post("/", verifyUser, async (req, res) => {
  const userId = req.userId;
  try {
    User.findByIdAndDelete(userId, {
      pushSubscription: null,
    });
  } catch (e) {
    res.status(500).json({ message: "Internal Application Error" });
    return;
  }
  res.clearCookie("authToken", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });
  return res.json({ message: "logout Successfully!" });
});

module.exports = Router;
