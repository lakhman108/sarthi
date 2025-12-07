const mongoose = require('mongoose');
require('dotenv').config();

const Lecture = require('../models/lecturemodel.js');

async function checkLectures() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[CHECK] Connected to MongoDB');

    const allLectures = await Lecture.find({});
    console.log(`[CHECK] Total lectures: ${allLectures.length}`);

    allLectures.forEach((lecture, index) => {
      console.log(`\n[LECTURE ${index + 1}]`);
      console.log(`  ID: ${lecture._id}`);
      console.log(`  Name: ${lecture.nameOfTopic}`);
      console.log(`  VideoLink: ${lecture.videoLink ? 'EXISTS' : 'MISSING'}`);
      console.log(`  ProcessingStatus: ${lecture.processingStatus || 'NOT SET'}`);
      console.log(`  JobId: ${lecture.jobId || 'NOT SET'}`);
    });

    // Count by status
    const statusCounts = await Lecture.aggregate([
      {
        $group: {
          _id: '$processingStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n[STATUS COUNTS]');
    statusCounts.forEach(status => {
      console.log(`  ${status._id || 'undefined'}: ${status.count}`);
    });

    await mongoose.connection.close();
    console.log('\n[CHECK] Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('[CHECK] Error:', error);
    process.exit(1);
  }
}

checkLectures();
