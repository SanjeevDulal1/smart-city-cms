require('dotenv').config();
const mongoose = require('mongoose');
const Setting  = require('../models/Setting');

const seedSettings = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Setting.findOneAndUpdate(
    { key: 'demo_mode' },
    {
      key:   'demo_mode',
      value: true,
      label: 'Demo Mode — allows complaints from outside KMC',
    },
    { upsert: true }
  );

  console.log('✅ Default settings seeded!');
  console.log('   demo_mode = true (anyone can submit from anywhere)');
  process.exit(0);
};

seedSettings().catch(console.error);