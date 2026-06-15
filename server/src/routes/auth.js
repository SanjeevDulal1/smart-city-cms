const express = require('express');
const router = express.Router();
const {
  registerUser, verifyEmail, loginUser,
  loginAdmin, getMe, forgotPassword, resetPassword,
} = require('../controllers/authController');
const { protectUser } = require('../middleware/auth');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');

router.post('/register',       authLimiter, registerUser);
router.post('/verify-email',   otpLimiter,  verifyEmail);
router.post('/login',          authLimiter, loginUser);
router.post('/admin/login',    authLimiter, loginAdmin);
router.get('/me',              protectUser, getMe);
router.post('/forgot-password',otpLimiter,  forgotPassword);
router.post('/reset-password',             resetPassword);
router.put('/profile', protectUser, async (req, res) => {
  try {
    console.log('Profile update request from user:', req.user._id);
    console.log('Request body:', req.body);
    
    const { phone, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    
    console.log('User found:', !!user);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (phone !== undefined) user.phone = phone;

    if (currentPassword && newPassword) {
      console.log('Attempting password change...');
      const isMatch = await user.comparePassword(currentPassword);
      console.log('Password match:', isMatch);
      
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect.',
        });
      }
      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 8 characters.',
        });
      }
      user.password = newPassword;
    }

    await user.save();
    console.log('Profile saved successfully');
    
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id:              user._id,
        name:            user.name,
        email:           user.email,
        phone:           user.phone,
        totalComplaints: user.totalComplaints,
      },
    });
  } catch (error) {
    console.error('Profile update error:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;