const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const protectUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorised. No token.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'user') {
      return res.status(401).json({ success: false, message: 'Invalid token type.' });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found.' });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};

const protectAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorised.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'admin') {
      return res.status(401).json({ success: false, message: 'Admin access required.' });
    }
    const admin = await Admin.findById(decoded.id).populate('ward');
    if (!admin || !admin.isActive) {
      return res.status(401).json({ success: false, message: 'Admin account not found or inactive.' });
    }
    req.admin = admin;
    req.token = token;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};

const requireSuperAdmin = (req, res, next) => {
  if (req.admin?.role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Super admin access required.' });
  }
  next();
};

module.exports = { protectUser, protectAdmin, requireSuperAdmin };