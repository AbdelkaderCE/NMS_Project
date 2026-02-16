// Usage:
//  - Fix specific staff by email: node utils/diagnoseAndFixStaffAssignments.js <staffEmail>
//  - List all staff users: node utils/diagnoseAndFixStaffAssignments.js --list
//  - Search staff by name: node utils/diagnoseAndFixStaffAssignments.js --find "Jhon"
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Staff from '../models/Staff.js';
import Group from '../models/Group.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nursery_management';

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage:\n  node utils/diagnoseAndFixStaffAssignments.js <staffEmail>\n  node utils/diagnoseAndFixStaffAssignments.js --list\n  node utils/diagnoseAndFixStaffAssignments.js --find "NameOrEmailFragment"');
    process.exit(1);
  }

  await mongoose.connect(mongoUri, { autoIndex: false });
  console.log('Connected to MongoDB');

  // Handle list all staff
  if (arg === '--list') {
    const staffUsers = await User.find({ role: 'staff' }).select('email firstName lastName');
    if (staffUsers.length === 0) {
      console.log('No staff users found.');
    } else {
      console.log('Staff users:');
      staffUsers.forEach(u => console.log(`- ${u.firstName || ''} ${u.lastName || ''} <${u.email}>`));
    }
    await mongoose.disconnect();
    return;
  }

  // Handle find by name/email fragment
  if (arg === '--find') {
    const fragment = process.argv[3];
    if (!fragment) {
      console.error('Provide a name or email fragment. Example: node utils/diagnoseAndFixStaffAssignments.js --find "jhon"');
      process.exit(1);
    }
    const regex = new RegExp(fragment, 'i');
    const matches = await User.find({ role: 'staff', $or: [{ email: regex }, { firstName: regex }, { lastName: regex }] }).select('email firstName lastName');
    if (matches.length === 0) {
      console.log('No matching staff found for fragment:', fragment);
    } else {
      console.log('Matching staff:');
      matches.forEach(u => console.log(`- ${u.firstName || ''} ${u.lastName || ''} <${u.email}>`));
    }
    await mongoose.disconnect();
    return;
  }

  const email = arg;
  const user = await User.findOne({ email });
  if (!user) {
    console.error(`User not found for email: ${email}`);
    console.log('Tip: List staff with --list or search by name with --find.');
    process.exit(1);
  }

  if (user.role !== 'staff') {
    console.error(`User ${email} is not a staff role: ${user.role}`);
    process.exit(1);
  }

  const staff = await Staff.findOne({ user: user._id });
  if (!staff) {
    console.error(`Staff record not linked for user ${email}. Create Staff profile and position.`);
    process.exit(1);
  }

  console.log('Staff:', { id: staff._id.toString(), position: staff.position });
  console.log('Current assignedClasses:', staff.assignedClasses.map(id => id.toString()));

  // Find groups where this staff is instructor
  const instructorGroups = await Group.find({ instructors: staff._id }).select('_id name');
  console.log('Groups where staff is instructor:', instructorGroups.map(g => ({ id: g._id.toString(), name: g.name })));

  const instructorGroupIds = instructorGroups.map(g => g._id);

  // If mismatch, fix assignedClasses to match instructor groups
  const staffAssignedIds = staff.assignedClasses.map(id => id.toString());
  const instructorAssignedIds = instructorGroupIds.map(id => id.toString());

  const mismatch = JSON.stringify(staffAssignedIds.sort()) !== JSON.stringify(instructorAssignedIds.sort());
  if (mismatch) {
    console.log('Mismatch detected. Updating Staff.assignedClasses to match Group.instructors...');
    staff.assignedClasses = instructorGroupIds;
    await staff.save();
    console.log('Updated assignedClasses:', staff.assignedClasses.map(id => id.toString()));
  } else {
    console.log('assignedClasses already matches instructor groups. No changes made.');
  }

  await mongoose.disconnect();
  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
