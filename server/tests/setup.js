/**
 * Jest Setup File
 * Configures testing environment before running tests
 */

import mongoose from 'mongoose';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nms-test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Disconnect mongoose after all tests
afterAll(async () => {
  try {
    await mongoose.connection.close();
  } catch (err) {
    console.error('Error closing mongoose connection:', err);
  }
});
