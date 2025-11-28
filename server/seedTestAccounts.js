import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Staff from './models/Staff.js';
import { ROLES, STAFF_POSITION } from './utils/constants.js';

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
    firstName: 'John',
    lastName: 'Teacher',
    email: 'teacher@nursery.com',
    password: 'teacher123',
    phone: '+1234567891',
    role: ROLES.STAFF,
    staffData: {
      position: STAFF_POSITION.TEACHER,
      employeeId: 'EMP001',
      department: 'Education',
      hireDate: new Date('2024-01-15'),
      salary: { amount: 45000, payFrequency: 'annually' },
      qualifications: [
        { degree: 'Bachelor', institution: 'NYU', year: 2020, field: 'Early Childhood Education' }
      ],
      certifications: [
        { name: 'Early Childhood Certification', issuedBy: 'State Board', issuedDate: new Date('2020-06-01') }
      ],
    },
    address: {
      street: '456 Teacher Avenue',
      city: 'New York',
      state: 'NY',
      zipCode: '10002',
      country: 'USA',
    },
  },
  {
    firstName: 'Sarah',
    lastName: 'Assistant',
    email: 'assistant@nursery.com',
    password: 'assistant123',
    phone: '+1234567892',
    role: ROLES.STAFF,
    staffData: {
      position: STAFF_POSITION.ASSISTANT,
      employeeId: 'EMP002',
      department: 'Education',
      hireDate: new Date('2024-02-01'),
      salary: { amount: 35000, payFrequency: 'annually' },
      qualifications: [
        { degree: 'Associate', institution: 'Community College', year: 2022, field: 'Child Care' }
      ],
    },
    address: {
      street: '789 Assistant Road',
      city: 'New York',
      state: 'NY',
      zipCode: '10003',
      country: 'USA',
    },
  },
  {
    firstName: 'Michael',
    lastName: 'Manager',
    email: 'manager@nursery.com',
    password: 'manager123',
    phone: '+1234567893',
    role: ROLES.STAFF,
    staffData: {
      position: STAFF_POSITION.MANAGER,
      employeeId: 'EMP003',
      department: 'Administration',
      hireDate: new Date('2023-09-01'),
      salary: { amount: 60000, payFrequency: 'annually' },
      qualifications: [
        { degree: 'MBA', institution: 'Columbia University', year: 2019, field: 'Education Management' }
      ],
      certifications: [
        { name: 'Child Care Director Certificate', issuedBy: 'State Board', issuedDate: new Date('2019-08-01') }
      ],
    },
    address: {
      street: '321 Manager Boulevard',
      city: 'New York',
      state: 'NY',
      zipCode: '10004',
      country: 'USA',
    },
  },
  {
    firstName: 'Emily',
    lastName: 'Nurse',
    email: 'nurse@nursery.com',
    password: 'nurse123',
    phone: '+1234567894',
    role: ROLES.STAFF,
    staffData: {
      position: STAFF_POSITION.NURSE,
      employeeId: 'EMP004',
      department: 'Health Services',
      hireDate: new Date('2024-03-10'),
      salary: { amount: 50000, payFrequency: 'annually' },
      qualifications: [
        { degree: 'BSN', institution: 'Mount Sinai School of Nursing', year: 2021, field: 'Nursing' }
      ],
      certifications: [
        { name: 'Registered Nurse (RN)', issuedBy: 'State Nursing Board', issuedDate: new Date('2021-05-15') },
        { name: 'Pediatric Nursing Certification', issuedBy: 'PNCB', issuedDate: new Date('2022-03-01') }
      ],
    },
    address: {
      street: '654 Nurse Lane',
      city: 'New York',
      state: 'NY',
      zipCode: '10005',
      country: 'USA',
    },
  },
  {
    firstName: 'Lisa',
    lastName: 'Receptionist',
    email: 'receptionist@nursery.com',
    password: 'receptionist123',
    phone: '+1234567895',
    role: ROLES.STAFF,
    staffData: {
      position: STAFF_POSITION.RECEPTIONIST,
      employeeId: 'EMP005',
      department: 'Front Desk',
      hireDate: new Date('2024-04-01'),
      salary: { amount: 32000, payFrequency: 'annually' },
      qualifications: [
        { degree: 'Certificate', institution: 'Business School', year: 2023, field: 'Office Administration' }
      ],
    },
    address: {
      street: '987 Reception Drive',
      city: 'New York',
      state: 'NY',
      zipCode: '10006',
      country: 'USA',
    },
  },
  {
    firstName: 'Parent',
    lastName: 'User',
    email: 'parent@nursery.com',
    password: 'parent123',
    phone: '+1234567896',
    role: ROLES.PARENT,
    address: {
      street: '147 Parent Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10007',
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
    const testEmails = testAccounts.map(account => account.email);
    await User.deleteMany({ email: { $in: testEmails } });
    
    // Delete existing staff records for these emails and users (defensive)
    const existingUsers = await User.find({ email: { $in: testEmails } });
    const userIds = existingUsers.map(u => u._id);
    await Staff.deleteMany({ $or: [ { user: { $in: userIds } }, { email: { $in: testEmails } } ] });

    // Create test accounts
    console.log('📝 Creating test accounts...\n');
    
    // Helper to ensure unique employeeId if duplicates exist
    const ensureUniqueEmployeeId = async (desiredId) => {
      let eid = desiredId || `EMP${Math.floor(100 + Math.random()*900)}`;
      let counter = 1;
      while (await Staff.findOne({ employeeId: eid })) {
        eid = `${desiredId || 'EMP'}${String(100 + Math.floor(Math.random()*900))}${counter}`;
        counter++;
      }
      return eid;
    };

    for (const accountData of testAccounts) {
      const { staffData, ...userData } = accountData;
      
      // Create user account
      const user = await User.create(userData);
      console.log(`✅ Created ${user.role.toUpperCase()} account:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${accountData.password}`);
      console.log(`   Name: ${user.fullName}`);
      
      // If staff member, create staff record
      if (user.role === ROLES.STAFF && staffData) {
        // Ensure employeeId uniqueness to avoid duplicate key errors
        const uniqueEmployeeId = await ensureUniqueEmployeeId(staffData.employeeId);
        const staff = await Staff.create({
          user: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          ...staffData,
          employeeId: uniqueEmployeeId,
        });
        console.log(`   Position: ${staff.position.toUpperCase()}`);
        console.log(`   Employee ID: ${staff.employeeId}`);
      }
      
      console.log('');
    }

    console.log('✨ Seed completed successfully!\n');
    console.log('📋 Test Accounts Summary:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ADMIN:        admin@nursery.com        / admin123');
    console.log('TEACHER:      teacher@nursery.com      / teacher123');
    console.log('ASSISTANT:    assistant@nursery.com    / assistant123');
    console.log('MANAGER:      manager@nursery.com      / manager123');
    console.log('NURSE:        nurse@nursery.com        / nurse123');
    console.log('RECEPTIONIST: receptionist@nursery.com / receptionist123');
    console.log('PARENT:       parent@nursery.com       / parent123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed
seedTestAccounts();
