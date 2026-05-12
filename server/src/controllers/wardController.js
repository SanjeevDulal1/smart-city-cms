const Ward = require('../models/Ward');
const Complaint = require('../models/Complaint');

const getAllWards = async (req, res) => {
  try {
    const wards = await Ward.find({ isActive: true }).lean();
    res.json({ success: true, wards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWardStats = async (req, res) => {
  try {
    const { wardId } = req.params;

    const [pending, inProgress, resolved, total] = await Promise.all([
      Complaint.countDocuments({ ward: wardId, status: 'pending' }),
      Complaint.countDocuments({ ward: wardId, status: 'in_progress' }),
      Complaint.countDocuments({ ward: wardId, status: 'resolved' }),
      Complaint.countDocuments({ ward: wardId }),
    ]);

    res.json({ success: true, stats: { pending, inProgress, resolved, total } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createWard = async (req, res) => {
  try {
    const { name, wardNumber, latitude, longitude, city } = req.body;
    const ward = await Ward.create({
      name,
      wardNumber,
      city: city || 'Kathmandu',
      centerCoordinates: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
    });
    res.status(201).json({ success: true, ward });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateWard = async (req, res) => {
  try {
    const ward = await Ward.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!ward) return res.status(404).json({ success: false, message: 'Ward not found.' });
    res.json({ success: true, ward });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteWard = async (req, res) => {
  try {
    const ward = await Ward.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!ward) return res.status(404).json({ success: false, message: 'Ward not found.' });
    res.json({ success: true, message: 'Ward deactivated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllWards, getWardStats, createWard, updateWard, deleteWard };