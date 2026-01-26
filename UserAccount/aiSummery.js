const express = require("express");
const router = express.Router();
const Account = require("../Models/Account");
const Payment = require("../Models/Payment");
const User = require("../Models/User");
const Groq = require("groq-sdk");

// Ensure API Key is loaded
if (!process.env.GROQ_API) {
  console.warn("⚠️ Warning: GROQ_API is missing from environment variables.");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API, // Explicitly passing it is good practice
});

async function aiResponse(membersName, accountInfo, paymentRecords) {
  const defaultPrompt = `
You are an expert financial analyst. I am providing you with three datasets:
1. **Account Info**: Metadata about the group.
2. **Member Mapping**: A reference list linking User IDs to Real Names.
3. **Payment Records**: A list of transactions containing amounts and payer IDs.

**Your Goal:**
Analyze this data and generate a professional financial settlement report.

**Critical Formatting Rules:**
* **STRICTLY NO TABLES:** Do not use Markdown tables or grid formats for any section.
* **Bullet Points Only:** Present all data, statistics, and breakdowns using clear bullet points or numbered lists.
* **Resolve Names:** Replace every User ID with the corresponding "Real Name" from the Member Mapping. Do not use raw database IDs.
* **Currency:** All monetary values must be in Indian Rupees (₹).

**Report Structure:**
1.  **Header:** The Group Name (formatted as a large bold heading).
2.  **Executive Summary:** A brief overview of total group spending and total transaction count (presented as a list).
3.  **Member Analysis:** Create a distinct section for *each* member containing a bulleted breakdown of:
    * **Total Paid:** total amount they paid(get from every transactions payBy attribute).
    * **Total Spend:** total amount they spend(get from the share in each transaction and total it.).
    * **Net Balance:** (Paid - spend). Label this clearly as "Overpaid" (To Receive) or "Underpaid" (To Pay).
4.  **Settlement Plan:** A clear, step-by-step list of transfers required to balance the books (e.g., "• Alice pays Bob ₹500" and highlight the usernames).

**Tone:**
Professional, objective, and authoritative. Do not include introductory text like "Here is your analysis." Start directly with the Report Header.
`;

  const fullPrompt = `${defaultPrompt}

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

    // 👇 Use .lean() to get plain JSON objects instead of heavy Mongoose docs
    const account = await Account.findById(accountId).lean();
    const Payments = await Payment.find({ accountId }).lean();

    if (!account || Payments.length === 0) {
      return res.status(404).json({ message: "No data found." });
    }

    // Helper: Map User IDs to Names
    // Note: account.accountMembers might be objects or strings depending on your schema.
    // .lean() makes them whatever is in the DB (usually ObjectIds).
    const userIds = account.accountMembers.map((id) => id.toString());

    const users = await User.find({ _id: { $in: userIds } }).lean();

    const nameMap = {};
    users.forEach((user) => {
      nameMap[user._id.toString()] = user.userName;
    });

    // Generate the summary
    const summary = await aiResponse(nameMap, account, Payments);

    res.json({ summary });
  } catch (error) {
    console.error("Summarizer Error:", error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
});

module.exports = router;
