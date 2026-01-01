import mongoose from 'mongoose';
import User from './models/User.js';
import Notification from './models/Notification.js';

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/nms-dev');
    console.log('\n🔍 Checking User Notifications\n');
    
    // Get parent user (John Developer)
    const parent = await User.findOne({ email: 'parent@school.dev' });
    console.log('👤 Parent User:');
    console.log(`   ID: ${parent._id}`);
    console.log(`   Name: ${parent.firstName} ${parent.lastName}`);
    console.log(`   Email: ${parent.email}`);
    
    // Get teacher user (Staff1)
    const teacher = await User.findOne({ email: 'staff1.user@school.dev' });
    console.log('\n👨‍🏫 Teacher User:');
    console.log(`   ID: ${teacher._id}`);
    console.log(`   Name: ${teacher.firstName} ${teacher.lastName}`);
    console.log(`   Email: ${teacher.email}`);
    
    // Get notifications for parent
    const parentNotifs = await Notification.find({ recipient: parent._id })
      .sort({ createdAt: -1 })
      .limit(5);
    console.log(`\n📬 Parent Notifications (${parentNotifs.length}):`);
    parentNotifs.forEach((n, i) => {
      console.log(`\n${i + 1}. ${n.title}`);
      console.log(`   Message: ${n.message}`);
      console.log(`   Read: ${n.read}`);
      console.log(`   Created: ${n.createdAt}`);
    });
    
    // Get notifications for teacher
    const teacherNotifs = await Notification.find({ recipient: teacher._id })
      .sort({ createdAt: -1 })
      .limit(5);
    console.log(`\n📬 Teacher Notifications (${teacherNotifs.length}):`);
    teacherNotifs.forEach((n, i) => {
      console.log(`\n${i + 1}. ${n.title}`);
      console.log(`   Message: ${n.message}`);
      console.log(`   Read: ${n.read}`);
      console.log(`   Created: ${n.createdAt}`);
    });
    
    await mongoose.disconnect();
    console.log('\n✅ Check complete');
  } catch (e) {
    console.error('❌ Error:', e);
    await mongoose.disconnect();
  }
})();
