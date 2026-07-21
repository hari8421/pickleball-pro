require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function seedAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set. Add it to backend/.env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected to MongoDB: ${mongoose.connection.host}`);

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ username: 'hari' });
  if (existingAdmin) {
    console.log('Admin user "hari" already exists');
    await mongoose.disconnect();
    return;
  }

  // Create admin user
  const admin = new Admin({
    username: 'hari',
    password: 'hari',
  });

  const savedAdmin = await admin.save();
  console.log(`✓ Admin user created: ${savedAdmin.username}`);

  await mongoose.disconnect();
  console.log('Done.');
}

seedAdmin().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.disconnect();
  process.exit(1);
});

