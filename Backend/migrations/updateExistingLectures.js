const mongoose = require('mongoose');
require('dotenv').config();

const Lecture = require('../models/lecturemodel.js');

async function migrateExistingLectures() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[MIGRATION] Connected to MongoDB');

    // Find all lectures that have a videoLink but no processingStatus or status is 'pending'
    const result = await Lecture.updateMany(
      {
        videoLink: { $exists: true, $ne: null, $ne: '' },
        $or: [
          { processingStatus: { $exists: false } },
          { processingStatus: 'pending' }
        ]
      },
      {
        $set: {
          processingStatus: 'completed'
        }
      }
    );

    console.log(`[MIGRATION] Updated ${result.modifiedCount} existing lectures to 'completed' status`);
    console.log('[MIGRATION] Migration completed successfully');

    await mongoose.connection.close();
    console.log('[MIGRATION] Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('[MIGRATION] Error:', error);
    process.exit(1);
  }
}

migrateExistingLectures();
