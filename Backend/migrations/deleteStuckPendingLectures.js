const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Lecture = require('../models/lecturemodel.js');

async function deleteStuckPendingLectures() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('[DELETE] Connected to MongoDB\n');

    const stuckLectures = await Lecture.find({ 
      processingStatus: { $in: ['pending', 'processing'] },
      videoLink: { $in: [null, ''] }
    });
    
    console.log(`[DELETE] Found ${stuckLectures.length} stuck lectures\n`);

    if (stuckLectures.length === 0) {
      console.log('[DELETE] No stuck lectures to delete');
      await mongoose.connection.close();
      process.exit(0);
    }

    stuckLectures.forEach((lecture, index) => {
      console.log(`[STUCK LECTURE ${index + 1}]`);
      console.log(`  ID: ${lecture._id}`);
      console.log(`  Name: ${lecture.nameOfTopic}`);
      console.log(`  Status: ${lecture.processingStatus}`);
      console.log(`  Job ID: ${lecture.jobId}`);
      console.log('');
    });

    const result = await Lecture.deleteMany({ 
      processingStatus: { $in: ['pending', 'processing'] },
      videoLink: { $in: [null, ''] }
    });
    
    console.log(`[DELETE] Successfully deleted ${result.deletedCount} stuck lectures\n`);

    const remainingLectures = await Lecture.find({});
    console.log(`[STATUS] Remaining lectures: ${remainingLectures.length}`);

    await mongoose.connection.close();
    console.log('\n[DELETE] Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('[DELETE] Error:', error);
    process.exit(1);
  }
}

deleteStuckPendingLectures();
