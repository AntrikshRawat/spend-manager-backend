const express = require("express");
const Router = express.Router();
const Payment = require("../Models/Payment"); // Your Payment model
const paidSpendCalculator = require("../Middleware/paidSpendCalculator");

Router.post("/", async (req, res) => {
  try {
    const { accountMembers } = req.body;
    const { accountId } = req.query;

    if (!accountId || !Array.isArray(accountMembers)) {
      return res.status(400).json({ message: "Invalid input!" });
    }

    // Fetch all transactions of the account
    const transactions = await Payment.find({ accountId });

    // Initialize paid and expense trackers
    const { paidSummary, expenseSummary } = paidSpendCalculator(
      accountMembers,
      transactions,
    );

    res.json({
      paidSummary,
      expenseSummary,
    });
  } catch (err) {
    console.error("Error in spend summary route:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = Router;
