const Account = require("../Models/Account");

const inrAccount = async (accountId,amount) => {
  try {
    const account = await Account.findByIdAndUpdate(
     accountId,
     { $inc: { totalTransaction: 1, totalSpend: amount } },
     { new: true }
   );
   
   if (!account) return res.status(400).json({  message: "Account Not Found!" });
  } catch (e) {
    res.status(500).json({  message: "Internal Application Error" });
  }
};

const dcrAccount = async (accountId,amount) => {
  try {
    if (!amount || amount <= 0) {
      return res.status(400).json({  message: "Invalid Amount!" });
    }

    let account = await Account.findById(accountId);
    if (!account) {
      return res.status(400).json({  message: "Account Not Found!" });
    }

    if (account.totalTransaction <= 0 || account.totalSpend <= 0) {
      return res.status(500).json({  message: "Invalid Operation." });
    }

    if (amount > account.totalSpend) {
      return res.status(500).json({  message: "Invalid Transaction Access!" });
    }

    account = await Account.findByIdAndUpdate(
      accountId,
      {
        $inc: {
          totalTransaction: -1,
          totalSpend: -amount
        }
      },
      { new: true }
    );
  } catch (e) {
    console.error(e);
    res.status(500).json({  message: "Internal Application Error." });
  }
};


const clrAccount = async (accountId) => {
  try {
    const account = await Account.findByIdAndUpdate(
     accountId,
     { $set: { totalTransaction: 0, totalSpend: 0 } },
     { new: true }
   );
   
   if (!account) return res.status(400).json({  message: "Account Not Found!" });
  } catch (e) {
    res.status(500).json({  message: "Internal Application Error" });
  }
};

module.exports = {
  inrAccount,
  dcrAccount,
  clrAccount
};
