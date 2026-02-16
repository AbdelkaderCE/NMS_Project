import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nursery_management';

async function reset() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    const db = mongoose.connection.db;
    const dbName = db.databaseName;
    console.log(`Connected. Dropping database '${dbName}'...`);
    await db.dropDatabase();
    console.log('✅ Database dropped successfully.');
  } catch (err) {
    console.error('❌ Failed to drop database:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

reset();
