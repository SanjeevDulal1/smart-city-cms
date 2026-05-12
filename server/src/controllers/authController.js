const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { sendOTP, verifyOTP } = require('../services/emailService');

const generateToken = (id, type) => {
  return jwt.sign({ id, type }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const user = await User.create({ name, email, password, phone });

    await sendOTP(email, 'email_verification');

    res.status(201).json({
      success: true,
      message: 'Account created. Please verify your email with the OTP sent.',
      userId: user._id,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const valid = await verifyOTP(email, otp, 'email_verification');
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }
    await User.findOneAndUpdate({ email }, { isEmailVerified: true });
    res.json({ success: true, message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isEmailVerified) {
      await sendOTP(email, 'email_verification');
      return res.status(403).json({
        success: false,
        message: 'Email not verified. A new OTP has been sent.',
        needsVerification: true,
      });
    }

    const token = generateToken(user._id, 'user');
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        totalComplaints: user.totalComplaints,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email, isActive: true }).select('+password').populate('ward');

    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    await Admin.findByIdAndUpdate(admin._id, { lastLogin: new Date() });

    const token = generateToken(admin._id, 'admin');
    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        ward: admin.ward,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: true, message: 'If that email exists, an OTP was sent.' });
    }
    await sendOTP(email, 'password_reset');
    res.json({ success: true, message: 'Password reset OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const valid = await verifyOTP(email, otp, 'password_reset');
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }
    const user = await User.findOne({ email });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser, verifyEmail, loginUser,
  loginAdmin, getMe, forgotPassword, resetPassword,
};