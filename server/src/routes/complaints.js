const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  requestComplaintOTP,
  submitComplaint,
  getMapComplaints,
  getMyComplaints,
  getComplaintById,
  upvoteComplaint,
} = require('../controllers/complaintController');
const { protectUser } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { otpLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');

const VALID_CATEGORIES = [
  'live_wire','gas_leak','road_collapse','sewage_overflow',
  'flood','pothole','broken_light','garbage','broken_footpath','noise','other'
];

router.get('/map', getMapComplaints);
router.get('/mine', protectUser, getMyComplaints);
router.get('/:id', getComplaintById);

router.post('/request-otp', protectUser, otpLimiter, requestComplaintOTP);

router.post('/submit',
  protectUser,
  upload.array('photos', 3),
  validate([
    body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be 5-100 characters'),
    body('description').trim().isLength({ min: 20, max: 1000 }).withMessage('Description must be 20-1000 characters'),
    body('category').isIn(VALID_CATEGORIES).withMessage('Invalid category'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    body('otp').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Invalid OTP'),
  ]),
  submitComplaint
);

router.post('/:id/upvote', protectUser, upvoteComplaint);

module.exports = router;