const express = require("express");
const { dcrAccount } = require("../Middleware/updateaccount");
const Payment = require("../Models/Payment");
const Account = require("../Models/Account");
const createNotification = require("../Middleware/createNotification");

const Router = express.Router();

Router.delete("/", async (req, res) => {
  try {
    const { accountId, paymentId } = req.query;

    if (!accountId || !paymentId) {
      return res.status(400).json({ message: "accountId and paymentId are required" });
    }

    const payment = await Payment.findOne({ _id: paymentId, accountId });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found!" });
    }

    const uId = req.userId;

    const account = await Account.findById(accountId).select("accountMembers accountName");
    if (!account) {
      return res.status(404).json({ message: "Account not found!" });
    }

    const { accountMembers, accountName } = account;

    const accountUpdated = await dcrAccount(accountId, payment.amount);

    if (!accountUpdated) {
      return res.status(400).json({ message: "Failed to update account totals" });
    }

    await Payment.deleteOne({ _id: paymentId, accountId });

    const message = `${payment.paidBy} deleted a transaction of amount ₹${payment.amount} from ${accountName} account.`;

    await createNotification(
      payment.paidBy,
      message,
      accountId,
      accountMembers.filter((member) => member !== uId),
      "payment"
    );

    return res.status(200).json({ message: "Payment deleted successfully." });
  } catch (e) {
    console.error("Error in /payment/delete:", e);
    res.status(500).json({ message: "Internal Application Error" });
  }
});

module.exports = Router;
