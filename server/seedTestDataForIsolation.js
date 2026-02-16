/**
 * Seed Test Data for Teacher Data Isolation Testing
 * Creates classes, groups, children, and linked test accounts
 * 
 * Usage: node seedTestDataForIsolation.js
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Staff from './models/Staff.js';
import Child from './models/Child.js';
import Class from './models/Class.js';
import Group from './models/Group.js';
import Attendance from './models/Attendance.js';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nms';

const seedData = async () => {
  try {
    console.log('🌱 Starting test data seeding...');
    console.log(`📊 Connecting to: ${mongoUri}`);

    await mongoose.connect(mongoUri);
    console.log('✅ Database connected');

    // Clear existing test data
    console.log('\n🗑️  Clearing existing test data...');
    await User.deleteMany({ email: { $regex: '@test\.com$' } });
    await Staff.deleteMany({});
    await Child.deleteMany({});
    await Class.deleteMany({});
    await Group.deleteMany({});
    await Attendance.deleteMany({});
    console.log('✅ Old test data cleared');

    // Create Classes First (Groups require class reference)
    console.log('\n🏫 Creating Classes...');
    const classA1 = await Class.create({
      name: 'Class A1 - Morning',
      ageRange: { minMonths: 24, maxMonths: 36 }, // 2-3 years
      monthlyFee: 4000,
      color: '#FF6B6B',
      isActive: true,
    });

    const classA2 = await Class.create({
      name: 'Class A2 - Afternoon',
      ageRange: { minMonths: 24, maxMonths: 36 }, // 2-3 years
      monthlyFee: 3500,
      color: '#FF8E72',
      isActive: true,
    });

    const classB1 = await Class.create({
      name: 'Class B1 - Morning',
      ageRange: { minMonths: 36, maxMonths: 48 }, // 3-4 years
      monthlyFee: 4500,
      color: '#4ECDC4',
      isActive: true,
    });

    const classB2 = await Class.create({
      name: 'Class B2 - Afternoon',
      ageRange: { minMonths: 36, maxMonths: 48 }, // 3-4 years
      monthlyFee: 4000,
      color: '#44A08D',
      isActive: true,
    });

    const classC1 = await Class.create({
      name: 'Class C1 - Kindergarten',
      ageRange: { minMonths: 48, maxMonths: 60 }, // 4-5 years
      monthlyFee: 5000,
      color: '#95E1D3',
      isActive: true,
    });

    console.log(`✅ Created 5 classes`);

    // Create Groups (now with class references)
    console.log('\n📚 Creating Groups...');
    const groupA = await Group.create({
      name: 'Nursery Group A',
      maxCapacity: 20,
      class: classA1._id,
      schedule: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '09:00',
        endTime: '12:00',
      },
    });

    const groupB = await Group.create({
      name: 'Nursery Group B',
      maxCapacity: 25,
      class: classB1._id,
      schedule: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '14:00',
        endTime: '17:00',
      },
    });

    const groupC = await Group.create({
      name: 'Kindergarten Group',
      maxCapacity: 25,
      class: classC1._id,
      schedule: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        startTime: '08:00',
        endTime: '13:00',
      },
    });

    console.log(`✅ Created groups: ${groupA.name}, ${groupB.name}, ${groupC.name}`);

    // Create Parents
    console.log('\n👨‍👩‍👧‍👦 Creating Parent Accounts...');
    const parents = [];
    for (let i = 1; i <= 6; i++) {
      const user = await User.create({
        firstName: `Parent ${i}`,
        lastName: 'Test',
        email: `parent-${i}@test.com`,
        password: await bcrypt.hash('password123', 10),
        role: 'parent',
        phone: `1000000${i}00`,
      });
      parents.push(user);
      console.log(`   ✅ Created: parent-${i}@test.com (password: password123)`);
    }

    // Create Teachers
    console.log('\n👨‍🏫 Creating Teacher Accounts...');
    const teachers = [];
    const teacherPositions = ['teacher', 'assistant', 'teacher'];
    const classAssignments = [
      [classA1._id, classA2._id],
      [classB1._id, classB2._id],
      [classC1._id],
    ];

    for (let i = 1; i <= 3; i++) {
      const user = await User.create({
        firstName: `Teacher ${i}`,
        lastName: 'Test',
        email: `teacher-${i}@test.com`,
        password: await bcrypt.hash('password123', 10),
        role: 'staff',
        phone: `2000000${i}00`,
      });

      const staff = await Staff.create({
        user: user._id,
        employeeId: `EMP${1000 + i}`,
        position: teacherPositions[i - 1],
        hireDate: new Date('2023-01-15'),
        department: 'education',
        qualifications: [
          {
            degree: 'Diploma',
            institution: 'Education University',
            year: 2020 + i,
            field: 'Child Education',
          },
        ],
        certifications: [
          {
            name: 'First Aid',
            issuedBy: 'Red Crescent',
            issuedDate: new Date('2023-01-15'),
            expiryDate: new Date('2026-01-15'),
            certificateNumber: `CERT${1000 + i}`,
          },
        ],
        assignedClasses: classAssignments[i - 1],
        salary: {
          amount: 25000 + i * 5000,
          currency: 'USD',
          payFrequency: 'monthly',
        },
        isCurrentlyEmployed: true,
      });

      teachers.push({ user, staff });
      console.log(`   ✅ Created: teacher-${i}@test.com (password: password123)`);
      console.log(`      Position: ${teacherPositions[i - 1]}`);
      console.log(`      Assigned Classes: ${classAssignments[i - 1].length}`);
    }

    // Create Children and link to Parents
    console.log('\n👧👦 Creating Children...');
    const classesWithChildren = [
      { class: classA1, count: 8, parentIndices: [0, 1, 2] },
      { class: classA2, count: 7, parentIndices: [1, 2, 3] },
      { class: classB1, count: 10, parentIndices: [2, 3, 4] },
      { class: classB2, count: 9, parentIndices: [3, 4, 5] },
      { class: classC1, count: 6, parentIndices: [4, 5, 0] },
    ];

    let childCount = 0;
    for (const classData of classesWithChildren) {
      for (let i = 0; i < classData.count; i++) {
        const firstName = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'Lucas'][i % 10];
        const lastName = `TestChild${classData.class.name.replace(/\s+/g, '')}`;

        // Calculate date of birth based on age range (in months)
        const ageRange = classData.class.ageRange;
        const minAge = ageRange.minMonths;
        const maxAge = ageRange.maxMonths;
        const randomAgeMonths = Math.floor(Math.random() * (maxAge - minAge + 1)) + minAge;
        const randomAgeYears = Math.floor(randomAgeMonths / 12);
        const dob = new Date();
        dob.setFullYear(dob.getFullYear() - randomAgeYears);
        dob.setMonth(Math.floor(Math.random() * 12));
        dob.setDate(Math.floor(Math.random() * 28) + 1);

        // Select random parent(s) from allowed indices
        const parentIndex = classData.parentIndices[i % classData.parentIndices.length];
        const primaryParent = parents[parentIndex];
        const secondaryParentIndex = (parentIndex + 1) % parents.length;
        const secondaryParent = parents[secondaryParentIndex];

        const child = await Child.create({
          firstName,
          lastName,
          dateOfBirth: dob,
          gender: Math.random() > 0.5 ? 'male' : 'female',
          assignedClass: classData.class._id,
          assignedGroup: groupA._id, // Default group
          classGroup: classData.class.name,
          photo: `https://i.pravatar.cc/150?img=${childCount}`,
          enrollmentDate: new Date('2024-09-01'),
          status: 'active',
          parents: [
            {
              parent: primaryParent._id,
              relationship: 'father',
              isPrimary: true,
            },
            {
              parent: secondaryParent._id,
              relationship: 'mother',
              isPrimary: false,
            },
          ],
          emergencyContacts: [
            {
              name: 'Emergency Contact 1',
              phone: '1234567890',
              relationship: 'uncle',
              isPrimary: true,
            },
          ],
          medicalInfo: {
            allergies: [],
            medications: [],
            conditions: [],
          },
          dietaryRestrictions: [],
          specialNeeds: i % 5 === 0 ? 'Requires attention' : '',
          notes: `Test child in ${classData.class.name}`,
        });

        childCount++;
      }
    }
    console.log(`✅ Created ${childCount} children`);

    // Create Attendance Records for last 7 days
    console.log('\n📋 Creating Attendance Records...');
    const children = await Child.find({});
    let attendanceCount = 0;

    for (let day = 0; day < 7; day++) {
      const date = new Date();
      date.setDate(date.getDate() - day);
      date.setHours(0, 0, 0, 0);

      for (const child of children) {
        // 80% attendance rate
        if (Math.random() > 0.2) {
          const childClass = await Class.findById(child.assignedClass);
          const assignedTeacher = await Staff.findOne({
            assignedClasses: { $in: [childClass._id] },
          });

          await Attendance.create({
            child: child._id,
            date,
            status: ['present', 'present', 'late', 'absent'][Math.floor(Math.random() * 4)],
            recordedBy: assignedTeacher._id, // Use Staff ID instead of user
            checkInTime: null,
            checkOutTime: null,
          });

          attendanceCount++;
        }
      }
    }
    console.log(`✅ Created ${attendanceCount} attendance records`);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ TEST DATA SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));

    console.log('\n📚 GROUPS (3 total)');
    console.log(`   • ${groupA.name}`);
    console.log(`   • ${groupB.name}`);
    console.log(`   • ${groupC.name}`);

    console.log('\n🏫 CLASSES (5 total)');
    console.log(`   • ${classA1.name}`);
    console.log(`   • ${classA2.name}`);
    console.log(`   • ${classB1.name}`);
    console.log(`   • ${classB2.name}`);
    console.log(`   • ${classC1.name}`);

    console.log('\n👨‍🏫 TEACHERS (3 total) - Data Isolation Testing');
    console.log('\n   Teacher 1:');
    console.log('   • Email: teacher-1@test.com');
    console.log('   • Password: password123');
    console.log('   • Position: teacher');
    console.log('   • Classes: Class A1 (Morning), Class A2 (Afternoon)');
    console.log('   • Should see: 15 children total');

    console.log('\n   Teacher 2:');
    console.log('   • Email: teacher-2@test.com');
    console.log('   • Password: password123');
    console.log('   • Position: assistant');
    console.log('   • Classes: Class B1 (Morning), Class B2 (Afternoon)');
    console.log('   • Should see: 19 children total');

    console.log('\n   Teacher 3:');
    console.log('   • Email: teacher-3@test.com');
    console.log('   • Password: password123');
    console.log('   • Position: teacher');
    console.log('   • Classes: Class C1 (Kindergarten)');
    console.log('   • Should see: 6 children total');

    console.log('\n👨‍👩‍👧‍👦 PARENTS (6 total) - Test with parent accounts');
    for (let i = 1; i <= 6; i++) {
      console.log(`   • Email: parent-${i}@test.com | Password: password123`);
    }

    console.log('\n🧪 TEST SCENARIOS');
    console.log('   1. Login as teacher-1@test.com - Should see only Class A children');
    console.log('   2. Login as teacher-2@test.com - Should see only Class B children');
    console.log('   3. Login as teacher-3@test.com - Should see only Class C children');
    console.log('   4. Try to access unauthorized child - Should get 403 Forbidden');
    console.log('   5. Try to mark attendance for unauthorized child - Should get 403');
    console.log('   6. Login as parent - Should see only their children');

    console.log('\n📊 DATA SUMMARY');
    console.log(`   • Total Groups: 3`);
    console.log(`   • Total Classes: 5`);
    console.log(`   • Total Children: ${childCount}`);
    console.log(`   • Total Teachers: 3`);
    console.log(`   • Total Parents: 6`);
    console.log(`   • Total Attendance Records: ${attendanceCount}`);

    console.log('\n' + '='.repeat(60));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

// Run seeding
seedData();
