const Admin = require('../models/Admin');
const Complaint = require('../models/Complaint');
const Ward = require('../models/Ward');

const createWardAdmin = async (req, res) => {
  try {
    const { name, email, password, wardId } = req.body;
    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists.' });
    }
    const ward = await Ward.findById(wardId);
    if (!ward) {
      return res.status(404).json({ success: false, message: 'Ward not found.' });
    }
    const admin = await Admin.create({
      name, email, password, role: 'ward_admin', ward: wardId,
    });
    res.status(201).json({
      success: true,
      message: 'Ward admin created successfully.',
      admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ role: 'ward_admin' })
      .populate('ward', 'name wardNumber')
      .select('-password')
      .lean();
    res.json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateWardAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }
    if (admin.role === 'super_admin') {
      return res.status(403).json({ success: false, message: 'Cannot modify super admin.' });
    }
    const { name, email, wardId, isActive, password } = req.body;
    if (name)                             admin.name     = name;
    if (email)                            admin.email    = email;
    if (wardId)                           admin.ward     = wardId;
    if (typeof isActive === 'boolean')    admin.isActive = isActive;
    if (password && password.length >= 8) admin.password = password;
    await admin.save();
    const updated = await Admin.findById(admin._id)
      .populate('ward', 'name wardNumber')
      .select('-password');
    res.json({ success: true, message: 'Admin updated successfully.', admin: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteWardAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found.' });
    }
    if (admin.role === 'super_admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete super admin.' });
    }
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Ward admin deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWardComplaints = async (req, res) => {
  try {
    const wardId = req.admin.role === 'super_admin'
      ? req.query.wardId
      : req.admin.ward?._id;
    if (!wardId) {
      return res.status(400).json({ success: false, message: 'Ward ID required.' });
    }
    const page     = parseInt(req.query.page)  || 1;
    const limit    = parseInt(req.query.limit) || 20;
    const skip     = (page - 1) * limit;
    const { status, category } = req.query;
    const filter = { ward: wardId };
    if (status)   filter.status   = status;
    if (category) filter.category = category;
    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('user', 'name email phone')
        .populate('ward', 'name wardNumber')
        .sort({ 'priority.score': -1, createdAt: -1 })
        .skip(skip).limit(limit).lean(),
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

// 
const updateComplaintStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    complaint.status = status;
    complaint.statusHistory.push({
      status,
      note:      note || '',
      changedBy: req.admin._id,
      changedAt: new Date(),
    });
    await complaint.save();

    // Try email notification — but don't fail if it doesn't work
    try {
      const populated = await Complaint.findById(complaint._id)
        .populate('user', 'name email');
      if (populated?.user?.email) {
        const { sendOTP } = require('../services/emailService');
        // Only send if emailService has a status notification function
        // For now just log — email notification is non-critical
        console.log(`Status updated to ${status} for complaint ${complaint._id}`);
      }
    } catch (emailErr) {
      console.error('Email notification skipped:', emailErr.message);
    }

    res.json({ success: true, message: 'Status updated successfully.', complaint });
  } catch (error) {
    console.error('Update status error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const isSuper    = req.admin.role === 'super_admin';
    const wardFilter = isSuper ? {} : { ward: req.admin.ward?._id };
    const [total, pending, inProgress, resolved, rejected, wards] = await Promise.all([
      Complaint.countDocuments(wardFilter),
      Complaint.countDocuments({ ...wardFilter, status: 'pending'      }),
      Complaint.countDocuments({ ...wardFilter, status: 'in_progress'  }),
      Complaint.countDocuments({ ...wardFilter, status: 'resolved'     }),
      Complaint.countDocuments({ ...wardFilter, status: 'rejected'     }),
      isSuper ? Ward.countDocuments({ isActive: true }) : Promise.resolve(null),
    ]);
    const topComplaints = await Complaint.find({
      ...wardFilter,
      status: { $nin: ['resolved', 'rejected'] },
    })
      .sort({ 'priority.score': -1 })
      .limit(5)
      .populate('ward', 'name')
      .populate('user', 'name')
      .select('title category status priority.score createdAt')
      .lean();
    res.json({
      success: true,
      stats:   { total, pending, inProgress, resolved, rejected, wards },
      topPriorityComplaints: topComplaints,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllComplaintsSuper = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;
    const { status, category, wardId } = req.query;
    const filter = {};
    if (status)   filter.status   = status;
    if (category) filter.category = category;
    if (wardId)   filter.ward     = wardId;
    const [complaints, total] = await Promise.all([
      Complaint.find(filter)
        .populate('user', 'name email')
        .populate('ward', 'name wardNumber')
        .sort({ 'priority.score': -1, createdAt: -1 })
        .skip(skip).limit(limit).lean(),
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

module.exports = {
  createWardAdmin,
  getAllAdmins,
  updateWardAdmin,
  deleteWardAdmin,
  getWardComplaints,
  updateComplaintStatus,
  getDashboardStats,
  getAllComplaintsSuper,
};