const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const CLIENT_ID = process.env.CLIENT_ID;
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
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: USER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token
      },
    });

    const mailOptions = {
      from: `SpendManager <${USER_EMAIL}>`,
      to: `${userEmail}`,
      subject: 'Reset Password Verification Code Email',
      html:html(userName,verficationCode),
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

module.exports = sendMail;
