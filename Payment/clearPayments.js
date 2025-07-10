const express = require("express");
const { clrAccount } = require("../Middleware/updateaccount");
const Payment = require("../Models/Payment");
const Account = require("../Models/Account");
const createNotification = require("../Middleware/createNotification");
const User = require("../Models/User");

const Router = express.Router();

Router.put("/", async (req, res) => {
  try {
    const { accountId } = req.query;

    if (!accountId) {
      return res.status(400).json({ message: "accountId is required" });
    }

    const account = await Account.findById(accountId).select("accountMembers accountName accountHolder");
    if (!account) {
      return res.status(404).json({ message: "Account not found!" });
    }

    const uId = req.userId;
    const { accountMembers, accountName, accountHolder } = account;

    const user = await User.findById(accountHolder).select("userName");
    const userName = user?.userName || "An account member";

    const message = `${userName} cleared all the transactions from ${accountName} account.`;

    await clrAccount(accountId);
    await Payment.deleteMany({ accountId });

    await createNotification(
      userName,
      message,
      accountId,
      accountMembers.filter((member) => member !== uId),
      "payment"
    );

    return res.status(200).json({ message: "Account reset successfully." });
  } catch (e) {
    console.error("Error in /payment/clear:", e);
    res.status(500).json({ message: "Internal Application Error" });
  }
});

module.exports = Router;
