import mongoose from 'mongoose';
import Attendance from './models/Attendance.js';
import Activity from './models/Activity.js';

async function cleanupTodayRecords() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/nms-dev';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Delete attendance records from today
    const deletedAttendance = await Attendance.deleteMany({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    console.log(`✅ Deleted ${deletedAttendance.deletedCount} attendance records from today`);

    // Delete activity records from today
    const deletedActivities = await Activity.deleteMany({
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });
    console.log(`✅ Deleted ${deletedActivities.deletedCount} activity records from today`);

    console.log('\n✅ Cleanup complete! You can now test fresh.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupTodayRecords();
