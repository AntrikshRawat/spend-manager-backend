/*

/account/details

*/

const express = require("express");
const Router = express.Router();
const Account = require("../Models/Account");
const Payment = require("../Models/Payment");

Router.post("/", async (req, res) => {
  try {
    const acId = req.body?.acId || req.body?.accountId;
    if (!acId) {
      return res.status(400).json({ message: "Account ID is required" });
    }

    const accountDetails = await Account.findById(acId).lean();
    if (!accountDetails) {
      return res.status(404).json({ message: "Account not found" });
    }

    const userId = req.userId;
    const isMember =
      String(accountDetails.accountHolder) === String(userId) ||
      (Array.isArray(accountDetails.accountMembers) &&
        accountDetails.accountMembers.some((id) => String(id) === String(userId)));

    if (!isMember) {
      return res.status(401).json({ message: "Unauthorized Access! Not Allowed" });
    }

    const recentTransaction = await Payment.find({ accountId: acId })
      .sort({ date: -1 })
      .limit(5);

    accountDetails.recentTransaction = recentTransaction;
    accountDetails.totalSpend = accountDetails.totalSpend ?? 0;
    accountDetails.totalTransaction = accountDetails.totalTransaction ?? 0;

    return res.json(accountDetails);
  } catch (e) {
    console.error("Error in /account/details:", e);
    res.status(500).json({ message: "Internal Application Error" });
  }
});

module.exports = Router;