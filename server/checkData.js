import mongoose from 'mongoose';
import User from './models/User.js';
import Child from './models/Child.js';

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/nms-dev');
    
    const users = await User.find().select('firstName lastName role');
    console.log('\n📊 Users in database:', users.length);
    users.forEach((u, i) => console.log(`  ${i + 1}. ${u.firstName} ${u.lastName} (${u.role})`));
    
    const children = await Child.find().select('firstName lastName');
    console.log('\n👶 Children in database:', children.length);
    children.slice(0, 5).forEach((c, i) => console.log(`  ${i + 1}. ${c.firstName} ${c.lastName}`));
    
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
