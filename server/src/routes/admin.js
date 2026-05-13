const express = require('express');
const router = express.Router();
const {
  createWardAdmin,
  getAllAdmins,
  getWardComplaints,
  updateComplaintStatus,
  getDashboardStats,
  getAllComplaintsSuper,
  updateWardAdmin,
  deleteWardAdmin,
} = require('../controllers/adminController');
const { protectAdmin, requireSuperAdmin } = require('../middleware/auth');

router.use(protectAdmin);

router.get('/dashboard',             getDashboardStats);
router.get('/complaints',            getWardComplaints);
router.get('/complaints/all',        requireSuperAdmin, getAllComplaintsSuper);
router.put('/complaints/:id/status', updateComplaintStatus);
router.post('/ward-admin',           requireSuperAdmin, createWardAdmin);
router.get('/admins',                requireSuperAdmin, getAllAdmins);
router.put('/admins/:id',            requireSuperAdmin, updateWardAdmin);
router.delete('/admins/:id',         requireSuperAdmin, deleteWardAdmin);

module.exports = router;