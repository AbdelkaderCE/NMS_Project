import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Staff from './models/Staff.js';
import Child from './models/Child.js';
import Class from './models/Class.js';
import Group from './models/Group.js';
import Attendance from './models/Attendance.js';
import { ROLES, STAFF_POSITION } from './utils/constants.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nms-dev';

// Color scheme for classes
const classColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Sample first names and last names for children
const childFirstNames = [
  'Aisha', 'Ahmed', 'Fatima', 'Muhammad', 'Zainab',
  'Omar', 'Layla', 'Hassan', 'Noor', 'Ali',
  'Maryam', 'Ibrahim', 'Sara', 'Karim', 'Hana',
  'Rami', 'Dina', 'Youssef', 'Leila', 'Salim'
];

const childLastNames = [
  'Ahmed', 'Hassan', 'Mohammad', 'Ali', 'Ibrahim',
  'Khalil', 'Aziz', 'Nassar', 'Rashid', 'Saleh',
];

// Staff positions with titles
const staffPositions = [
  { position: STAFF_POSITION.TEACHER, title: 'Teacher' },
  { position: STAFF_POSITION.ASSISTANT, title: 'Teacher Assistant' },
  { position: STAFF_POSITION.MANAGER, title: 'Manager' },
  { position: STAFF_POSITION.NURSE, title: 'School Nurse' },
  { position: STAFF_POSITION.RECEPTIONIST, title: 'Receptionist' },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================


function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateEmail(firstName, lastName, suffix = '') {
  const base = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  return `${base}${suffix}@school.dev`;
}

// ============================================================
// MAIN SETUP FUNCTION
// ============================================================

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected');

    // ============================================================
    // CLEAN DATABASE
    // ============================================================
    console.log('\n🧹 Cleaning database...');
    await Promise.all([
      User.deleteMany({}),
      Staff.deleteMany({}),
      Child.deleteMany({}),
      Class.deleteMany({}),
      Group.deleteMany({}),
      Attendance.deleteMany({}),
    ]);
    console.log('✅ Database cleaned');

    // ============================================================
    // CREATE CLASSES
    // ============================================================
    console.log('\n📚 Creating classes...');
    const classData = [
      {
        name: 'Nursery A',
        description: 'Ages 1-2 years',
        ageRange: { minMonths: 12, maxMonths: 24 },
        monthlyFee: 300,
        color: classColors[0],
        isActive: true,
      },
      {
        name: 'Nursery B',
        description: 'Ages 2-3 years',
        ageRange: { minMonths: 24, maxMonths: 36 },
        monthlyFee: 350,
        color: classColors[1],
        isActive: true,
      },
      {
        name: 'Pre-K',
        description: 'Ages 3-4 years',
        ageRange: { minMonths: 36, maxMonths: 48 },
        monthlyFee: 400,
        color: classColors[2],
        isActive: true,
      },
      {
        name: 'Kindergarten',
        description: 'Ages 4-5 years',
        ageRange: { minMonths: 48, maxMonths: 60 },
        monthlyFee: 450,
        color: classColors[3],
        isActive: true,
      },
    ];

    const classes = await Class.insertMany(classData);
    console.log(`✅ Created ${classes.length} classes`);

    // ============================================================
    // CREATE ADMIN USER
    // ============================================================
    console.log('\n👨‍💼 Creating admin user...');
    const adminPassword = 'Admin@2025';

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@school.dev',
      password: adminPassword,
      phone: '+966501234567',
      role: ROLES.ADMIN,
      address: {
        street: '123 Main Street',
        city: 'Riyadh',
        state: 'Riyadh',
        zipCode: '12345',
        country: 'Saudi Arabia',
      },
      isActive: true,
    });

    console.log('✅ Admin user created');
    console.log(`📧 Email: admin@school.dev`);
    console.log(`🔐 Password: ${adminPassword}`);

    // ============================================================
    // CREATE STAFF USERS (one per position)
    // ============================================================
    console.log('\n👥 Creating staff users...');
    const staffUsers = [];
    const staffRecords = [];

    for (let i = 0; i < staffPositions.length; i++) {
      const { position, title } = staffPositions[i];
      const firstName = `Staff${i + 1}`;
      const lastName = 'User';
      const password = `Staff${position}@2025`;

      // Create user (password will be hashed by pre-save hook)
      const user = await User.create({
        firstName,
        lastName,
        email: generateEmail(firstName, lastName),
        password,
        phone: `+96650123456${i}`,
        role: ROLES.STAFF,
        address: {
          street: `${100 + i} School Street`,
          city: 'Riyadh',
          state: 'Riyadh',
          zipCode: '12345',
          country: 'Saudi Arabia',
        },
        isActive: true,
      });

      // Create staff record
      const staff = await Staff.create({
        user: user._id,
        employeeId: `EMP${String(1000 + i).slice(-3)}`,
        position,
        department: 'Education',
        hireDate: new Date('2024-01-15'),
        employmentType: 'full-time',
        // Assign all classes to the first teacher (position: 'teacher')
        assignedClasses: position === 'teacher' ? classes.map(c => c._id) : [],
        qualifications: [
          {
            degree: 'Bachelor',
            institution: 'University of Education',
            year: 2020,
            field: 'Early Childhood Education',
          },
        ],
        certifications: [
          {
            name: `${title} Certification`,
            issuedBy: 'Ministry of Education',
            issuedDate: new Date('2020-06-01'),
            expiryDate: new Date('2028-06-01'),
            certificateNumber: `CERT-${1000 + i}`,
          },
        ],
        salary: {
          amount: 3000 + i * 500,
          currency: 'SAR',
          payFrequency: 'monthly',
        },
        schedule: {
          workDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
          startTime: '08:00',
          endTime: '16:00',
        },
        isActive: true,
      });

      staffUsers.push(user);
      staffRecords.push(staff);

      console.log(`✅ ${title} created`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🔐 Password: ${password}`);
      if (position === 'teacher') {
        console.log(`   📚 Assigned Classes: ${classes.length} (all classes)`);
      }
    }

    // ============================================================
    // CREATE GROUPS
    // ============================================================
    console.log('\n👥 Creating groups...');
    const groups = [];
    for (let classIdx = 0; classIdx < classes.length; classIdx++) {
      const classRef = classes[classIdx];
      for (let groupIdx = 0; groupIdx < 2; groupIdx++) {
        const teacher = staffUsers[0]; // First staff as teacher
        const group = await Group.create({
          name: `${classRef.name} - Group ${String.fromCharCode(65 + groupIdx)}`,
          class: classRef._id,
          teacher: teacher._id,
          maxCapacity: 15,
          currentEnrollment: 0,
          schedule: {
            startDate: new Date('2024-09-01'),
            endDate: new Date('2025-06-30'),
            meetingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            startTime: '09:00',
            endTime: '12:00',
          },
          isActive: true,
        });
        groups.push(group);
      }
    }
    console.log(`✅ Created ${groups.length} groups`);

    // ============================================================
    // CREATE PARENT & CHILDREN
    // ============================================================
    console.log('\n👨‍👩‍👧 Creating parents and children...');
    const parentPassword = 'Parent@2025';

    // Create one main parent
    const parent = await User.create({
      firstName: 'John',
      lastName: 'Developer',
      email: 'parent@school.dev',
      password: parentPassword,
      phone: '+966501111111',
      role: ROLES.PARENT,
      address: {
        street: '456 Family Lane',
        city: 'Riyadh',
        state: 'Riyadh',
        zipCode: '12345',
        country: 'Saudi Arabia',
      },
      isActive: true,
    });

    console.log('✅ Main parent user created');
    console.log(`📧 Email: parent@school.dev`);
    console.log(`🔐 Password: ${parentPassword}`);

    // Create children for the parent (4 children across different classes)
    const children = [];
    const childrenPerClass = Math.ceil(4 / classes.length);
    let childCount = 0;

    for (let classIdx = 0; classIdx < classes.length && childCount < 4; classIdx++) {
      const classRef = classes[classIdx];
      const assignedGroups = groups.filter(g => g.class.toString() === classRef._id.toString());
      const group = assignedGroups[0];

      for (let j = 0; j < childrenPerClass && childCount < 4; j++) {
        const firstName = getRandomElement(childFirstNames);
        const lastName = getRandomElement(childLastNames);
        
        // Calculate age based on class
        const minMonths = classRef.ageRange.minMonths;
        const maxMonths = classRef.ageRange.maxMonths;
        const birthMonthsAgo = minMonths + Math.floor(Math.random() * (maxMonths - minMonths));
        const birthDate = new Date();
        birthDate.setMonth(birthDate.getMonth() - birthMonthsAgo);

      const child = await Child.create({
        firstName,
        lastName,
        dateOfBirth: birthDate,
        gender: Math.random() > 0.5 ? 'male' : 'female',
        assignedClass: classRef._id,
        assignedGroup: group._id,
        parents: [
          {
            parent: parent._id,
            relationship: 'father',
            isPrimary: true,
          },
        ],
        specialNeeds: '',
        status: 'active',
        enrollmentDate: new Date('2024-09-01'),
        medicalInfo: {
          bloodType: 'O+',
          allergies: [],
          chronicConditions: [],
          vaccinations: 'All up to date',
        },
      });        children.push(child);
        childCount++;
      }
    }

    console.log(`✅ Created ${children.length} children for parent`);
    children.forEach(child => {
      console.log(`   👧 ${child.firstName} ${child.lastName}`);
    });

    // ============================================================
    // CREATE ADDITIONAL CHILDREN (for broader testing)
    // ============================================================
    console.log('\n👧 Creating additional children (without specific parent)...');
    let additionalChildren = [];
    const remainingChildren = 12; // 4 from main parent + 12 more = 16 total

    for (let i = 0; i < remainingChildren; i++) {
      const classIdx = Math.floor(Math.random() * classes.length);
      const classRef = classes[classIdx];
      const assignedGroups = groups.filter(g => g.class.toString() === classRef._id.toString());
      const group = assignedGroups[Math.floor(Math.random() * assignedGroups.length)];

      const firstName = getRandomElement(childFirstNames);
      const lastName = getRandomElement(childLastNames);

      // Random birth date within class age range
      const minMonths = classRef.ageRange.minMonths;
      const maxMonths = classRef.ageRange.maxMonths;
      const birthMonthsAgo = minMonths + Math.floor(Math.random() * (maxMonths - minMonths));
      const birthDate = new Date();
      birthDate.setMonth(birthDate.getMonth() - birthMonthsAgo);

      // Create another parent for this child for diversity
      const otherParentPassword = `Parent${i}@2025`;
      const otherParent = await User.create({
        firstName: `Parent${i}`,
        lastName: 'Test',
        email: `parent${i}@school.dev`,
        password: otherParentPassword,
        phone: `+96650200000${i}`,
        role: ROLES.PARENT,
        address: {
          street: `${200 + i} Family Street`,
          city: 'Riyadh',
          state: 'Riyadh',
          zipCode: '12345',
          country: 'Saudi Arabia',
        },
        isActive: true,
      });

      const child = await Child.create({
        firstName,
        lastName,
        dateOfBirth: birthDate,
        gender: Math.random() > 0.5 ? 'male' : 'female',
        assignedClass: classRef._id,
        assignedGroup: group._id,
        parents: [
          {
            parent: otherParent._id,
            relationship: 'mother',
            isPrimary: true,
          },
        ],
        specialNeeds: '',
        status: 'active',
        enrollmentDate: new Date('2024-09-01'),
        medicalInfo: {
          bloodType: 'O+',
          allergies: [],
          chronicConditions: [],
          vaccinations: 'All up to date',
        },
      });

      additionalChildren.push(child);
    }

    console.log(`✅ Created ${additionalChildren.length} additional children`);

    // ============================================================
    // CREATE ATTENDANCE RECORDS
    // ============================================================
    console.log('\n📋 Creating attendance records...');
    const allChildren = [...children, ...additionalChildren];
    let attendanceCount = 0;

    const today = new Date();
    const pastDays = 10; // Last 10 school days

    for (let d = pastDays; d > 0; d--) {
      const attendanceDate = new Date(today);
      attendanceDate.setDate(attendanceDate.getDate() - d);

      // Skip weekends
      if (attendanceDate.getDay() === 0 || attendanceDate.getDay() === 6) continue;

      for (const child of allChildren) {
        const status = ['present', 'absent', 'late', 'sick'][Math.floor(Math.random() * 4)];

        await Attendance.create({
          child: child._id,
          date: attendanceDate,
          status,
          notes: status !== 'present' ? `Child was ${status}` : undefined,
          recordedBy: staffUsers[0]._id,
        });

        attendanceCount++;
      }
    }

    console.log(`✅ Created ${attendanceCount} attendance records`);

    // ============================================================
    // DISPLAY SUMMARY
    // ============================================================
    console.log('\n');
    console.log('════════════════════════════════════════════════════════════');
    console.log('           🎉 DATABASE SETUP COMPLETE 🎉');
    console.log('════════════════════════════════════════════════════════════');

    console.log('\n📊 SUMMARY:');
    console.log(`   • Classes: ${classes.length}`);
    console.log(`   • Groups: ${groups.length}`);
    console.log(`   • Admin: 1`);
    console.log(`   • Staff Members: ${staffUsers.length} (one per position)`);
    console.log(`   • Parents: ${1 + additionalChildren.length}`);
    console.log(`   • Children: ${allChildren.length}`);
    console.log(`   • Attendance Records: ${attendanceCount}`);

    console.log('\n');
    console.log('🔑 TEST ACCOUNTS:');
    console.log('────────────────────────────────────────────────────────────');
    console.log('\n👨‍💼 ADMIN:');
    console.log(`   Email: admin@school.dev`);
    console.log(`   Password: Admin@2025`);

    console.log('\n👥 STAFF MEMBERS (one per position):');
    staffUsers.forEach((user, idx) => {
      const { position } = staffPositions[idx];
      const password = `Staff${position}@2025`;
      console.log(`\n   ${staffPositions[idx].title}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${password}`);
    });

    console.log('\n👨‍👩‍👧 MAIN PARENT (with 4 children):');
    console.log(`   Email: parent@school.dev`);
    console.log(`   Password: ${parentPassword}`);
    console.log(`   Children: ${children.map(c => `${c.firstName} ${c.lastName}`).join(', ')}`);

    console.log('\n👨‍👩‍👧 ADDITIONAL TEST PARENTS:');
    for (let i = 0; i < additionalChildren.length; i++) {
      console.log(`   Parent${i}: parent${i}@school.dev / Parent${i}@2025`);
    }

    console.log('\n');
    console.log('════════════════════════════════════════════════════════════');
    console.log('\n✨ Ready for development and testing!');
    console.log('Database: nms-dev');
    console.log('Node: Start your server with npm run dev');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();
