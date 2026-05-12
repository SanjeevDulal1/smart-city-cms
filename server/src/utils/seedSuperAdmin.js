require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await Admin.findOne({ role: 'super_admin' });
  if (existing) {
    console.log('Super admin already exists:', existing.email);
    process.exit(0);
  }

  await Admin.create({
    name: 'Super Admin',
    email: 'superadmin@smartcity.com',
    password: 'Admin@12345',
    role: 'super_admin',
  });

  console.log('Super admin created!');
  console.log('Email: superadmin@smartcity.com');
  console.log('Password: Admin@12345');
  console.log('IMPORTANT: Change this password after first login!');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});