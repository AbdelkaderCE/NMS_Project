import mongoose from 'mongoose';
import User from './models/User.js';
import Staff from './models/Staff.js';

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/nms-dev');
    
    // Check if staff users exist
    const staffUsers = await User.find({ role: 'staff' }).select('firstName lastName position');
    console.log('\n👥 Staff users found:', staffUsers.length);
    staffUsers.forEach((u, i) => console.log(`  ${i + 1}. ${u.firstName} ${u.lastName}`));
    
    // Check Staff collection
    const allStaff = await Staff.countDocuments();
    console.log('\n📊 Staff documents in collection:', allStaff);
    
    // Get first user
    if (staffUsers.length > 0) {
      const firstStaff = staffUsers[0];
      console.log('\nFirst staff user ID:', firstStaff._id);
      
      // Try to find Staff by user ID
      const staffByUser = await Staff.findOne({ user: firstStaff._id });
      console.log('Staff record for this user:', staffByUser ? 'FOUND' : 'NOT FOUND');
    }
    
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
    console.error(e.stack);
  }
})();
