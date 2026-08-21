const express = require("express");
const Account = require("../Models/Account");
const createNotification = require("../Middleware/createNotification");
const User = require("../Models/User");

const Router = express.Router();

Router.get("/", async (req, res) => {
  const userId = req.userId;
  const { accountId } = req.query;
  try {
    const user = await User.findById(userId);
    const account = await Account.findById(accountId);
    if (!account) {
      return res
        .status(404)
        .json({ status: false, message: "No Matching Account Found!" });
    }
    const msg = `Gentle reminder from ${user?.userName || "Group Owner"}! Please check the group(${account.accountName || ""}) and settle due payments.`;

    const accountMembers = account?.accountMembers;
    await createNotification(
      user?.userName,
      msg,
      accountId,
      accountMembers.filter((mem) => String(mem) !== userId),
      "reminder",
    );
    res
      .status(200)
      .json({ status: true, msg: "Reminder Sent To Group Members." });
  } catch (err) {
    console.error("Error Sending Reminder:", e);
    res
      .status(500)
      .json({ status: false, message: "Internal Application Error" });
  }
});

module.exports = Router;
