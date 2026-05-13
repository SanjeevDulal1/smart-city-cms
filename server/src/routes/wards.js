const express = require('express');
const router = express.Router();
const {
  getAllWards, getWardStats, createWard, updateWard, deleteWard,
} = require('../controllers/wardController');
const { protectAdmin, requireSuperAdmin } = require('../middleware/auth');

router.get('/',              getAllWards);
router.get('/:wardId/stats', protectAdmin, getWardStats);
router.post('/',             protectAdmin, requireSuperAdmin, createWard);
router.put('/:id',           protectAdmin, requireSuperAdmin, updateWard);
router.delete('/:id',        protectAdmin, requireSuperAdmin, deleteWard);

module.exports = router;