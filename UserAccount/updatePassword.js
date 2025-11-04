const express = require("express");
const User = require("../Models/User");
const bcrypt = require("bcryptjs");

const Router = express.Router();

Router.post("/", async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
  const userId = req.userId;
  const user = await User.findById(userId);

  if (!user) {
    res.status(400).json({ status: false, message: "Invalid User!" });
    return;
  }
  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordMatch) {
    res.status(422).json({ message: "Old Password Does Not Match!" });
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const newhashedPassword = await bcrypt.hash(newPassword,salt);

    await User.findByIdAndUpdate(
      userId,
      { password: newhashedPassword },
      { new: true }
    );
    return res.status(200).json({status:false,message:"Password Updated Successfully!"});
  } catch (er) {
    console.log("error while updating password:",err);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error!" });
  }
});

module.exports = Router;
