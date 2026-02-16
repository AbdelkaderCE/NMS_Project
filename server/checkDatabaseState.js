import mongoose from 'mongoose';
import Staff from './models/Staff.js';
import Child from './models/Child.js';
import Attendance from './models/Attendance.js';

const checkDatabase = async () => {
  try {
    // Connect to the SAME database as setup script
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nms-dev';
    console.log('🔌 Connecting to:', MONGODB_URI);
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Staff with assigned classes
    console.log('═══════════════════════════════════════');
    console.log('📊 STAFF CHECK');
    console.log('═══════════════════════════════════════');
    const staff = await Staff.find().populate('user assignedClasses');
    console.log(`Total staff: ${staff.length}`);
    
    for (const s of staff) {
      console.log(`\n👤 ${s.user?.firstName} ${s.user?.lastName}`);
      console.log(`   Position: ${s.position}`);
      console.log(`   User ID: ${s.user?._id}`);
      console.log(`   Assigned Classes: ${s.assignedClasses?.length || 0}`);
      if (s.assignedClasses?.length > 0) {
        s.assignedClasses.forEach(c => {
          console.log(`      - ${c.name} (${c._id})`);
        });
      }
    }

    // Check Children
    console.log('\n═══════════════════════════════════════');
    console.log('📊 CHILDREN CHECK');
    console.log('═══════════════════════════════════════');
    const children = await Child.find().populate('assignedClass');
    console.log(`Total children: ${children.length}`);
    
    const childrenByClass = {};
    for (const child of children) {
      const className = child.assignedClass?.name || 'No Class';
      if (!childrenByClass[className]) {
        childrenByClass[className] = [];
      }
      childrenByClass[className].push(child);
    }
    
    Object.keys(childrenByClass).forEach(className => {
      console.log(`\n📚 ${className}: ${childrenByClass[className].length} children`);
      childrenByClass[className].slice(0, 3).forEach(c => {
        console.log(`   - ${c.firstName} ${c.lastName} (${c._id})`);
      });
    });

    // Check Attendance
    console.log('\n═══════════════════════════════════════');
    console.log('📊 ATTENDANCE CHECK');
    console.log('═══════════════════════════════════════');
    const today = new Date().toISOString().split('T')[0];
    const attendanceDate = new Date(today + 'T00:00:00.000Z');
    const nextDay = new Date(attendanceDate);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    
    console.log(`Looking for attendance on: ${today}`);
    console.log(`Date range: ${attendanceDate.toISOString()} to ${nextDay.toISOString()}`);
    
    const allAttendance = await Attendance.find().populate('child');
    console.log(`\nTotal attendance records (all time): ${allAttendance.length}`);
    
    const todayAttendance = await Attendance.find({
      date: { $gte: attendanceDate, $lt: nextDay }
    }).populate('child');
    console.log(`Attendance records for today: ${todayAttendance.length}`);
    
    if (todayAttendance.length > 0) {
      console.log('\n📋 Today\'s attendance:');
      todayAttendance.forEach(att => {
        console.log(`   - ${att.child?.firstName} ${att.child?.lastName}: ${att.status} (${att.date.toISOString()})`);
      });
    }

    // Show last 5 attendance records
    const recentAttendance = await Attendance.find()
      .populate('child')
      .sort({ createdAt: -1 })
      .limit(5);
    
    if (recentAttendance.length > 0) {
      console.log('\n📋 Last 5 attendance records:');
      recentAttendance.forEach(att => {
        console.log(`   - ${att.child?.firstName} ${att.child?.lastName}: ${att.status}`);
        console.log(`     Date: ${att.date.toISOString()}`);
        console.log(`     Created: ${att.createdAt?.toISOString() || 'N/A'}`);
      });
    }

    console.log('\n═══════════════════════════════════════');
    console.log('✅ Database check complete!');
    console.log('═══════════════════════════════════════\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

checkDatabase();
