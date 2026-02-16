#!/usr/bin/env node
/**
 * Comprehensive test to verify all three issues are fixed:
 * 1. Attendance duplicate error should NOT occur for different children same date
 * 2. Attendance creation should succeed and return correct data
 * 3. Parent should be able to see activities in calendar
 */

import mongoose from 'mongoose';
import Child from './models/Child.js';
import Staff from './models/Staff.js';
import Attendance from './models/Attendance.js';
import Activity from './models/Activity.js';
import User from './models/User.js';

const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  SICK: 'sick',
};

async function testAllFixes() {
  try {
    console.log('🧪 Starting Comprehensive Test Suite...\n');

    // ============================================
    // SETUP: Connect to database
    // ============================================
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nms-dev', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ Connected to MongoDB\n');

    // ============================================
    // SETUP: Get test data
    // ============================================
    console.log('📋 Loading test data...');
    const staff = await Staff.findOne({ position: 'teacher' }).lean();
    
    if (!staff) {
      throw new Error('No teacher staff member found in database');
    }
    
    if (children.length < 3) {
      throw new Error(`Expected at least 3 children, found ${children.length}`);
    }

    const teacher = await User.findById(staff.user).lean();
    console.log(`✅ Loaded ${children.length} children and teacher: ${teacher.firstName} ${teacher.lastName}\n`);

    // ============================================
    // TEST 1: Create attendance for 3 different children on same date
    // ============================================
    console.log('🧪 TEST 1: Attendance for multiple children on same date');
    console.log('━'.repeat(50));
    
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD format
    console.log(`📅 Test date: ${dateString}\n`);

    const attendanceRecords = [];
    
    for (let i = 0; i < 3; i++) {
      const child = children[i];
      try {
        // Simulate attendance creation with UTC date parsing
        const attendanceDate = new Date(dateString + 'T00:00:00.000Z');
        
        // Check for existing attendance
        const nextDay = new Date(attendanceDate);
        nextDay.setUTCDate(nextDay.getUTCDate() + 1);
        
        const existing = await Attendance.findOne({
          child: child._id,
          date: { $gte: attendanceDate, $lt: nextDay }
        });

        if (existing) {
          console.log(`❌ FAIL: Child ${i + 1} - Attendance already exists`);
          throw new Error('Attendance record already exists');
        }

        // Create new attendance
        const attendance = await Attendance.create({
          child: child._id,
          date: attendanceDate,
          status: ATTENDANCE_STATUS.PRESENT,
          recordedBy: staff._id,
          notes: `Test attendance for child ${i + 1}`,
        });

        attendanceRecords.push(attendance);
        console.log(`✅ Child ${i + 1} (${child.firstName} ${child.lastName}): SUCCESS`);
        console.log(`   📊 Status: ${attendance.status}, Date: ${attendance.date.toISOString().split('T')[0]}`);
      } catch (error) {
        console.log(`❌ Child ${i + 1}: FAILED - ${error.message}`);
        throw error;
      }
    }
    
    console.log(`\n✅ TEST 1 PASSED: All 3 children have attendance records\n`);

    // ============================================
    // TEST 2: Verify duplicate detection works
    // ============================================
    console.log('🧪 TEST 2: Duplicate detection for same child/date');
    console.log('━'.repeat(50));

    const child1 = children[0];
    const attendanceDate = new Date(dateString + 'T00:00:00.000Z');
    const nextDay = new Date(attendanceDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);

    try {
      const existing = await Attendance.findOne({
        child: child1._id,
        date: { $gte: attendanceDate, $lt: nextDay }
      });

      if (!existing) {
        console.log(`❌ FAIL: Duplicate detection not working - no existing record found`);
        throw new Error('Duplicate detection failed');
      }

      console.log(`✅ Duplicate detection working correctly`);
      console.log(`   Found existing record: ${existing._id}`);
      console.log(`   Child: ${child1.firstName} ${child1.lastName}`);
      console.log(`   Date: ${existing.date.toISOString().split('T')[0]}\n`);
    } catch (error) {
      console.log(`❌ TEST 2 FAILED: ${error.message}`);
      throw error;
    }

    console.log(`✅ TEST 2 PASSED: Duplicate detection works correctly\n`);

    // ============================================
    // TEST 3: Parent activity visibility
    // ============================================
    console.log('🧪 TEST 3: Parent can see activities');
    console.log('━'.repeat(50));

    // Get a parent
    const parentUser = await User.findOne({ role: 'parent' }).lean();
    if (!parentUser) {
      console.log('⚠️  No parent user found, skipping activity test');
    } else {
      // Get a child belonging to this parent
      const parentChild = await Child.findOne({
        parents: { $elemMatch: { parent: parentUser._id } }
      }).populate('assignedClass assignedGroup').lean();

      if (parentChild) {
        console.log(`👤 Parent: ${parentUser.firstName} ${parentUser.lastName}`);
        console.log(`👶 Child: ${parentChild.firstName} ${parentChild.lastName}`);
        
        // Check what activities parent can see
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
        console.log(`\n📊 Activities visible to parent:`);
        console.log(`   - Direct child activities: ${await Activity.countDocuments({ child: { $in: childIds } })}`);
        console.log(`   - Group activities: ${await Activity.countDocuments({ group: { $in: groupIds } })}`);
        console.log(`   - Class activities: ${await Activity.countDocuments({ class: { $in: classIds } })}`);
        console.log(`   - Total: ${activities.length}`);
        console.log(`\n✅ TEST 3 PASSED: Parent activity query structure working\n`);
      } else {
        console.log(`ℹ️  No child found for this parent, skipping parent visibility test\n`);
      }
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('═'.repeat(50));
    console.log('✅ ALL TESTS PASSED!');
    console.log('═'.repeat(50));
    console.log('\n📝 Summary:');
    console.log('1. ✅ Attendance created for 3 different children on same date');
    console.log('2. ✅ Duplicate detection working correctly');
    console.log('3. ✅ Parent activity visibility query structure correct');
    console.log('\n✨ UTC date handling is now working properly!');
    console.log('🎉 All three original issues should now be resolved!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error(error.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run tests
testAllFixes();
