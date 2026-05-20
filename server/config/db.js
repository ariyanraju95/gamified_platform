const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Drop the old 'username' unique index if it still exists (migration: username → fullName)
    try {
      await conn.connection.collection('users').dropIndex('username_1');
      console.log('Migrated: dropped old username_1 index');
    } catch (_) {
      // Index doesn't exist — nothing to do
    }
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
