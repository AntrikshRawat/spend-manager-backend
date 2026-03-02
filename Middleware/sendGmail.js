const { google } = require('googleapis');

const CLIENT_ID = process.env.EMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const USER_EMAIL = process.env.USER_EMAIL;


const html = (name,otp) =>(
  `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
          <h2>Password Reset</h2>
          <p>Hello,${name}</p>
          <p>You have requested to reset your password. Please use the following verification code to complete the process:</p>
          <div style="background-color: #f4f4f4; padding: 10px; font-size: 24px; font-weight: bold; text-align: center; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you did not request this, please ignore this email or contact support if you have concerns.</p>
        </div>
      `
);

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(userEmail,userName,verficationCode) {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const messageParts = [
      `From: Spend Manager <${USER_EMAIL}>`,
      `To: ${userEmail}`,
      'Subject: Reset Password Verification Code',
      'Content-Type: text/html; charset=utf-8',
      '',
      html(userName, verficationCode),
    ];

    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = sendMail;
