const express = require('express');
const router  = express.Router();
const {
  getSettings,
  updateSetting,
  getPublicSettings,
} = require('../controllers/settingController');
const { protectAdmin, requireSuperAdmin } = require('../middleware/auth');

router.get('/public',   getPublicSettings);
router.get('/',         protectAdmin, requireSuperAdmin, getSettings);
router.put('/update',   protectAdmin, requireSuperAdmin, updateSetting);

module.exports = router;