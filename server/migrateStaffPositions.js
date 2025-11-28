/**
 * Database Migration Script
 * Purpose: Update staff positions to new 5-position system
 * 
 * OLD POSITIONS: teacher, assistant, nurse, cook, cleaner, manager
 * NEW POSITIONS: teacher, assistant, manager, nurse, receptionist
 * 
 * CHANGES:
 * - cook → receptionist (customer service role)
 * - cleaner → assistant (support role)
 * 
 * Run this ONCE after deploying the new position constants
 */

import mongoose from 'mongoose';
import Staff from './models/Staff.js';
import dotenv from 'dotenv';

dotenv.config();

const migrateStaffPositions = async () => {
  try {
    console.log('🔄 Starting staff position migration...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Find all staff with old positions
    const staffWithOldPositions = await Staff.find({
      position: { $in: ['cook', 'cleaner', 'maintenance', 'security', 'accountant'] }
    });

    console.log(`\n📊 Found ${staffWithOldPositions.length} staff members with old positions:`);
    staffWithOldPositions.forEach(staff => {
      console.log(`   - ${staff.user.firstName || 'Unknown'} (${staff.position})`);
    });

    if (staffWithOldPositions.length === 0) {
      console.log('\n✅ No migration needed - all staff have valid positions');
      process.exit(0);
    }

    // 2. Migrate cook → receptionist
    const cookResult = await Staff.updateMany(
      { position: 'cook' },
      { $set: { position: 'receptionist' } }
    );
    console.log(`\n✅ Migrated ${cookResult.modifiedCount} cook(s) → receptionist`);

    // 3. Migrate cleaner → assistant
    const cleanerResult = await Staff.updateMany(
      { position: 'cleaner' },
      { $set: { position: 'assistant' } }
    );
    console.log(`✅ Migrated ${cleanerResult.modifiedCount} cleaner(s) → assistant`);

    // 4. Migrate other old positions → assistant (default support role)
    const otherResult = await Staff.updateMany(
      { position: { $in: ['maintenance', 'security', 'accountant'] } },
      { $set: { position: 'assistant' } }
    );
    console.log(`✅ Migrated ${otherResult.modifiedCount} other position(s) → assistant`);

    // 5. Verify current positions
    const currentPositions = await Staff.aggregate([
      {
        $group: {
          _id: '$position',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Current Position Distribution:');
    currentPositions.forEach(pos => {
      console.log(`   ${pos._id}: ${pos.count} staff members`);
    });

    // 6. Check for any invalid positions
    const invalidPositions = await Staff.find({
      position: { $nin: ['teacher', 'assistant', 'manager', 'nurse', 'receptionist'] }
    });

    if (invalidPositions.length > 0) {
      console.warn('\n⚠️  WARNING: Found staff with invalid positions:');
      invalidPositions.forEach(staff => {
        console.warn(`   - ${staff.employeeId}: ${staff.position}`);
      });
      console.warn('   Please update these manually.');
    } else {
      console.log('\n✅ All staff positions are now valid!');
    }

    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run migration
migrateStaffPositions();

/**
 * MANUAL USAGE:
 * 
 * 1. Make sure your .env file has MONGODB_URI set
 * 2. Run: node migrateStaffPositions.js
 * 3. Verify the output
 * 4. Restart your server
 * 
 * ROLLBACK (if needed):
 * 
 * If you need to rollback, run these MongoDB commands:
 * 
 * db.staff.updateMany(
 *   { position: 'receptionist' },
 *   { $set: { position: 'cook' } }
 * );
 * 
 * db.staff.updateMany(
 *   { position: 'assistant', hireDate: { $gte: ISODate('2025-11-28') } },
 *   { $set: { position: 'cleaner' } }
 * );
 */
