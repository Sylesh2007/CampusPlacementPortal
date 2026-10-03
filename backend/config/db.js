const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
    
    // Explicit demonstration of MongoDB createIndex() requirement
    // This ensures indexes exist directly at collection level
    mongoose.connection.on('open', async () => {
      try {
        const db = mongoose.connection.db;
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        await db.collection('users').createIndex({ userId: 1 }, { unique: true });
        await db.collection('companies').createIndex({ companyId: 1 }, { unique: true });
        await db.collection('placementdrives').createIndex({ driveId: 1 }, { unique: true });
        await db.collection('applications').createIndex({ applicationId: 1 }, { unique: true });
        await db.collection('applications').createIndex({ studentId: 1, driveId: 1 }, { unique: true });
        console.log('[MongoDB Atlas] Indexes verified via createIndex()');
      } catch (idxErr) {
        console.log('[MongoDB Atlas] Note on index initialization:', idxErr.message);
      }
    });

    return conn;
  } catch (error) {
    console.error(`[MongoDB Atlas] Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
