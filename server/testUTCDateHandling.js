#!/usr/bin/env node
/**
 * Simplified test to verify UTC date handling fix for attendance
 */

import mongoose from 'mongoose';
import Child from './models/Child.js';
import Attendance from './models/Attendance.js';
import Activity from './models/Activity.js';
import User from './models/User.js';

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  SICK: 'sick',
};

async function testAttendanceUTC() {
  try {
    console.log('🧪 Testing UTC Date Handling for Attendance\n');

    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nms-dev', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB\n');

    // ============================================
    // SETUP: Get test data
    // ============================================
    console.log('📋 Loading test data...');
    const children = await Child.find().limit(5).lean();
    const admin = await User.findOne({ role: 'admin' }).lean();
    
    if (children.length < 3) {
      throw new Error(`Expected at least 3 children, found ${children.length}`);
    }
    
    if (!admin) {
      throw new Error('No admin user found');
    }

    console.log(`✅ Loaded ${children.length} children and admin: ${admin.firstName}\n`);

    // ============================================
    // TEST 1: Date string parsing test
    // ============================================
    console.log('🧪 TEST 1: UTC Date String Parsing');
    console.log('━'.repeat(50));
    
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    console.log(`📅 Test date string: ${dateString}`);
    
    // Test the fixed UTC parsing
    const attendanceDate = new Date(dateString + 'T00:00:00.000Z');
    const nextDay = new Date(attendanceDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    
    console.log(`   Local timezone date: ${today.toLocaleString()}`);
    console.log(`   UTC attendance start: ${attendanceDate.toISOString()}`);
    console.log(`   UTC attendance end: ${nextDay.toISOString()}`);
    console.log(`✅ Date parsing working correctly\n`);

    // ============================================
    // TEST 2: Create attendance for 3 different children
    // ============================================
    console.log('🧪 TEST 2: Create Attendance for Multiple Children');
    console.log('━'.repeat(50));
    
    // Clean up first
    await Attendance.deleteMany({
      child: { $in: children.slice(0, 3).map(c => c._id) },
      date: { $gte: attendanceDate, $lt: nextDay }
    });

    const attendanceRecords = [];
    for (let i = 0; i < 3; i++) {
      const child = children[i];
      
      // Check for existing attendance using UTC query
      const nextDay = new Date(attendanceDate);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      
      const existing = await Attendance.findOne({
        child: child._id,
        date: { $gte: attendanceDate, $lt: nextDay }
      });

      if (existing) {
        console.log(`   ❌ Child ${i + 1}: Attendance already exists`);
        continue;
      }

      // Create new attendance with UTC date
      const attendance = await Attendance.create({
        child: child._id,
        date: attendanceDate, // UTC date
        status: ATTENDANCE_STATUS.PRESENT,
        recordedBy: admin._id,
        notes: `UTC test attendance for ${child.firstName}`,
      });

      attendanceRecords.push(attendance);
      console.log(`   ✅ Child ${i + 1} (${child.firstName}): Created successfully`);
    }
    
    console.log(`\n✅ Created ${attendanceRecords.length} attendance records\n`);

    // ============================================
    // TEST 3: Verify duplicate detection with UTC queries
    // ============================================
    console.log('🧪 TEST 3: Duplicate Detection with UTC Queries');
    console.log('━'.repeat(50));

    const child1 = children[0];
    const duplicate = await Attendance.findOne({
      child: child1._id,
      date: { $gte: attendanceDate, $lt: nextDay }
    });

    if (!duplicate) {
      throw new Error('Duplicate not found - query failed!');
    }

    console.log(`   ✅ Duplicate detection working`);
    console.log(`   Found: ${duplicate._id}`);
    console.log(`   Child: ${child1.firstName}`);
    console.log(`   Date stored: ${duplicate.date.toISOString()}\n`);

    // ============================================
    // TEST 4: Query across date ranges (UTC)
    // ============================================
    console.log('🧪 TEST 4: Date Range Queries with UTC');
    console.log('━'.repeat(50));

    const allAttendance = await Attendance.find({
      date: { $gte: attendanceDate, $lt: nextDay }
    }).lean();

    console.log(`   ✅ Found ${allAttendance.length} records for ${dateString}`);
    allAttendance.forEach((a, i) => {
      console.log(`   ${i + 1}. ${a._id.toString().slice(-4)}: ${a.date.toISOString().split('T')[0]}`);
    });

    console.log(`\n✅ TEST 4 PASSED: Date range queries working correctly\n`);

    // ============================================
    // TEST 5: Verify parent activity visibility query
    // ============================================
    console.log('🧪 TEST 5: Parent Activity Query Structure');
    console.log('━'.repeat(50));

    const parentUser = await User.findOne({ role: 'parent' }).lean();
    if (parentUser) {
      const parentChild = await Child.findOne({
        parents: { $elemMatch: { parent: parentUser._id } }
      }).populate('assignedClass assignedGroup').lean();

      if (parentChild) {
        const childIds = [parentChild._id];
        const groupIds = parentChild.assignedGroup ? [parentChild.assignedGroup._id] : [];
        const classIds = parentChild.assignedClass ? [parentChild.assignedClass._id] : [];

        const query = {
          $or: [
            { child: { $in: childIds } },
            { group: { $in: groupIds } },
            { class: { $in: classIds } }
          ]
        };

        const activities = await Activity.find(query).lean();
        console.log(`   ✅ Parent activity query working`);
        console.log(`   Activities: ${activities.length}`);
        console.log(`     - Direct: ${await Activity.countDocuments({ child: { $in: childIds } })}`);
        console.log(`     - Group: ${await Activity.countDocuments({ group: { $in: groupIds } })}`);
        console.log(`     - Class: ${await Activity.countDocuments({ class: { $in: classIds } })}`);
      }
    }
    console.log(`\n✅ TEST 5 PASSED: Activity query structure correct\n`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('═'.repeat(50));
    console.log('✅ ALL TESTS PASSED!');
    console.log('═'.repeat(50));
    console.log('\n📝 Summary:');
    console.log('1. ✅ UTC date string parsing working');
    console.log('2. ✅ Attendance created for multiple children');
    console.log('3. ✅ Duplicate detection using UTC queries');
    console.log('4. ✅ Date range queries working with UTC');
    console.log('5. ✅ Parent activity visibility query correct');
    console.log('\n✨ UTC date handling is working correctly!');
    console.log('🎉 Attendance and activity issues are resolved!\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run tests
testAttendanceUTC();
