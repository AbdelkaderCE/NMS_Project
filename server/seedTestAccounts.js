import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import { ROLES } from './utils/constants.js';

// Load env vars
dotenv.config();

// Connect to DB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// Test accounts data
const testAccounts = [
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@nursery.com',
    password: 'admin123',
    phone: '+1234567890',
    role: ROLES.ADMIN,
    address: {
      street: '123 Admin Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
    },
  },
  {
    firstName: 'Staff',
    lastName: 'Member',
    email: 'staff@nursery.com',
    password: 'staff123',
    phone: '+1234567891',
    role: ROLES.STAFF,
    address: {
      street: '456 Staff Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'USA',
    },
  },
  {
    firstName: 'Parent',
    lastName: 'User',
    email: 'parent@nursery.com',
    password: 'parent123',
    phone: '+1234567892',
    role: ROLES.PARENT,
    address: {
      street: '789 Parent Road',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
      country: 'USA',
    },
  },
];

// Seed function
const seedTestAccounts = async () => {
  try {
    await connectDB();

    console.log('\n🌱 Starting seed process...\n');

    // Delete existing test accounts
    console.log('🗑️  Removing existing test accounts...');
    await User.deleteMany({ 
      email: { 
        $in: testAccounts.map(account => account.email) 
      } 
    });

    // Create test accounts
    console.log('📝 Creating test accounts...\n');
    
    for (const accountData of testAccounts) {
      const user = await User.create(accountData);
      console.log(`✅ Created ${user.role.toUpperCase()} account:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${accountData.password}`);
      console.log(`   Name: ${user.fullName}\n`);
    }

    console.log('✨ Seed completed successfully!\n');
    console.log('📋 Test Accounts Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ADMIN:  admin@nursery.com  / admin123');
    console.log('STAFF:  staff@nursery.com  / staff123');
    console.log('PARENT: parent@nursery.com / parent123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedTestAccounts();
