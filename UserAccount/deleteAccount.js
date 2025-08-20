const express = require("express");
const Account = require("../Models/Account");
const Payment = require("../Models/Payment");
const User = require("../Models/User");

const Router = express.Router();

Router.delete("/", async (req, res) => {
  const userId = req.userId;

  try {
    const userAccounts = await Account.find({ accountHolder: userId });

    const accountIds = userAccounts.map((acc) => acc._id);

    await Payment.deleteMany({ accountId: { $in: accountIds } });

    await Account.deleteMany({ _id: { $in: accountIds } });

    await Account.updateMany(
      { accountMembers: userId },
      { $pull: { accountMembers: userId } }
    );

    const accountsWithOneMember = await Account.find({
      accountMembers: { $size: 1 },
    });

    const singleMemberAccountIds = accountsWithOneMember.map((acc) => acc._id);

    if (singleMemberAccountIds.length > 0) {
      await Payment.deleteMany({ accountId: { $in: singleMemberAccountIds } });
      await Account.deleteMany({ _id: { $in: singleMemberAccountIds } });
    }

    const user = await User.findById(userId);
    await Payment.deleteMany({ paidBy: user.userName });

    return res.status(200).json({
      status: true,
      message: "Accounts and related payments deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error!" });
  }
});

module.exports = Router;
