import mongoose from 'mongoose';
import Child from './models/Child.js';
import Group from './models/Group.js';
import Class from './models/Class.js';

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/nms-dev');
    console.log('\n🔍 Checking Data Model\n');
    
    // Get a child
    const child = await Child.findOne().populate('assignedClass').populate('assignedGroup');
    
    if (child) {
      console.log('👶 Child:', child.firstName);
      console.log('  assignedClass ID:', child.assignedClass?._id);
      console.log('  assignedClass is actually a:', child.assignedClass?.constructor.modelName);
      console.log('  assignedClass data:', child.assignedClass);
      console.log('\n  assignedGroup ID:', child.assignedGroup?._id);
      console.log('  assignedGroup is actually a:', child.assignedGroup?.constructor.modelName);
      console.log('  assignedGroup data:', child.assignedGroup);
    }
    
    // Check what Groups look like
    console.log('\n📚 Sample Group:');
    const group = await Group.findOne().populate('class');
    if (group) {
      console.log('  Name:', group.name);
      console.log('  _id:', group._id);
      console.log('  class field:', group.class);
      console.log('  class populated:', group.class);
    }
    
    // Check what Classes look like
    console.log('\n🏫 Sample Class:');
    const classDoc = await Class.findOne();
    if (classDoc) {
      console.log('  Name:', classDoc.name);
      console.log('  _id:', classDoc._id);
    }
    
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e);
    await mongoose.disconnect();
  }
})();
