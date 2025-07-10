const express = require("express");
const Payment = require("../Models/Payment");
const { inrAccount } = require("../Middleware/updateaccount");
const { validationResult, body } = require("express-validator");
const createNotification = require("../Middleware/createNotification");
const Account = require("../Models/Account");

const Router = express.Router();

Router.post(
  "/",
  [
    body("where", "Please add a place where you spent!").isLength({ min: 4 }),
    body("amount", "Amount should be greater than 0!").isFloat({ gt: 0 }),
    body("paidBy", "Who paid for this Payment?").notEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
      }

      const { accountId, where, paidBy, amount, memberExpenses } = req.body;
      const uId = req.userId;

      if (!accountId)
        return res.status(400).json({ message: "Account ID is required" });

      if (
        !Array.isArray(memberExpenses) ||
        memberExpenses.length === 0
      ) {
        return res.status(400).json({
          message: "Member expenses are required and should be a non-empty array",
        });
      }

      const account = await Account.findById(accountId).select(
        "accountMembers accountName"
      );

      if (!account) {
        return res.status(404).json({ message: "Account not found" });
      }

      const { accountMembers, accountName } = account;

      const updated = await inrAccount(accountId, amount);

      if (!updated) {
        return res
          .status(400)
          .json({ message: "Could not update account totals" });
      }

      await Payment.create({
        accountId,
        where,
        paidBy,
        amount,
        memberExpenses,
      });
      const message = `${paidBy} added a new transaction of ₹${amount} in ${accountName} account.`;

      await createNotification(
        paidBy,
        message,
        accountId,
        accountMembers.filter((member) => member !== uId),
        "payment"
      );

      return res.status(201).json({ message: "Transaction added successfully!" });
    } catch (e) {
      console.error("Error in /payment/add:", e);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

module.exports = Router;
