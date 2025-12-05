import mongoose from 'mongoose';
import Attendance from './models/Attendance.js';

async function debugAttendance() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nms-dev';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    // Test date parsing like the controller does
    const testDate = '2025-12-05';
    const [year, month, day] = testDate.split('-');
    const parsedDate = new Date(year, month - 1, day, 0, 0, 0, 0);
    
    console.log('📅 Date Handling Test:');
    console.log(`Input date string: ${testDate}`);
    console.log(`Parsed as local date: ${parsedDate}`);
    console.log(`ISO string: ${parsedDate.toISOString()}`);
    console.log(`Date string for UTC query: ${parsedDate.toISOString().split('T')[0]}\n`);

    // Get today's date at start of day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('📊 Querying attendance records:');
    console.log(`Local today: ${today}`);
    console.log(`Local tomorrow: ${tomorrow}`);

    // Find all attendance records for today
    const records = await Attendance.find({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    }).populate('child', 'firstName lastName');

    console.log(`\nTotal records for today: ${records.length}\n`);
    
    if (records.length > 0) {
      records.forEach((record, idx) => {
        console.log(`${idx + 1}. Child: ${record.child?.firstName} ${record.child?.lastName}`);
        console.log(`   Stored date: ${record.date}`);
        console.log(`   ISO date: ${record.date.toISOString()}`);
        console.log(`   Status: ${record.status}`);
        console.log('');
      });
    } else {
      console.log('No records found for today\n');
    }

    // Check indexes
    const indexes = await Attendance.collection.getIndexes();
    console.log('📋 Attendance Indexes:');
    Object.entries(indexes).forEach(([name, spec]) => {
      console.log(`  ${name}: ${JSON.stringify(spec)}`);
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

debugAttendance();
