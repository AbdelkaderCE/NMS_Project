import mongoose from 'mongoose';
import User from './models/User.js';
import Staff from './models/Staff.js';
import Child from './models/Child.js';
import Group from './models/Group.js';
import Class from './models/Class.js';

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/nms-dev');
    console.log('\n🔍 DEBUG: Teacher Data Isolation\n');
    
    // Find teacher user
    const teacherUser = await User.findOne({ 
      role: 'staff',
      firstName: 'Staff1' // Change this to your teacher's name
    });
    
    if (!teacherUser) {
      console.log('❌ Teacher user not found. Looking for all staff...');
      const allStaff = await User.find({ role: 'staff' });
      console.log('Available staff:', allStaff.map(s => `${s.firstName} ${s.lastName}`));
      await mongoose.disconnect();
      return;
    }
    
    console.log('👤 Teacher User:', {
      id: teacherUser._id,
      name: `${teacherUser.firstName} ${teacherUser.lastName}`,
      email: teacherUser.email
    });
    
    // Find staff record
    const staffRecord = await Staff.findOne({ user: teacherUser._id });
    
    if (!staffRecord) {
      console.log('\n❌ Staff record not found for this user!');
      await mongoose.disconnect();
      return;
    }
    
    console.log('\n📋 Staff Record:', {
      id: staffRecord._id,
      position: staffRecord.position,
      assignedClasses: staffRecord.assignedClasses?.length || 0,
      assignedClassIds: staffRecord.assignedClasses
    });
    
    // assignedClasses contains Class IDs directly (not Group IDs)
    const classIds = staffRecord.assignedClasses || [];
    console.log('\n🎯 Class IDs from staff record:', classIds);
    
    // Show assigned classes
    if (classIds.length > 0) {
      console.log('\n📚 Assigned Classes:');
      for (const classId of classIds) {
        const classDoc = await Class.findById(classId);
        if (classDoc) {
          console.log(`  - ${classDoc.name} (ID: ${classDoc._id})`);
          
          // Find groups for this class
          const groupsInClass = await Group.find({ class: classId });
          console.log(`    Groups in this class: ${groupsInClass.length}`);
          groupsInClass.forEach(g => {
            console.log(`      - ${g.name} (ID: ${g._id})`);
          });
          
          // Find children in this class
          const childrenInClass = await Child.find({ assignedClass: classId });
          console.log(`    Children in this class: ${childrenInClass.length}`);
          childrenInClass.forEach(c => {
            console.log(`      - ${c.firstName} ${c.lastName}`);
          });
        }
      }
      
      // Total children teacher should see
      const allChildren = await Child.find({ assignedClass: { $in: classIds } });
      console.log('\n👶 TOTAL children teacher should see:', allChildren.length);
      
    } else {
      console.log('\n⚠️  No assigned classes!');
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Debug complete');
  } catch (e) {
    console.error('❌ Error:', e.message);
    console.error(e.stack);
    await mongoose.disconnect();
  }
})();
