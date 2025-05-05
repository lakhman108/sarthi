const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // Check if OAuth2 credentials are available
  if (process.env.EMAIL_CLIENT_ID &&
      process.env.EMAIL_CLIENT_SECRET &&
      process.env.EMAIL_REFRESH_TOKEN) {

    // Use OAuth2 authentication (more secure)
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.EMAIL_CLIENT_ID,
        clientSecret: process.env.EMAIL_CLIENT_SECRET,
        refreshToken: process.env.EMAIL_REFRESH_TOKEN
      }
    });
  } else {
    // Use regular password authentication with App Password
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
};

// Send OTP email
exports.sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP for Sarthi Account Verification',
      html: `
        <h1>Sarthi Account Verification</h1>
        <p>Your One Time Password (OTP) for account verification is:</p>
        <h2 style="background-color: #f2f2f2; padding: 10px; text-align: center; font-size: 24px;">${otp}</h2>
        <p>This OTP is valid for 15 minutes. Please do not share it with anyone.</p>
        <p>If you didn't request this verification, please ignore this email.</p>
        <p>Click <a href="${process.env.FRONTEND_HOST}/verify-email?email=${encodeURIComponent(email)}">here</a> to verify your account directly.</p>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] OTP sent to ${email}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[ERROR] Failed to send OTP email:`, error);
    throw error;
  }
};
