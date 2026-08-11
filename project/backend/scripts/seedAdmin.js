/**
 * Seed Admin User Script
 * Run: node scripts/seedAdmin.js
 * Creates default admin: admin@codelearn.com / admin-pwd
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ADMIN_EMAIL = 'admin@codelearn.com';
const ADMIN_PASSWORD = 'admin' + '123';
const ADMIN_USERNAME = 'admin';

async function seed() {
  console.log('\n🔑 CodeLearn – Admin Seed Script');
  console.log('================================');
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/codelearn');
    console.log('✅ MongoDB connected');

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      // Update role to admin and reset password in case it was changed
      const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await User.findByIdAndUpdate(existing._id, {
        role: 'admin',
        password: hashed,
        isBlocked: false,
      });
      console.log(`✅ Admin user already exists — role & password reset to defaults.`);
      console.log(`   Email   : ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    } else {
      const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await User.create({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: hashed,
        role: 'admin',
        isEmailVerified: true,
        isBlocked: false,
      });
      console.log(`✅ Admin user created successfully!`);
      console.log(`   Email   : ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    }

    console.log('\n🚀 You can now log in at: http://localhost:5173/admin/login');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected\n');
    process.exit(0);
  }
}

seed();
