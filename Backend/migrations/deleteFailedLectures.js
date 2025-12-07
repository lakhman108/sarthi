const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Lecture = require('../models/lecturemodel.js');

async function deleteFailedLectures() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[DELETE] Connected to MongoDB\n');

    const failedLectures = await Lecture.find({ 
      processingStatus: 'failed' 
    });
    
    console.log(`[DELETE] Found ${failedLectures.length} failed lectures\n`);

    if (failedLectures.length === 0) {
      console.log('[DELETE] No failed lectures to delete');
      await mongoose.connection.close();
      process.exit(0);
    }

    failedLectures.forEach((lecture, index) => {
      console.log(`[FAILED LECTURE ${index + 1}]`);
      console.log(`  ID: ${lecture._id}`);
      console.log(`  Name: ${lecture.nameOfTopic}`);
      console.log(`  Course ID: ${lecture.courseId}`);
      console.log(`  Job ID: ${lecture.jobId}`);
      console.log(`  Error: ${lecture.processingError || 'No error message'}`);
      console.log('');
    });

    const result = await Lecture.deleteMany({ 
      processingStatus: 'failed' 
    });
    
    console.log(`[DELETE] Successfully deleted ${result.deletedCount} failed lectures\n`);

    const remainingLectures = await Lecture.find({});
    const statusCounts = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0
    };

    remainingLectures.forEach(lecture => {
      statusCounts[lecture.processingStatus]++;
    });

    console.log(`[STATUS] Remaining lectures: ${remainingLectures.length}`);
    console.log('\nFinal Status:');
    console.log(`  Pending: ${statusCounts.pending}`);
    console.log(`  Processing: ${statusCounts.processing}`);
    console.log(`  Completed: ${statusCounts.completed}`);
    console.log(`  Failed: ${statusCounts.failed}`);

    await mongoose.connection.close();
    console.log('\n[DELETE] Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('[DELETE] Error:', error);
    process.exit(1);
  }
}

deleteFailedLectures();
