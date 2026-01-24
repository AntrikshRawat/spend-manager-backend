 module.exports = function (accountMembers, transactions) {
  const paidSummary = {};
  const expenseSummary = {};

  accountMembers.forEach((member) => {
    paidSummary[member] = 0;
    expenseSummary[member] = 0;
  });

  // Loop through transactions
  transactions.forEach((txn) => {
    const { paidBy, amount, memberExpenses } = txn;

    // Update paid summary
    if (paidSummary.hasOwnProperty(paidBy)) {
      paidSummary[paidBy] += amount;
    }

    // Update expense summary
    if (Array.isArray(memberExpenses)) {
      memberExpenses.forEach((expense, index) => {
        const member = accountMembers[index];
        if (member) {
          expenseSummary[member] += Number(expense);
        }
      });
    }
  });

  return {
    paidSummary,
    expenseSummary
  };
};
