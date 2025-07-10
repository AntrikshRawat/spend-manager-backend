const Account = require("../Models/Account");

const inrAccount = async (accountId,amount) => {
  try {
    await Account.findByIdAndUpdate(
     accountId,
     { $inc: { totalTransaction: 1, totalSpend: amount } },
     { new: true }
   );
   
   if (!account) return false;

   return true;
  } catch (e) {
    return false;
  }
};

const dcrAccount = async (accountId,amount) => {
  try {
    if (!amount || amount <= 0) {
      return false;
    }

    let account = await Account.findById(accountId);
    if (!account) {
      return false;
    }

    if (account.totalTransaction <= 0 || account.totalSpend <= 0) {
      return false;
    }

    if (amount > account.totalSpend) {
      return false;
    }

    await Account.findByIdAndUpdate(
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
    return false;
  }
};


const clrAccount = async (accountId) => {
  try {
    await Account.findByIdAndUpdate(
     accountId,
     { $set: { totalTransaction: 0, totalSpend: 0 } },
     { new: true }
   );
   
   if (!account) {
    return false;
  };
  return true;
  } catch (e) {
    return false;
  }
};

module.exports = {
  inrAccount,
  dcrAccount,
  clrAccount
};
