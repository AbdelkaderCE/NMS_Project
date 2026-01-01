import mongoose from 'mongoose';
import Notification from './models/Notification.js';

async function cleanupOldLinks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nms');
    
    // Find and update any notifications with old links
    const result = await Notification.updateMany(
      { 
        link: '/notifications', 
        type: 'system', 
        title: /Absence Excuse/ 
      },
      { 
        $set: { link: '/absence-excuses' } 
      }
    );
    
    console.log('✅ Updated notifications:', result.modifiedCount);
    
    // Also find any with /absence-excuses that should exist
    const updated = await Notification.find({ link: '/absence-excuses' });
    console.log('✅ Total with correct link:', updated.length);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

cleanupOldLinks();
