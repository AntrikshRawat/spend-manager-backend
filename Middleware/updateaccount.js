const Account = require("../Models/Account");

const inrAccount = async (req, res, next) => {
  try {
    const { accountId, amount } = req.body;
    const account = await Account.findByIdAndUpdate(
     accountId,
     { $inc: { totalTransaction: 1, totalSpend: amount } },
     { new: true }
   );
   
   if (!account) return res.status(400).json({ status: false, message: "Account Not Found!" });
   
    next();
  } catch (e) {
    res.status(500).json({ status: false, message: "Internal Application Error" });
  }
};

const dcrAccount = async (req, res, next) => {
  try {
    const { accountId, amount } = req.query;

    if (!amount || amount <= 0) {
      return res.status(400).json({ status: false, message: "Invalid Amount!" });
    }

    let account = await Account.findById(accountId);
    if (!account) {
      return res.status(400).json({ status: false, message: "Account Not Found!" });
    }

    if (account.totalTransaction <= 0 || account.totalSpend <= 0) {
      return res.status(500).json({ status: false, message: "Invalid Operation." });
    }

    if (amount > account.totalSpend) {
      return res.status(500).json({ status: false, message: "Invalid Transaction Access!" });
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
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ status: false, message: "Internal Application Error." });
  }
};


const clrAccount = async (req, res, next) => {
  try {
    const { accountId } = req.query;
    const account = await Account.findByIdAndUpdate(
     accountId,
     { $set: { totalTransaction: 0, totalSpend: 0 } },
     { new: true }
   );
   
   if (!account) return res.status(400).json({ status: false, message: "Account Not Found!" });
   
    next();
  } catch (e) {
    res.status(500).json({ status: false, message: "Internal Application Error" });
  }
};

module.exports = {
  inrAccount,
  dcrAccount,
  clrAccount
};
