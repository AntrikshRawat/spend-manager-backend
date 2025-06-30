const express = require("express");
const Router = express.Router();
const Payment = require("../Models/Payment"); // Your Payment model

Router.post("/", async (req, res) => {
  try {
    const { accountMembers } = req.body;
    const { accountId } = req.query;
    console.log(accountMembers)

    if (!accountId || !Array.isArray(accountMembers)) {
      return res.status(400).json({ status: false, message: "Invalid input!" });
    }

    // Fetch all transactions of the account
    const transactions = await Payment.find({ accountId });

    // Initialize paid and expense trackers
    const paidSummary = {};
    const expenseSummary = {};

    accountMembers.forEach((member) => {
      paidSummary[member] = 0;
      expenseSummary[member] = 0;
    });

    // Loop through transactions
    transactions.forEach((txn) => {
      const { paidBy, amount, memberExpenses } = txn;

      // Update paid summary
      if (paidSummary.hasOwnProperty(paidBy)) {
        paidSummary[paidBy] += amount;
      }

      // Update expense summary
      if (Array.isArray(memberExpenses)) {
        memberExpenses.forEach((expense, index) => {
          const member = accountMembers[index];
          if (member) {
            expenseSummary[member] += Number(expense);
          }
        });
      }
    });

    res.json({
      paidSummary,
      expenseSummary,
    });
  } catch (err) {
    console.error("Error in spend summary route:", err);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
});

module.exports = Router;
