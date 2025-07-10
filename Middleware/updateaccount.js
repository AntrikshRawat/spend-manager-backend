const Account = require("../Models/Account");

const inrAccount = async (accountId, amount) => {
  try {
    if (!amount || amount <= 0) return false;

    await Account.findByIdAndUpdate(
      accountId,
      { $inc: { totalTransaction: 1, totalSpend: amount } }
    );
    return true;
  } catch (e) {
    return false;
  }
};

const dcrAccount = async (accountId, amount) => {
  try {
    if (!amount || amount <= 0) return false;

    const account = await Account.findById(accountId);
    if (!account || account.totalTransaction <= 0 || account.totalSpend <= 0 || amount > account.totalSpend) {
      return false;
    }

    await Account.findByIdAndUpdate(
      accountId,
      {
        $inc: {
          totalTransaction: -1,
          totalSpend: -amount
        }
      }
    );
    return true;
  } catch (e) {
    return false;
  }
};

const clrAccount = async (accountId) => {
  try {
    await Account.findByIdAndUpdate(
      accountId,
      { $set: { totalTransaction: 0, totalSpend: 0 } }
    );
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
