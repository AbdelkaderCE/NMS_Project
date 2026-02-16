import mongoose from 'mongoose';
import User from './models/User.js';
import Staff from './models/Staff.js';
import Child from './models/Child.js';
import Notification from './models/Notification.js';
import Attendance from './models/Attendance.js';
import AbsenceExcuse from './models/AbsenceExcuse.js';

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/nms-dev');
    console.log('\n🔍 Checking Notifications\n');
    
    // Check recent notifications
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('recipient', 'firstName lastName email role');
    
    console.log(`📬 Recent Notifications (${notifications.length}):`);
    notifications.forEach((n, i) => {
      console.log(`\n${i + 1}. ${n.title}`);
      console.log(`   To: ${n.recipient?.firstName} ${n.recipient?.lastName} (${n.recipient?.role})`);
      console.log(`   Message: ${n.message}`);
      console.log(`   Type: ${n.type}`);
      console.log(`   Read: ${n.isRead ? 'Yes' : 'No'}`);
      console.log(`   Created: ${n.createdAt}`);
    });
    
    // Check recent attendance records
    console.log('\n\n📋 Recent Attendance Records:');
    const attendances = await Attendance.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('child', 'firstName lastName parents')
      .populate({
        path: 'child',
        populate: {
          path: 'parents.parent',
          select: 'firstName lastName email'
        }
      });
    
    attendances.forEach((a, i) => {
      console.log(`\n${i + 1}. ${a.child?.firstName} ${a.child?.lastName}`);
      console.log(`   Status: ${a.status}`);
      console.log(`   Date: ${a.date}`);
      console.log(`   Parents: ${a.child?.parents?.length || 0}`);
      a.child?.parents?.forEach(p => {
        console.log(`     - ${p.parent?.firstName} ${p.parent?.lastName} (${p.parent?.email})`);
      });
    });
    
    // Check absence excuses
    console.log('\n\n📝 Recent Absence Excuses:');
    const excuses = await AbsenceExcuse.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('child', 'firstName lastName assignedClass')
      .populate('submittedBy', 'firstName lastName email');
    
    excuses.forEach((e, i) => {
      console.log(`\n${i + 1}. ${e.child?.firstName} ${e.child?.lastName}`);
      console.log(`   Date: ${e.absenceDate}`);
      console.log(`   Reason: ${e.reason}`);
      console.log(`   Status: ${e.status}`);
      console.log(`   Submitted by: ${e.submittedBy?.firstName} ${e.submittedBy?.lastName}`);
      console.log(`   Child's class: ${e.child?.assignedClass}`);
    });
    
    // Check which teachers should be notified
    if (excuses.length > 0) {
      const firstExcuse = excuses[0];
      if (firstExcuse.child?.assignedClass) {
        console.log(`\n\n🎓 Teachers assigned to class ${firstExcuse.child.assignedClass}:`);
        const teachers = await Staff.find({
          assignedClasses: firstExcuse.child.assignedClass
        }).populate('user', 'firstName lastName email');
        
        teachers.forEach(t => {
          console.log(`   - ${t.user?.firstName} ${t.user?.lastName} (${t.user?.email})`);
        });
      }
    }
    
    await mongoose.disconnect();
    console.log('\n\n✅ Check complete');
  } catch (e) {
    console.error('❌ Error:', e);
    await mongoose.disconnect();
  }
})();
