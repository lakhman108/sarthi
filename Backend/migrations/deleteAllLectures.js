const mongoose = require('mongoose');
require('dotenv').config();

const Lecture = require('../models/lecturemodel.js');

async function deleteAllLectures() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[DELETE] Connected to MongoDB');

    // Count lectures before deletion
    const count = await Lecture.countDocuments();
    console.log(`[DELETE] Found ${count} lectures to delete`);

    if (count === 0) {
      console.log('[DELETE] No lectures to delete');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Delete all lectures
    const result = await Lecture.deleteMany({});
    console.log(`[DELETE] Successfully deleted ${result.deletedCount} lectures`);

    await mongoose.connection.close();
    console.log('[DELETE] Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('[DELETE] Error:', error);
    process.exit(1);
  }
}

deleteAllLectures();
