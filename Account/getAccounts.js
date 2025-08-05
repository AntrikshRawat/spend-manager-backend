const express = require("express");
const Router = express.Router();
const Account = require("../Models/Account");

Router.get("/", async (req, res) => {
  try {
    const userId = req.userId;
    const [createdAccounts, joinedAccounts] = await Promise.all([
      Account.find({ accountHolder: userId }),
      Account.find({ accountHolder: { $ne: userId }, accountMembers: userId })
    ]);

    return res.json({
      created: createdAccounts,
      joined: joinedAccounts
    });

  } catch (e) {
    console.error("Error fetching accounts:", e);
    res.status(500).json({ message: "Internal Application Error" });
  }
});

module.exports = Router;
