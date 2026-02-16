import mongoose from 'mongoose';
import Staff from './models/Staff.js';

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/nms-dev');
    const staff = await Staff.find().select('position user');
    console.log('Staff found:', staff.length);
    staff.slice(0, 5).forEach((s, i) => console.log(`${i + 1}. Position: ${s.position}`));
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error:', e.message);
  }
})();
