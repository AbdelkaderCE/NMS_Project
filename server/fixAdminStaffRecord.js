import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fixAdminStaffRecord = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to:', mongoose.connection.name);
    
    const db = mongoose.connection.db;
    
    // Find admin user
    const adminUser = await db.collection('users').findOne({ email: 'admin@school.dev' });
    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log(`Found admin user: ${adminUser._id}`);
    
    // Check if admin has staff record
    const adminStaffRecord = await db.collection('staffs').findOne({ user: adminUser._id });
    
    if (adminStaffRecord) {
      console.log(`⚠️  Admin has staff record with position: ${adminStaffRecord.position}`);
      console.log('Deleting incorrect staff record...');
      
      await db.collection('staffs').deleteOne({ _id: adminStaffRecord._id });
      console.log('✅ Admin staff record deleted');
    } else {
      console.log('✅ Admin has no staff record (correct)');
    }
    
    mongoose.connection.close();
    console.log('\n✨ Fix complete!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixAdminStaffRecord();
