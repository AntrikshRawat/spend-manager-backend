const express = require("express");
const Router = express.Router();
const User = require("../Models/User");

Router.post("/", async (req, res) => {
  try {
    const {userName, paidSummery, expenseSummery } = req.body;

    // Get all member usernames
    const memberUsernames = Object.keys(paidSummery);

    // Calculate current user's balance
    const currentUserPaid = paidSummery[userName] || 0;
    const currentUserExpense = expenseSummery[userName] || 0;
    let currentUserBalance = currentUserPaid - currentUserExpense;

    const otherMembers = memberUsernames.filter(
      (name) => name !== userName,
    );

    // Calculate balances for all members
    const memberBalances = memberUsernames.map((user) => ({
      userName: user,
      balance:
        (paidSummery[user] || 0) -
        (expenseSummery[user] || 0),
    }));

    // Separate creditors (positive balance) and debtors (negative balance)
    const creditors = memberBalances
      .filter((m) => m.balance > 0)
      .sort((a, b) => b.balance - a.balance);

    // Create settlement array
    const settlementArray = [];
    // Current user owes money - pay to creditors
    let remainingDebt = Math.abs(currentUserBalance);

    for (const creditor of creditors) {
      if (remainingDebt <= 0) break;

      const amountToPay = Math.min(remainingDebt, creditor.balance);
      settlementArray.push({
        userName: creditor.userName,
        due: amountToPay,
      });
      remainingDebt -= amountToPay;
    }

    for (const member of memberBalances) {
      if (settlementArray.find((s) => s.userName === otherMembers.userName)) {
        settlementArray.push({
          userName: member.userName,
          due: 0,
        });
      }
    }

    res.status(200).json({ status: true, settlement: settlementArray });
  } catch (err) {
     console.log(err)
    res.status(500).json({ status: false, message: "Internal Server Error!" });
    return;
  }
});

module.exports = Router;
