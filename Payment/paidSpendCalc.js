const express = require("express");
const Router = express.Router();
const Payment = require("../Models/Payment"); // Your Payment model
const paidSpendCalculator = require("../Middleware/paidSpendCalculator");

Router.post("/", async (req, res) => {
  try {
    const { accountMembers } = req.body;
    const { accountId, month } = req.query;

    if (!accountId || !Array.isArray(accountMembers)) {
      return res.status(400).json({ message: "Invalid input!" });
    }

    const query = { accountId };

    if (month) {
      const [year, mon] = month.split("-").map(Number);
      if (!year || !mon || mon < 1 || mon > 12) {
        return res.status(400).json({ message: "Invalid month format. Use YYYY-MM" });
      }
      const startDate = new Date(year, mon - 1, 1);
      const endDate = new Date(year, mon, 1);
      query.date = { $gte: startDate, $lt: endDate };
    }

    const transactions = await Payment.find(query);

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
