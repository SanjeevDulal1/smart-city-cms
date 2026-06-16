const Complaint = require('../models/Complaint');
const Ward = require('../models/Ward');
const User = require('../models/User');
const { findNearestWard } = require('../services/haversine');
const { calculatePriority } = require('../services/priorityEngine');
const { sendOTP, verifyOTP } = require('../services/emailService');

const requestComplaintOTP = async (req, res) => {
  try {
    if (!req.user.canSubmitComplaint()) {
      const hours = process.env.COMPLAINT_COOLDOWN_HOURS || 2;
      return res.status(429).json({
        success: false,
        message: `You can only submit one complaint every ${hours} hours. Please wait.`,
      });
    }
    await sendOTP(req.user.email, 'complaint_verification');
    res.json({ success: true, message: 'OTP sent to your email. Valid for 10 minutes.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const submitComplaint = async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, address, otp } = req.body;

    // Verify OTP
    const valid = await verifyOTP(req.user.email, otp, 'complaint_verification');
    if (!valid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
    }

    // Check cooldown
    if (!req.user.canSubmitComplaint()) {
      return res.status(429).json({
        success: false,
        message: 'Cooldown period active. Please wait before submitting another complaint.',
      });
    }

    // Validate coordinates
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates.' });
    }

    // Find nearest ward using new async boundary-based method
    const ward = await findNearestWard(lat, lng);
    if (!ward) {
      return res.status(503).json({
        success: false,
        message: 'No wards configured yet. Contact admin.',
      });
    }

    console.log(`Complaint assigned to: Ward ${ward.wardNumber} - ${ward.name}`);

    // Calculate priority
    const priority = calculatePriority(category, new Date());

    // Process uploaded photos
    const photos = (req.files || []).map((file) => ({
      url:      file.path || `/uploads/${file.filename}`,
      filename: file.filename,
    }));

    // Create complaint
    const complaint = await Complaint.create({
      user:     req.user._id,
      ward:     ward._id,
      title,
      description,
      category,
      location: {
        type:        'Point',
        coordinates: [lng, lat],
        address:     address || '',
      },
      photos,
      priority,
      isVerified: true,
      statusHistory: [{
        status: 'pending',
        note:   'Complaint submitted and verified',
      }],
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      lastComplaintAt: new Date(),
      $inc: { totalComplaints: 1 },
    });

    // Return populated complaint
    const populated = await complaint.populate([
      { path: 'ward', select: 'name wardNumber' },
      { path: 'user', select: 'name email'      },
    ]);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully and assigned to the nearest ward.',
      complaint: populated,
    });
  } catch (error) {
    console.error('Submit complaint error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMapComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({
      status: { $ne: 'rejected' },
    })
      .select('location category status priority.score title createdAt')
      .lean();

    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 10;
    const skip     = (page - 1) * limit;
    const { status, category, search } = req.query;

    const filter = { user: req.user._id };
    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('ward', 'name wardNumber')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments(filter),
    ]);

    res.json({
      success: true,
      complaints,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('ward', 'name wardNumber city')
      .populate('user', 'name email')
      .populate('statusHistory.changedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const upvoteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    const userId        = req.user._id;
    const alreadyUpvoted = complaint.upvotes.includes(userId);

    if (alreadyUpvoted) {
      complaint.upvotes.pull(userId);
    } else {
      complaint.upvotes.push(userId);
    }

    await complaint.save();
    res.json({
      success:     true,
      upvoted:     !alreadyUpvoted,
      upvoteCount: complaint.upvotes.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  requestComplaintOTP,
  submitComplaint,
  getMapComplaints,
  getMyComplaints,
  getComplaintById,
  upvoteComplaint,
};