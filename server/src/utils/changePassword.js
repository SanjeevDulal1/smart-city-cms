require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const change = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const admin = await Admin.findOne({ role: 'super_admin' });
  admin.password = 'YourNewStrongPassword@2026';
  await admin.save();
  console.log('Password changed successfully!');
  process.exit(0);
};

change().catch(console.error);