const { google } = require("googleapis");
const Account = require("../Models/Account");
const Payment = require("../Models/Payment");
const User = require("../Models/User");

const CLIENT_ID = process.env.EMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const USER_EMAIL = process.env.USER_EMAIL;

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatCurrency = (value) => {
  if (typeof value !== "number") return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatMemberExpenses = (memberExpenses = [], memberNames = []) => {
  if (!Array.isArray(memberExpenses) || memberExpenses.length === 0) {
    return "N/A";
  }

  return memberExpenses
    .map((expense, index) => {
      const memberName = memberNames[index] || `Member ${index + 1}`;
      return `${escapeHtml(memberName)}: ${formatCurrency(Number(expense) || 0)}`;
    })
    .join("<br/>");
};

function deletedDataHtml(
  sender,
  receiver,
  accountName,
  transactions = [],
  action,
  memberNames = []
) {
  const rows = transactions
    .map(
      (payment, index) => `
      <tr>
        <td style="padding:8px;border:1px solid #e2e8f0;">${index + 1}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${escapeHtml(
          payment.where || "N/A"
        )}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${escapeHtml(
          payment.paidBy || "N/A"
        )}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${formatCurrency(
          payment.amount
        )}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${formatDate(
          payment.date
        )}</td>
        <td style="padding:8px;border:1px solid #e2e8f0;">${formatMemberExpenses(
          payment.memberExpenses,
          memberNames
        )}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; color: #1f2937;">
    <h2 style="margin-bottom: 8px;">Account Action Notification</h2>
    <p style="margin: 6px 0;">Hello ${escapeHtml(receiver)},</p>
    <p style="margin: 6px 0;">
      ${escapeHtml(sender)} performed <strong>${escapeHtml(
    action
  )}</strong> on account <strong>${escapeHtml(accountName)}</strong>.
    </p>
    <p style="margin: 6px 0 14px;">
      Transactions recorded before this action are listed below.
    </p>

    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr style="background: #f8fafc;">
          <th style="text-align:left;padding:8px;border:1px solid #e2e8f0;">#</th>
          <th style="text-align:left;padding:8px;border:1px solid #e2e8f0;">Where</th>
          <th style="text-align:left;padding:8px;border:1px solid #e2e8f0;">Paid By</th>
          <th style="text-align:left;padding:8px;border:1px solid #e2e8f0;">Amount</th>
          <th style="text-align:left;padding:8px;border:1px solid #e2e8f0;">Date</th>
          <th style="text-align:left;padding:8px;border:1px solid #e2e8f0;">Member Expenses</th>
        </tr>
      </thead>
      <tbody>
        ${
          rows ||
          `<tr><td colspan="6" style="padding:10px;border:1px solid #e2e8f0;">No transactions found for this account.</td></tr>`
        }
      </tbody>
    </table>

    <p style="margin: 16px 0 0;">Regards,<br/>Spend Manager Team</p>
  </div>`;
}

async function deletedData(accountId, action) {
  if (!accountId || !action) {
    throw new Error("Both accountId and action are required");
  }

  const account = await Account.findById(accountId).select(
    "accountHolder accountName accountMembers"
  );

  if (!account) {
    throw new Error("Account not found");
  }

  const senderUser = await User.findById(account.accountHolder).select(
    "userName"
  );
  const senderName = `${senderUser?.userName ||
    "Account Holder"}`;

  const memberIds = [...new Set((account.accountMembers || []).map((id) => String(id)))].filter(
    (id) => id !== String(account.accountHolder)
  );

  const memberUsers = await User.find({ _id: { $in: memberIds } }).select(
    "userName email"
  );

  const allMembers = await User.find({ _id: { $in: account.accountMembers } }).select(
    "userName"
  );
  const memberNameMap = new Map(
    allMembers.map((user) => [String(user._id), user.userName || "Member"])
  );
  const memberNames = (account.accountMembers || []).map(
    (id, index) => memberNameMap.get(String(id)) || `Member ${index + 1}`
  );

  const membersEmailIds = memberUsers.map((user) => user.email).filter(Boolean);

  const transactions = await Payment.find({ accountId })
    .select("where paidBy date amount memberExpenses")
    .sort({ date: -1 })
    .lean();

  if (membersEmailIds?.length === 0 || transactions?.length === 0) {
    return;
  }

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  const gmail = google.gmail({ version: "v1", auth: oAuth2Client });

  for (const receiver of memberUsers) {
    if (!receiver?.email) continue;

    const receiverName =
      receiver?.userName ||
      "Member";

    const html = deletedDataHtml(
      senderName,
      receiverName,
      account.accountName,
      transactions,
      action,
      memberNames
    );

    const messageParts = [
      `From: Spend Manager <${USER_EMAIL}>`,
      `To: ${receiver.email}`,
      `Subject: ${action} performed on ${account.accountName}`,
      "Content-Type: text/html; charset=utf-8",
      "",
      html,
    ];

    const message = messageParts.join("\n");
    const encodedMessage = Buffer.from(message)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw: encodedMessage },
    });
  }
}

module.exports = { deletedData };
