import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to:', mongoose.connection.name);
    
    // Direct collection queries (no model dependencies)
    const db = mongoose.connection.db;
    
    // List all collection names
    const collections = await db.listCollections().toArray();
    console.log('\n📁 All collections:');
    collections.forEach(c => console.log(`  - ${c.name}`));
    
    const staffCount = await db.collection('staff').countDocuments();
    const staffsCount = await db.collection('staffs').countDocuments();
    const childrenCount = await db.collection('children').countDocuments();
    const classesCount = await db.collection('classes').countDocuments();
    const usersCount = await db.collection('users').countDocuments();
    
    console.log('\n📊 Collections:');
    console.log(`Users: ${usersCount}`);
    console.log(`Staff: ${staffCount}`);
    console.log(`Staffs: ${staffsCount}`);
    console.log(`Children: ${childrenCount}`);
    console.log(`Classes: ${classesCount}`);
    
    // Check if children have assignedClass
    const childrenWithClass = await db.collection('children').find({ assignedClass: { $exists: true, $ne: null } }).toArray();
    console.log(`\nChildren with assignedClass: ${childrenWithClass.length}`);
    
    if (childrenWithClass.length > 0) {
      console.log('\nSample child:');
      console.log(JSON.stringify(childrenWithClass[0], null, 2));
    }
    
    // Check staff assigned classes
    const staffWithClasses = await db.collection('staffs').find({ assignedClasses: { $exists: true, $ne: [] } }).toArray();
    console.log(`\nStaff with assignedClasses: ${staffWithClasses.length}`);
    
    const allStaff = await db.collection('staffs').find({}).toArray();
    console.log(`Total staff records: ${allStaff.length}`);
    
    if (allStaff.length > 0) {
      console.log('\nAll staff:');
      allStaff.forEach(s => {
        console.log(`  ${s._id} - ${s.position} - assignedClasses: ${s.assignedClasses?.length || 0}`);
      });
    }
    
    // Check staff users
    const staffUsers = await db.collection('users').find({ role: 'staff' }).toArray();
    console.log(`\nStaff users: ${staffUsers.length}`);
    if (staffUsers.length > 0) {
      console.log('Staff user emails:');
      staffUsers.forEach(u => console.log(`  ${u.email}`));
    }
    
    if (staffWithClasses.length > 0) {
      console.log('\nSample staff with classes:');
      console.log(JSON.stringify({
        _id: staffWithClasses[0]._id,
        position: staffWithClasses[0].position,
        assignedClasses: staffWithClasses[0].assignedClasses
      }, null, 2));
    }
    
    // List all class IDs
    const classes = await db.collection('classes').find({}).toArray();
    console.log('\n📚 All class IDs:');
    classes.forEach(c => console.log(`  ${c._id} - ${c.name}`));
    
        // Check specific user ID from the logs
        const testUserId = '6932b48ff3b7f0bdca1caeba';
        console.log(`\n🔍 Checking user ID: ${testUserId}`);
    
        const user = await db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(testUserId) });
        console.log('User found:', user ? `${user.email} (${user.role})` : 'NOT FOUND');
    
        if (user && user.role === 'staff') {
          const staffRecord = await db.collection('staffs').findOne({ user: new mongoose.Types.ObjectId(testUserId) });
          console.log('Staff record:', staffRecord ? `Position: ${staffRecord.position}, Classes: ${staffRecord.assignedClasses?.length || 0}` : 'NOT FOUND');
      
          if (staffRecord && staffRecord.assignedClasses?.length > 0) {
            console.log('\n📚 Staff assigned class IDs:');
            staffRecord.assignedClasses.forEach(classId => console.log(`  ${classId}`));
        
            const childrenInClasses = await db.collection('children').find({ 
              assignedClass: { $in: staffRecord.assignedClasses } 
            }).toArray();
            console.log(`\n👶 Children in staff's classes: ${childrenInClasses.length}`);
            if (childrenInClasses.length > 0) {
              console.log('Sample children:');
              childrenInClasses.slice(0, 3).forEach(c => 
                console.log(`  ${c._id} - ${c.firstName} ${c.lastName} (Class: ${c.assignedClass})`)
              );
            }
          }
        }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkDB();
