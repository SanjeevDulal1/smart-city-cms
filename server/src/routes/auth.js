const express = require('express');
const router = express.Router();
const {
  registerUser, verifyEmail, loginUser,
  loginAdmin, getMe, forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protectUser } = require('../middleware/auth');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');

router.post('/register',       authLimiter, registerUser);
router.post('/verify-email',   otpLimiter,  verifyEmail);
router.post('/login',          authLimiter, loginUser);
router.post('/admin/login',    authLimiter, loginAdmin);
router.get('/me',              protectUser, getMe);
router.post('/forgot-password',otpLimiter,  forgotPassword);
router.post('/reset-password',             resetPassword);

module.exports = router;