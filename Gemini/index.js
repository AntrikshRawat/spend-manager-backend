const express = require("express");
const router = express.Router();
const Account = require("../Models/Account");
const Payment = require("../Models/Payment");
const User = require("../Models/User");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function geminiResponse(membersName, accountInfo, paymentRecords) {
  const defaultPrompt =
    "Please act as an expert financial analyst. I'm providing you with three sets of data: the main account information, an array of member names, and a full list of payment records. I need you to analyze all of this data and generate a comprehensive, professional financial summary. Your report should be clear, well-structured, and easy for anyone to understand. And also use appropriate heading boldness and etc. Make sure to prominently feature the group's name at the top. The body of the report must include the total spending for the group, the total number of transactions, and a list of all members. Most importantly, provide a breakdown for each individual member that clearly shows the total amount they personally paid versus what their calculated share of the expenses was. Finally, conclude the report with a clear, unambiguous settlement plan that states exactly who needs to pay whom, and the precise amount in Indian Rupees (₹), to balance the account. While ensuring all these details are accurate and present, feel free to use your own professional wording and structure to make the report feel as if it were written by a real analyst. Generate only the report itself; do not include any introductory or conversational text like Here is your report.";

  const fullPrompt = `${defaultPrompt}

Main Account Info:
\`\`\`json
${JSON.stringify(accountInfo, null, 2)}
\`\`\`

Members:
\`\`\`json
${JSON.stringify(membersName, null, 2)}
\`\`\`

Payment Records:
\`\`\`json
${JSON.stringify(paymentRecords, null, 2)}
\`\`\`
`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

  const {response} = await model.generateContent(fullPrompt);
  return response.text();
}

router.post("/", async (req, res) => {
  try {
    const { accountId } = req.body;
    const account = await Account.findById(accountId);
    const Payments = await Payment.find({ accountId });
    if (!account || Payments.length === 0) {
      return res.status(404).json({ message: "No data found." });
    }
    const userIds = account.accountMembers.map((id) => id.toString());

    const users = await User.find({ _id: { $in: userIds } });
    const nameMap = {};
    users.forEach((user) => {
      nameMap[user._id.toString()] = user.userName;
    });

    const summary = await geminiResponse(nameMap,account,Payments);
    res.json({summary});
  } catch (error) {
    console.error("Summarizer Error:", error.message);
    return res.status(500).json({ message: "Something went wrong." });
  }
});

module.exports = router;
