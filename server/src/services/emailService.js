const nodemailer = require('nodemailer');
const OTP = require('../models/OTP');
const crypto = require('crypto');

const createTransporter = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

const sendOTP = async (email, purpose) => {
  const otp = generateOTP();
  const expireMinutes = parseInt(process.env.OTP_EXPIRE_MINUTES) || 10;

  await OTP.deleteMany({ email, purpose });

  await OTP.create({
    email,
    otp,
    purpose,
    expiresAt: new Date(Date.now() + expireMinutes * 60 * 1000),
  });

  const subjectMap = {
    complaint_verification: 'Verify your complaint submission',
    email_verification: 'Verify your email address',
    password_reset: 'Reset your password',
  };

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Smart City CMS" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subjectMap[purpose] || 'Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
        <h2 style="color: #1a1a2e;">Smart City Complaint System</h2>
        <p>Your verification code is:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4a4de7;">${otp}</span>
        </div>
        <p style="color: #666;">This code expires in <strong>${expireMinutes} minutes</strong>.</p>
        <p style="color: #666;">If you did not request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">Smart City Complaint Management System &mdash; Kathmandu</p>
      </div>
    `,
  });

  return true;
};

const verifyOTP = async (email, otp, purpose) => {
  const record = await OTP.findOne({
    email,
    otp,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  if (!record) return false;

  await OTP.findByIdAndUpdate(record._id, { isUsed: true });
  return true;
};

module.exports = { sendOTP, verifyOTP };