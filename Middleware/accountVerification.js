const Account = require("../Models/Account");

const accountVerification = async (req, res, next) => {
    try {
        const userId = req.userId;
        const accountId = req.body?.accountId || req.query?.accountId || req.params?.accountId;

        if (!accountId) {
            return res.status(400).json({ message: "Account ID is required" });
        }

        const account = await Account.findById(accountId);
        if (!account) {
            return res.status(404).json({ message: "No Account Found!" });
        }

        const isUserHaveAccount =
            String(account.accountHolder) === String(userId) ||
            (Array.isArray(account.accountMembers) &&
                account.accountMembers.some((memberId) => String(memberId) === String(userId)));

        if (!isUserHaveAccount) {
            return res.status(401).json({ message: "Unauthorized Access! Not Allowed" });
        }

        req.account = account;
        next();
    } catch (e) {
        console.error("Account verification error:", e);
        res.status(500).json({ message: "Internal Application Error." });
    }
};

module.exports = accountVerification;
