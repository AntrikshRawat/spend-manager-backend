const express = require("express");
const router = express.Router();
const axios = require("axios");
const Account = require("../Models/Account");
const Payment = require("../Models/Payment");
const User = require("../Models/User");


router.post("/", async (req, res) => {
  try {
    const { accountId } = req.body;

    const account = await Account.findById(accountId);
    const Payments = await Payment.find({ accountId });

    if (!account || Payments.length === 0) {
      return res.status(404).json({ message: "No data found." });
    }

    const userIds = account.accountMembers.map((id) => id.toString());

    const users = await User.find({ _id: { $in: userIds } });
    const nameMap = {};
    users.forEach((user) => {
      nameMap[user._id.toString()] = user.userName;
    });

    const paidMap = {};
    const spentMap = {};
    let totalSpend = 0;

    for (const tx of Payments) {
      const { paidBy, amount, memberExpenses } = tx;
      totalSpend += amount;

      paidMap[paidBy] = (paidMap[paidBy] || 0) + amount;

      memberExpenses.forEach((amt, idx) => {
        const memberId = account.accountMembers[idx].toString();
        spentMap[memberId] = (spentMap[memberId] || 0) + amt;
      });
    }

    // Calculate settlement
    const settlement = {};
    userIds.forEach((id) => {
      const paid = paidMap[id] || 0;
      const spent = spentMap[id] || 0;
      const diff = paid - spent;

      if (diff === 0) settlement[id] = "is settled";
      else if (diff > 0) settlement[id] = `should receive ₹${diff}`;
      else settlement[id] = `should pay ₹${-diff}`;
    });

    // Prepare prompt for Hugging Face
    const rupee = (amt) => `₹${amt}`;
    let prompt = `Account: ${account.accountName}\n`;
    prompt += `Total Spend: ${rupee(totalSpend)}\n`;
    prompt += `Transactions: ${Payments.length}\n\n`;

    prompt += `Paid:\n`;
    for (const [id, amt] of Object.entries(paidMap)) {
      prompt += `• ${nameMap[id] || id} → ${rupee(amt)}\n`;
    }

    prompt += `\nSettlement:\n`;
    for (const [id, status] of Object.entries(settlement)) {
      prompt += `• ${nameMap[id] || id} ${status}\n`;
    }

    const hfResponse = await axios.post(
      process.env.HF_URL,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 300000,
      }
    );

    const summery = hfResponse.data[0]?.generated_text || prompt;
    return res.json({ summery });
  } catch (error) {
    console.error("Summarizer Error:", error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
});

module.exports = router;
