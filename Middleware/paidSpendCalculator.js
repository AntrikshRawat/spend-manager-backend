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
      paidSummary[paidBy] += Number(amount || 0);
    }

    // Update expense summary
    if (Array.isArray(memberExpenses)) {
      memberExpenses.forEach((expense, index) => {
        const expAmount =
          typeof expense === "object" && expense !== null
            ? Number(expense.amount || 0)
            : Number(expense || 0);

        const expMember =
          typeof expense === "object" && expense !== null && expense.member
            ? expense.member
            : accountMembers[index];

        if (expMember && expenseSummary.hasOwnProperty(expMember)) {
          expenseSummary[expMember] += expAmount;
        } else if (
          accountMembers[index] &&
          expenseSummary.hasOwnProperty(accountMembers[index])
        ) {
          expenseSummary[accountMembers[index]] += expAmount;
        }
      });
    }
  });

  return {
    paidSummary,
    expenseSummary,
  };
};
