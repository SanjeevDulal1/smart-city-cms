const express = require('express');
const router = express.Router();
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

router.get('/map', getMapComplaints);
router.get('/mine', protectUser, getMyComplaints);
router.get('/:id', getComplaintById);
router.post('/request-otp', protectUser, otpLimiter, requestComplaintOTP);
router.post(
  '/submit',
  protectUser,
  upload.array('photos', 3),
  submitComplaint
);
router.post('/:id/upvote', protectUser, upvoteComplaint);

module.exports = router;