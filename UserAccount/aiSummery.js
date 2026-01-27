const express = require("express");
const router = express.Router();
const Account = require("../Models/Account");
const Payment = require("../Models/Payment");
const User = require("../Models/User");
const Groq = require("groq-sdk");
const { promtForSharedAccounts, promtForPersonalAccounts } = require("../config/promt");

// Ensure API Key is loaded
if (!process.env.GROQ_API) {
  console.warn("⚠️ Warning: GROQ_API is missing from environment variables.");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API, // Explicitly passing it is good practice
});

async function aiResponse(accountType,membersName, accountInfo, paymentRecords) {
  const fullPrompt = `${accountType=="shared"?promtForSharedAccounts:promtForPersonalAccounts}

Main Account Info:
\`\`\`json
${JSON.stringify(accountInfo, null, 2)}
\`\`\`

Members Mapping:
\`\`\`json
${JSON.stringify(membersName, null, 2)}
\`\`\`

Payment Records:
\`\`\`json
${JSON.stringify(paymentRecords, null, 2)}
\`\`\`
`;

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      model: "openai/gpt-oss-20b",
      temperature: 0.5,
      stream: false,
    });

    return (
      response.choices[0]?.message?.content || "Error: No analysis generated."
    );
  } catch (err) {
    console.error("Groq API Error:", err);
    throw err; // Propagate error to the route handler
  }
}

router.post("/", async (req, res) => {
  try {
    const { accountId } = req.body;
    const account = await Account.findById(accountId);
    const Payments = await Payment.find({ accountId });

    if (!account || Payments.length === 0) {
      return res.status(404).json({ message: "No data found." });
    }

   const accountType = account.accountType;
   const userIds = account.accountMembers.map((id) => id.toString());

    // 1. Fetch users (Database returns these in random/insertion order)
    const users = await User.find({ _id: { $in: userIds } });

    // 2. Create a temporary lookup object (Order doesn't matter here)
    const userLookup = {};
    users.forEach((user) => {
        userLookup[user._id.toString()] = user.userName;
    });

    // 3. Build the final nameMap using accountMembers to enforce the specific order
    const nameMap = {};
    account.accountMembers.forEach((memberId) => {
        const idStr = memberId.toString();
        // Check if user was found to avoid crashes
        if (userLookup[idStr]) {
            nameMap[idStr] = userLookup[idStr];
        }
    });

    // Generate the summary
    const summary = await aiResponse(accountType,nameMap, account, Payments);

    res.json({ summary });
  } catch (error) {
    console.error("Summarizer Error:", error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
});

module.exports = router;
